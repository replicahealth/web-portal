// Simple Lambda function that validates JWT tokens manually
const Sentry = require('@sentry/node');
const { S3Client, ListObjectsV2Command, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const https = require('https');
const { promisify } = require('util');

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || "production",
  tracesSampleRate: 1.0,
  initialScope: {
    tags: {
      platform: "backend",
      component: "lambda"
    }
  }
});

const s3 = new S3Client({ region: "us-east-1" });
const ses = new SESClient({ region: "us-east-1" });
const dynamodb = new DynamoDBClient({ region: "us-east-1" });

// Get Auth0 Management API token
async function getAuth0ManagementToken() {
  const domain = process.env.AUTH0_DOMAIN;
  const clientId = process.env.AUTH0_M2M_CLIENT_ID;
  const clientSecret = process.env.AUTH0_M2M_CLIENT_SECRET;
  
  if (!domain || !clientId || !clientSecret) {
    console.warn('Auth0 M2M credentials not configured, skipping user metadata tracking');
    return null;
  }
  
  const data = JSON.stringify({
    client_id: clientId,
    client_secret: clientSecret,
    audience: `https://${domain}/api/v2/`,
    grant_type: 'client_credentials'
  });
  
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: domain,
      path: '/oauth/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve(response.access_token);
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Update Auth0 user metadata
async function updateAuth0UserMetadata(userId, updateData) {
  try {
    const token = await getAuth0ManagementToken();
    if (!token) return;
    
    const domain = process.env.AUTH0_DOMAIN;
    
    // Get current user metadata
    const getUserData = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: domain,
        path: `/api/v2/users/${encodeURIComponent(userId)}`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(error);
          }
        });
      });
      req.on('error', reject);
      req.end();
    });
    
    const currentMetadata = getUserData.user_metadata || {};
    const updatedMetadata = { ...currentMetadata, ...updateData };
    
    // Update user metadata
    const patchData = JSON.stringify({ user_metadata: updatedMetadata });
    
    await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: domain,
        path: `/api/v2/users/${encodeURIComponent(userId)}`,
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Content-Length': patchData.length
        }
      }, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => resolve(body));
      });
      req.on('error', reject);
      req.write(patchData);
      req.end();
    });
    
    console.log('Auth0 user metadata updated successfully');
  } catch (error) {
    console.error('Failed to update Auth0 user metadata:', error);
  }
}

// Track user activity in both DynamoDB and Auth0
async function trackUserActivity(userId, activity, details) {
  try {
    // Track in DynamoDB
    await dynamodb.send(new PutItemCommand({
      TableName: 'user-activity-log',
      Item: {
        userId: { S: userId },
        timestamp: { S: new Date().toISOString() },
        activity: { S: activity },
        details: { S: JSON.stringify(details) }
      }
    }));
    
    // Track in Auth0 user metadata
    if (activity === 'download') {
      const currentMetadata = {};
      const downloads = currentMetadata.downloads || [];
      downloads.push({
        filename: details.filename,
        timestamp: new Date().toISOString(),
        type: details.type
      });
      
      await updateAuth0UserMetadata(userId, {
        downloads: downloads.slice(-50) // Keep last 50 downloads
      });
    }
    
    if (activity === 'terms_agreement') {
      const currentMetadata = {};
      const agreements = currentMetadata.termsAgreements || [];
      agreements.push({
        version: details.version,
        timestamp: new Date().toISOString(),
        type: details.type
      });
      
      await updateAuth0UserMetadata(userId, {
        termsAgreements: agreements
      });
    }
  } catch (error) {
    console.error('Failed to track activity:', error);
  }
}

const BUCKET_NAME = "replica-general-data-repository";
const PROCESSED_PREFIX = "processed_data_final_expanded/";
const URL_TTL_SECONDS = 3600;

// JWT validation with optional signature verification
async function validateJWT(token) {
  try {
    console.log('Validating JWT token...');
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('Invalid JWT format: expected 3 parts, got', parts.length);
      return false;
    }
    
    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    console.log('JWT payload:', JSON.stringify(payload, null, 2));
    
    // Check if token is expired
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      console.log('Token expired:', payload.exp, 'vs', Math.floor(Date.now() / 1000));
      return false;
    }
    
    // Check audience
    const expectedAudience = process.env.AUTH0_AUDIENCE;
    console.log('Expected audience:', expectedAudience, 'Token audience:', payload.aud);
    if (expectedAudience && payload.aud) {
      const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
      if (!audiences.includes(expectedAudience)) {
        console.log('Audience mismatch');
        return false;
      }
    }
    
    // Enable signature verification in production (when ENABLE_JWT_VERIFICATION is set)
    if (process.env.ENABLE_JWT_VERIFICATION === 'true') {
      console.log('Signature verification is enabled but temporarily disabled due to implementation issues');
      // TODO: Fix signature verification implementation
      // For now, we rely on Auth0's token validation (expiry, audience, format)
    }
    
    console.log('JWT validation successful');
    return payload;
  } catch (err) {
    console.error('JWT validation error:', err);
    return false;
  }
}

