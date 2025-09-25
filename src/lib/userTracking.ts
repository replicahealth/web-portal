// User activity tracking via Auth0 Management API

interface TermsAgreement {
  version: string;
  timestamp: string;
  type: 'public' | 'private';
}

interface DownloadRecord {
  filename: string;
  timestamp: string;
  type: 'public' | 'private';
}

interface UserMetadata {
  termsAgreements?: TermsAgreement[];
  downloads?: DownloadRecord[];
}

async function getManagementToken(): Promise<string> {
  // Get Auth0 Management API token
  const response = await fetch(`https://${import.meta.env.VITE_AUTH0_DOMAIN}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: import.meta.env.VITE_AUTH0_M2M_CLIENT_ID,
      client_secret: import.meta.env.VITE_AUTH0_M2M_CLIENT_SECRET,
      audience: `https://${import.meta.env.VITE_AUTH0_DOMAIN}/api/v2/`,
      grant_type: 'client_credentials'
    })
  });
  
  const data = await response.json();
  return data.access_token;
}

export async function recordTermsAgreement(
  userId: string, 
  termsVersion: string, 
  type: 'public' | 'private'
) {
  try {
    const token = await getManagementToken();
    
    // Get current user metadata
    const userResponse = await fetch(
      `https://${import.meta.env.VITE_AUTH0_DOMAIN}/api/v2/users/${userId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const user = await userResponse.json();
    
    const metadata: UserMetadata = user.user_metadata || {};
    const agreements = metadata.termsAgreements || [];
    
    // Add new agreement
    agreements.push({
      version: termsVersion,
      timestamp: new Date().toISOString(),
      type
    });
    
    // Update user metadata
    await fetch(`https://${import.meta.env.VITE_AUTH0_DOMAIN}/api/v2/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_metadata: {
          ...metadata,
          termsAgreements: agreements
        }
      })
    });
    
    console.log('Terms agreement recorded:', { userId, termsVersion, type });
  } catch (error) {
    console.error('Failed to record terms agreement:', error);
  }
}

export async function recordDownload(
  userId: string,
  filename: string,
  type: 'public' | 'private'
) {
  try {
    const token = await getManagementToken();
    
    // Get current user metadata
    const userResponse = await fetch(
      `https://${import.meta.env.VITE_AUTH0_DOMAIN}/api/v2/users/${userId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const user = await userResponse.json();
    
    const metadata: UserMetadata = user.user_metadata || {};
    const downloads = metadata.downloads || [];
    
    // Add new download
    downloads.push({
      filename,
      timestamp: new Date().toISOString(),
      type
    });
    
    // Update user metadata
    await fetch(`https://${import.meta.env.VITE_AUTH0_DOMAIN}/api/v2/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_metadata: {
          ...metadata,
          downloads: downloads.slice(-50) // Keep last 50 downloads
        }
      })
    });
    
    console.log('Download recorded:', { userId, filename, type });
  } catch (error) {
    console.error('Failed to record download:', error);
  }
}