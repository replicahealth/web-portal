// pages/Home.tsx
import { useAuth0 } from '@auth0/auth0-react';
import { hasPublic, hasPrivate } from '../auth/roles';
import { useEffect, useState } from 'react';
import TermsGate from '../components/TermsGate';

const pv = import.meta.env.VITE_TERMS_PRIVATE_VERSION;
const pubv = import.meta.env.VITE_TERMS_PUBLIC_VERSION;

export default function Home() {
    const { loginWithRedirect, logout, isAuthenticated, getIdTokenClaims, user } = useAuth0();
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
            <div className="p-6">
                <h1>Replica Research Portal</h1>
                <p>You need to sign in to access datasets.</p>
                <button onClick={() => loginWithRedirect()}>Sign in with Auth0</button>
            </div>
        );
    }

    const seesPrivate = hasPrivate(roles);
    const seesPublic = hasPublic(roles) || seesPrivate;

    return (
        <div className="p-6">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h1>Replica Research Portal</h1>
                <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>Log out</button>
            </div>

            <p>Welcome {user?.email}</p>
            <p>Your roles: {roles.join(', ') || '(none)'}</p>

            {seesPrivate && (
                <section style={{ marginTop: 16 }}>
                    <h3>Private dataset</h3>
                    <TermsGate kind="private" version={pv} label="Download Private ZIP" termsPath="/terms-private.md" />
                </section>
            )}

            {seesPublic && (
                <section style={{ marginTop: 16 }}>
                    <h3>Public dataset</h3>
                    <TermsGate kind="public" version={pubv} label="Download Public ZIP" termsPath="/terms-public.md" />
                </section>
            )}

            {!seesPublic && !seesPrivate && <p>You don’t have dataset access yet.</p>}
        </div>
    );
}
