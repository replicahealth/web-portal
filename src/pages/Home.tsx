// pages/Home.tsx
import { useAuth0 } from '@auth0/auth0-react';
import { hasPublic, hasPrivate } from '../auth/roles';
import { useEffect, useState } from 'react';
import { RequestAccessForm } from '../components/RequestAccessForm';
import { Link } from 'react-router-dom';
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
                    <h1>Research Data Portal</h1>
                    <p style={{ marginBottom: '1rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
                        MetaboNet is a large standardized diabetes research dataset with both continuous
                        glucose monitor (CGM) and insulin data.
                        MetaboNet takes inspiration from the ImageNet project, which revolutionized computer vision by providing a
                        comprehensive and freely accessible dataset for image classification.
                        By systematically processing and harmonizing major diabetes studies and datasets from different
                        sources into a single tabular format, MetaboNet aims to standardize training and evaluation for the next
                        generation of closed loop control and diabetes decision support algorithms.
                    </p>
                    <p style={{ marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
                        Replica Health Co., a Research Lab based in the USA, administers and
                        maintains the MetaboNet project, ensuring data quality, standardization, and accessibility for the
                        broader research community. We handle the process of data harmonization,
                        manage access permissions and data use agreements, and continuously expand the dataset with new sources.
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
                <h1>Research Data Portal</h1>
                <p style={{ marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
                    MetaboNet is a large standardized diabetes research dataset with both continuous
                    glucose monitor (CGM) and insulin data.
                    MetaboNet takes inspiration from the ImageNet project, which revolutionized computer vision by providing a
                    comprehensive and freely accessible dataset for image classification.
                    By systematically processing and harmonizing major diabetes studies and datasets from different
                    sources into a single tabular format, MetaboNet aims to standardize training and evaluation for the next
                    generation of closed loop control and diabetes decision support algorithms.

                    <p style={{ marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.6' }}>

                        Replica Health Co., a Research Lab based in the USA, administers and
                        maintains the MetaboNet project, ensuring data quality, standardization, and accessibility for the
                        broader research community. We handle the process of data harmonization,
                        manage access permissions and data use agreements, and continuously expand the dataset with new sources.
                    </p>
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
                            <h3>📊 Browse Data</h3>
                            <p>Explore available research data and select specific files for download.</p>
                            <Link to="/data" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '1rem' }}>View Data</Link>
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