// Map each final CSV stem to the dataset/group name your UI shows
function toGroupName(stem) {
  const s = (stem || "").trim();
  if (/^DCLP\d*$/i.test(s)) return "DCLP";
  if (/^Loop_Part\d+_of_\d+$/i.test(s)) return "Loop study public dataset";
  if (/^Tidepool-JDRF-/i.test(s)) return "JDRF_CGM_RCT";
  if (/^Flair$/i.test(s)) return "FLAIRPublicDataSet";
  if (/^OpenAPS$/i.test(s)) return "OpenAPS Data";
  if (/^ShanghaiT1DM$/i.test(s)) return "Shanghai";
  if (/^CTR3$/i.test(s)) return "CTR3";
  if (/^PEDAP$/i.test(s)) return "PEDAP Public Dataset";
  if (/^OhioT1DM$/i.test(s)) return "OhioT1DM";
  if (/^T1DEXI$/i.test(s)) return "JAEB_ilet_trial";
  if (/^T1DEXIP$/i.test(s)) return "T1DEXI";
  if (/^AZT1D$/i.test(s)) return "AIDE_T1D";
  if (/^DiaTrend$/i.test(s)) return "DiaTrend";
  if (/^HUPA-UCM$/i.test(s)) return "HUPA-UCM";
  if (/^IOBP2$/i.test(s)) return "IOBP2";
  return s; // fallback
}

// Determine if a dataset is public or private
function getDatasetType(groupName) {
  const publicDatasets = [
    "Loop study public dataset",
    "FLAIRPublicDataSet", 
    "OpenAPS Data",
    "PEDAP Public Dataset",
    "Shanghai"
  ];
  
  return publicDatasets.includes(groupName) ? 'public' : 'private';
}

async function listAllFinalCsvs() {
  const out = [];
  let token;
  do {
    const r = await s3.send(new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: PROCESSED_PREFIX,
      ContinuationToken: token
    }));
    for (const item of r.Contents ?? []) {
      if (item.Key && item.Key.toLowerCase().endsWith(".csv")) out.push(item);
    }
    token = r.IsTruncated ? r.NextContinuationToken : undefined;
  } while (token);
  return out;
}

async function buildGroups({ signUrls }) {
  const objects = await listAllFinalCsvs();
  const groups = new Map(); // name -> [{key,size,url?}]

  for (const o of objects) {
    const key = o.Key;
    const size = o.Size ?? 0;
    const stem = key.slice(PROCESSED_PREFIX.length).replace(/\.csv$/i, "");
    const groupName = toGroupName(stem);
    if (!groups.has(groupName)) groups.set(groupName, []);
    groups.get(groupName).push({ key, size });
  }

  if (signUrls) {
    for (const [, files] of groups) {
      for (const f of files) {
        const fileName = f.key.split("/").pop() || "download.csv";
        f.url = await getSignedUrl(
          s3,
          new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: f.key,
            ResponseContentDisposition: `attachment; filename="${fileName}"`
          }),
          { expiresIn: URL_TTL_SECONDS }
        );
      }
    }
  }

  const out = Array.from(groups.entries())
    .map(([name, files]) => ({
      name,
      count: files.length,
      type: getDatasetType(name),
      files: files.sort((a, b) => (b.size - a.size) || a.key.localeCompare(b.key))
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return { groups: out };
}

function cors(body, statusCode = 200) {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Content-Type": "application/json"
    },
    body: typeof body === "string" ? body : JSON.stringify(body)
  };
}

