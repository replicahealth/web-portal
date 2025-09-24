// pages/Home.tsx
import { useAuth0 } from '@auth0/auth0-react';
import { hasPublic, hasPrivate } from '../auth/roles';
import { useEffect, useState } from 'react';
import TermsGate from '../components/TermsGate';

function formatRoleForDisplay(role: string): string {
    if (role === 'dataset:private_v1') return 'Private & Public Datasets';
    if (role === 'dataset:public_v1') return 'Public Datasets';
    return role;
}

const pv = import.meta.env.VITE_TERMS_PRIVATE_VERSION;
const pubv = import.meta.env.VITE_TERMS_PUBLIC_VERSION;

export default function Home() {
    const { loginWithRedirect, isAuthenticated, getIdTokenClaims, user } = useAuth0();
    const [roles, setRoles] = useState<string[]>([]);

    useEffect(() => {
        (async () => {
            if (!isAuthenticated) return;
            const claims = await getIdTokenClaims();
            const ns = 'https://replicahealth.com/roles';
            setRoles(((claims?.[ns] as string[]) || []) as string[]);
        })();
    }, [isAuthenticated, getIdTokenClaims]);

    if (!isAuthenticated) {
        return (
            <div className="container">
                <div className="welcome">
                    <img src="/logo-long.png" alt="Replica Health" style={{ marginBottom: '1rem', height: '48px' }} />
                    <h1>Research Data Portal</h1>
                    <p>You need to sign in to access datasets.</p>
                    <button className="btn btn-primary" onClick={() => loginWithRedirect()}>Sign in with Auth0</button>
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
                <p>Access and download research datasets for your studies</p>
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
                <div className="card">
                    <div className="card-body" style={{ textAlign: 'center' }}>
                        <p style={{ color: '#64748b' }}>You don't have dataset access yet. Please contact your administrator.</p>
                    </div>
                </div>
            )}
        </div>
    );
}