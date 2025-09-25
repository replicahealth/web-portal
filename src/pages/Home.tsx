// pages/Home.tsx
import { useAuth0 } from '@auth0/auth0-react';
import { hasPublic, hasPrivate } from '../auth/roles';
import { useEffect, useState } from 'react';
import { RequestAccessForm } from '../components/RequestAccessForm';
function formatRoleForDisplay(role: string): string {
    if (role === 'dataset:private_v1') return 'Private & Public Datasets';
    if (role === 'dataset:public_v1') return 'Public Datasets';
    return role;
}

export default function Home() {
    const { loginWithRedirect, isAuthenticated, getIdTokenClaims, user } = useAuth0();
    const [roles, setRoles] = useState<string[]>([]);

    useEffect(() => {
        (async () => {
            if (!isAuthenticated) {
                setRoles([]);
                return;
            }
            try {
                const claims = await getIdTokenClaims();
                const ns = 'https://replicahealth.com/roles';
                setRoles(((claims?.[ns] as string[]) || []) as string[]);
            } catch (error) {
                console.error('Failed to get token claims:', error);
                setRoles([]);
            }
        })();
    }, [isAuthenticated, getIdTokenClaims, user]);

    if (!isAuthenticated) {
        return (
            <div className="container">
                <div className="welcome">
                    <img src="/logo-long.png" alt="Replica Health" style={{ marginBottom: '1rem', height: '48px' }} />
                    <h1>Research Data Portal</h1>
                    <p style={{ marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
                        Access standardized diabetes research datasets from major studies worldwide. 
                        We're building a comprehensive resource to accelerate diabetes care innovations.
                    </p>
                    <p>You need to sign in to access datasets.</p>
                    <button 
                        className="btn" 
                        onClick={() => loginWithRedirect()}
                        style={{
                            backgroundColor: 'white',
                            color: '#3b82f6',
                            border: '2px solid white',
                            fontWeight: '600'
                        }}
                    >
                        Sign in
                    </button>
                </div>
            </div>
        );
    }

    const seesPrivate = hasPrivate(roles);
    const seesPublic = hasPublic(roles) || seesPrivate;

    return (
        <div className="container">
            <div className="welcome">
                <img src="/logo-long.png" alt="Replica Health" style={{ marginBottom: '1rem', height: '48px' }} />
                <h1>Research Data Portal</h1>
                <p style={{ marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
                    Replica Health is building the world's largest standardized diabetes research dataset by systematically processing and harmonizing major diabetes studies from around the globe. Similar to how ImageNet revolutionized computer vision by providing a unified, accessible dataset, we're creating a comprehensive resource that enables researchers to accelerate diabetes care innovations. Our platform aggregates data from landmark studies including DCLP, Loop, JDRF trials, and international research initiatives, applying consistent formatting and quality standards to make this valuable research data readily accessible to the scientific community.
                </p>
            </div>
            
            <div className="card">
                <div className="card-body">
                    <h2>Hello, {user?.name || user?.email}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <span>You have access to the following dataset types:</span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {roles.map(role => (
                                <span key={role} className="role-badge">{formatRoleForDisplay(role)}</span>
                            ))}
                            {roles.length === 0 && <span style={{ color: '#64748b' }}>No dataset access</span>}
                        </div>
                    </div>
                    
                    {(seesPublic || seesPrivate) && (
                        <div style={{ textAlign: 'center', padding: '2rem 1rem 1rem 1rem', borderTop: '1px solid #e2e8f0', marginTop: '1rem' }}>
                            <h3>📊 Browse Datasets</h3>
                            <p>Explore available research datasets and select specific files for download.</p>
                            <a href="/datasets" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '1rem' }}>View Datasets</a>
                        </div>
                    )}
                </div>
            </div>
            
            {!seesPublic && !seesPrivate && (
                <RequestAccessForm userEmail={user?.email} />
            )}
        </div>
    );
}