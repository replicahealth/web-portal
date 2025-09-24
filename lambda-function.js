const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const s3 = new AWS.S3();
const BUCKET_NAME = 'replica-general-data-repository';
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;

const client = jwksClient({
    jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json`
});

function getKey(header, callback) {
    client.getSigningKey(header.kid, (err, key) => {
        const signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
    });
}

const verifyToken = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, getKey, {
            audience: process.env.AUTH0_AUDIENCE,
            issuer: `https://${AUTH0_DOMAIN}/`,
            algorithms: ['RS256']
        }, (err, decoded) => {
            if (err) reject(err);
            else resolve(decoded);
        });
    });
};

const hasRole = (roles, requiredRole) => {
    return roles && roles.includes(requiredRole);
};

const getAvailabilityList = async (type) => {
    const prefix = `raw_data/${type}_availability/`;
    const params = {
        Bucket: BUCKET_NAME,
        Prefix: prefix,
        MaxKeys: 1000
    };
    
    const result = await s3.listObjectsV2(params).promise();
    return result.Contents.map(obj => obj.Key.replace(prefix, '').replace(/\.[^/.]+$/, ''));
};

const listS3Objects = async (type) => {
    const availableDatasets = await getAvailabilityList(type);
    const processedPrefix = 'processed_data_final_expanded/';
    
    const params = {
        Bucket: BUCKET_NAME,
        Prefix: processedPrefix,
        MaxKeys: 1000
    };
    
    const result = await s3.listObjectsV2(params).promise();
    
    const matchingFiles = result.Contents.filter(obj => {
        const fileName = obj.Key.replace(processedPrefix, '').replace(/\.[^/.]+$/, '');
        return availableDatasets.some(dataset => fileName.includes(dataset));
    });
    
    const files = await Promise.all(
        matchingFiles.map(async (obj) => {
            const presignedUrl = await s3.getSignedUrlPromise('getObject', {
                Bucket: BUCKET_NAME,
                Key: obj.Key,
                Expires: 3600
            });
            
            return {
                key: obj.Key,
                size: obj.Size,
                url: presignedUrl
            };
        })
    );
    
    return {
        bucket: BUCKET_NAME,
        prefix: processedPrefix,
        type,
        groups: [{
            name: `${type} datasets`,
            count: files.length,
            files
        }],
        expires: Math.floor(Date.now() / 1000) + 3600
    };
};

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
    };
    
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers };
    }
    
    try {
        const authHeader = event.headers.Authorization || event.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Missing or invalid authorization header' })
            };
        }
        
        const token = authHeader.substring(7);
        const decoded = await verifyToken(token);
        const roles = decoded['https://replicahealth.com/roles'] || [];
        
        const { op, type, key } = event.queryStringParameters || {};
        
        if (op === 'list') {
            if (!type || !['public', 'private'].includes(type)) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Invalid type parameter' })
                };
            }
            
            const canAccessPublic = hasRole(roles, 'public') || hasRole(roles, 'private');
            const canAccessPrivate = hasRole(roles, 'private');
            
            if (type === 'public' && !canAccessPublic) {
                return {
                    statusCode: 403,
                    headers,
                    body: JSON.stringify({ error: 'Insufficient permissions for public datasets' })
                };
            }
            
            if (type === 'private' && !canAccessPrivate) {
                return {
                    statusCode: 403,
                    headers,
                    body: JSON.stringify({ error: 'Insufficient permissions for private datasets' })
                };
            }
            
            const result = await listS3Objects(type);
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(result)
            };
        }
        
        if (op === 'get') {
            if (!key) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Missing key parameter' })
                };
            }
            
            // Determine if file is public or private by checking availability lists
            const fileName = key.replace('processed_data_final_expanded/', '').replace(/\.[^/.]+$/, '');
            const publicList = await getAvailabilityList('public');
            const privateList = await getAvailabilityList('private');
            
            const isPublic = publicList.some(dataset => fileName.includes(dataset));
            const isPrivate = privateList.some(dataset => fileName.includes(dataset));
            
            if (!isPublic && !isPrivate) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: 'Dataset not found in availability lists' })
                };
            }
            
            const canAccessPublic = hasRole(roles, 'public') || hasRole(roles, 'private');
            const canAccessPrivate = hasRole(roles, 'private');
            
            if (isPublic && !canAccessPublic) {
                return {
                    statusCode: 403,
                    headers,
                    body: JSON.stringify({ error: 'Insufficient permissions' })
                };
            }
            
            if (isPrivate && !canAccessPrivate) {
                return {
                    statusCode: 403,
                    headers,
                    body: JSON.stringify({ error: 'Insufficient permissions' })
                };
            }
            
            const presignedUrl = await s3.getSignedUrlPromise('getObject', {
                Bucket: BUCKET_NAME,
                Key: key,
                Expires: 3600
            });
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    url: presignedUrl,
                    method: 'GET',
                    key,
                    expires: Math.floor(Date.now() / 1000) + 3600
                })
            };
        }
        
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Invalid operation' })
        };
        
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};