// Simple Lambda function that validates JWT tokens manually
import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ region: "us-east-1" });

const BUCKET_NAME = "replica-general-data-repository";
const PROCESSED_PREFIX = "processed_data_final_expanded/";
const URL_TTL_SECONDS = 3600;

// JWT validation with optional signature verification
async function validateJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    // Check if token is expired
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return false;
    
    // Check audience
    const expectedAudience = process.env.AUTH0_AUDIENCE;
    if (expectedAudience && payload.aud) {
      const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
      if (!audiences.includes(expectedAudience)) return false;
    }
    
    // Enable signature verification in production (when ENABLE_JWT_VERIFICATION is set)
    if (process.env.ENABLE_JWT_VERIFICATION === 'true') {
      try {
        const jwksUri = `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`;
        const jwksResponse = await fetch(jwksUri);
        const jwks = await jwksResponse.json();
        
        const key = jwks.keys.find(k => k.kid === header.kid);
        if (!key) return false;
        
        const crypto = await import('crypto');
        const publicKey = crypto.createPublicKey({
          kty: key.kty,
          n: Buffer.from(key.n, 'base64url'),
          e: Buffer.from(key.e, 'base64url'),
          alg: 'RS256',
          use: 'sig'
        });
        
        const signatureValid = crypto.verify(
          'sha256',
          Buffer.from(parts[0] + '.' + parts[1]),
          {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_PADDING
          },
          Buffer.from(parts[2], 'base64url')
        );
        
        if (!signatureValid) return false;
      } catch (sigError) {
        return false;
      }
    }
    
    return payload;
  } catch (err) {
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

export const handler = async (event) => {
  if (event?.httpMethod === "OPTIONS") return cors("", 204);

  // Check if API Gateway already validated JWT and passed claims
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

  try {
    const qs = event.queryStringParameters || {};
    const op = (qs.op || "list_groups").toLowerCase();

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

      return cors({ urls, skipped, expires: URL_TTL_SECONDS });
    }

    return cors({ error: "Invalid operation" }, 400);
  } catch (err) {
    return cors({ error: "internal error" }, 500);
  }
};