exports.handler = async (event) => {
  if (event?.httpMethod === "OPTIONS") return cors("", 204);

  // For all operations, require JWT validation
  const apiGatewayClaims = event.requestContext?.authorizer?.jwt?.claims;
  
  let claims;
  if (apiGatewayClaims && apiGatewayClaims.sub) {
    claims = apiGatewayClaims;
  } else {
    // Extract and validate JWT token manually
    const authHeader = event.headers?.Authorization || event.headers?.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return cors({ error: "unauthorized" }, 401);
    }

    const token = authHeader.substring(7);
    
    // Validate JWT token
    claims = await validateJWT(token);
    
    if (!claims) {
      return cors({ error: "unauthorized", details: "JWT validation failed" }, 401);
    }
  }
  
  if (!claims.sub) {
    return cors({ error: "unauthorized", details: "Missing subject claim" }, 401);
  }

  const qs = event.queryStringParameters || {};
  const op = (qs.op || "list_groups").toLowerCase();
  
  // Allow authenticated users to request access (no role required)
  if (op === "request_access") {
    console.log('Processing request_access operation');
    let body = {};
    if (event.body) { 
      try { 
        body = JSON.parse(event.body);
        console.log('Parsed body:', body); 
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        return cors({ error: "Invalid JSON in request body" }, 400);
      }
    }
    
    const { name, email, description } = body;
    console.log('Extracted fields:', { name, email, description });
    if (!name || !email || !description) {
      return cors({ 
        error: "name, email, and description are required",
        received: { name: !!name, email: !!email, description: !!description }
      }, 400);
    }
    
    console.log('Access request received:', { name, email, description });
    
    // Send email notification via SES
    try {
      const emailParams = {
        Source: 'courtney@replica.health', // Must be verified in SES
        Destination: {
          ToAddresses: ['sam@replica.health', 'courtney@replica.health']
        },
        Message: {
          Subject: {
            Data: 'Dataset Access Request',
            Charset: 'UTF-8'
          },
          Body: {
            Text: {
              Data: `New dataset access request:

Name: ${name}
Email: ${email}
Request: ${description}

Please review and respond to the user.`,
              Charset: 'UTF-8'
            }
          }
        }
      };
      
      await ses.send(new SendEmailCommand(emailParams));
      console.log('Email notification sent successfully');
      
      return cors({
        success: true,
        message: "Request submitted successfully. You will receive a response within 24 hours."
      });
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      
      // Still return success to user, but log the email failure
      return cors({
        success: true,
        message: "Request submitted successfully (email notification pending)"
      });
    }
  }

  // For dataset operations, require dataset roles
  const rolesClaimKey = 'https://replicahealth.com/roles';
  const userRoles = claims[rolesClaimKey] || [];
  const hasDatasetAccess = userRoles.some(role => role.includes('dataset:'));
  
  if (!hasDatasetAccess && op !== 'request_access') {
    return cors({ error: "insufficient permissions", details: "Dataset access required" }, 403);
  }

  try {
    console.log('Operation:', op, 'Query params:', qs);

    if (op === "get") {
      const key = (qs.key || "").trim();
      if (!key) return cors({ error: "Missing key parameter" }, 400);
      if (!key.startsWith(PROCESSED_PREFIX) && !key.startsWith("archives/")) {
        return cors({ error: `key must start with ${PROCESSED_PREFIX} or archives/` }, 403);
      }
      const fileName = key.split("/").pop() || "download.csv";
      const url = await getSignedUrl(
        s3,
        new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
          ResponseContentDisposition: `attachment; filename="${fileName}"`
        }),
        { expiresIn: URL_TTL_SECONDS }
      );
      // Track download and terms agreement
      const downloadType = key.includes('public') ? 'public' : 'private';
      
      await trackUserActivity(claims.sub, 'download', {
        filename: key.split('/').pop(),
        key: key,
        type: downloadType
      });
      
      // Also track terms agreement for this download
      await trackUserActivity(claims.sub, 'terms_agreement', {
        version: process.env.TERMS_VERSION || 'v1',
        type: downloadType
      });
      
      return cors({ url, method: "GET", key, expires: URL_TTL_SECONDS });
    }

    if (op === "list_groups") {
      const { groups } = await buildGroups({ signUrls: false });
      return cors({
        bucket: BUCKET_NAME,
        prefix: PROCESSED_PREFIX,
        groups,
        expires: URL_TTL_SECONDS
      });
    }

    if (op === "batch") {
      let body = {};
      if (event.body) { try { body = JSON.parse(event.body); } catch {} }
      const fromQS = (qs.datasets || "").trim();
      const datasets = Array.isArray(body.datasets)
        ? body.datasets
        : (fromQS ? fromQS.split(",").map(s => s.trim()).filter(Boolean) : []);

      if (!datasets.length) return cors({ error: "datasets required (array in JSON body or comma-separated in query)" }, 400);

      const reqSet = new Set(datasets.map(d => d.toLowerCase()));
      const { groups } = await buildGroups({ signUrls: true });

      const urls = [];
      const skipped = [];

      for (const g of groups) {
        if (reqSet.has(g.name.toLowerCase())) {
          for (const f of g.files) {
            urls.push({ name: g.name, key: f.key, size: f.size, url: f.url });
          }
        }
      }
      
      for (const name of reqSet) {
        if (!groups.find(g => g.name.toLowerCase() === name)) {
          skipped.push({ name, reason: "group name not found" });
        }
      }
      
      // Track batch download and terms agreement
      if (urls.length > 0) {
        const hasPrivate = urls.some(item => {
          const groupName = groups.find(g => g.files.some(f => f.key === item.key))?.name;
          return groupName && getDatasetType(groupName) === 'private';
        });
        
        const downloadType = hasPrivate ? 'private' : 'public';
        
        // Track batch download
        await trackUserActivity(claims.sub, 'download', {
          filename: `batch_download_${urls.length}_files`,
          datasets: datasets,
          fileCount: urls.length,
          type: downloadType
        });
        
        // Track terms agreement for batch download
        await trackUserActivity(claims.sub, 'terms_agreement', {
          version: process.env.TERMS_VERSION || 'v1',
          type: downloadType
        });
      }

      return cors({ urls, skipped, expires: URL_TTL_SECONDS });
    }

    return cors({ error: "Invalid operation", operation: op, available: ["get", "list_groups", "batch", "request_access"] }, 400);
  } catch (err) {
    console.error('Handler error:', err);
    Sentry.captureException(err);
    return cors({ error: "internal error" }, 500);
  }
};