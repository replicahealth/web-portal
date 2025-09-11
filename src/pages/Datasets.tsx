// pages/Datasets.tsx
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Protected from '../components/Protected';
import TermsGate from '../components/TermsGate';
import { hasPublic, hasPrivate } from '../auth/roles';

const pv = import.meta.env.VITE_TERMS_PRIVATE_VERSION;
const pubv = import.meta.env.VITE_TERMS_PUBLIC_VERSION;

export default function Datasets() {
    const { user, getIdTokenClaims } = useAuth0();
    const [roles, setRoles] = React.useState<string[]>([]);
    const [loaded, setLoaded] = React.useState(false);

    React.useEffect(() => {
        (async () => {
            const claims = await getIdTokenClaims();
            const ns = 'https://replicahealth.com/roles'; // your namespaced roles claim
            const r = (claims?.[ns] as string[]) || [];
            setRoles(r);
            setLoaded(true);
        })();
    }, [getIdTokenClaims]);

    if (!loaded) return null;

    const seesPrivate = hasPrivate(roles);
    const seesPublic = hasPublic(roles) || seesPrivate; // private implies public

    return (
        <Protected>
            <div style={{ padding: 24 }}>
                <h2>Datasets</h2>
                <p>Welcome {user?.email}</p>

                {seesPrivate && (
                    <section style={{ marginTop: 16 }}>
                        <h3>Private dataset</h3>
                        <p>Includes access to public dataset.</p>
                        <TermsGate
                            kind="private"
                            version={pv}
                            label="Download Private ZIP"
                            termsPath="/terms-private.md"
                        />
                    </section>
                )}

                {seesPublic && (
                    <section style={{ marginTop: 16 }}>
                        <h3>Public dataset</h3>
                        <TermsGate
                            kind="public"
                            version={pubv}
                            label="Download Public ZIP"
                            termsPath="/terms-public.md"
                        />
                    </section>
                )}

                {!seesPublic && !seesPrivate && (
                    <p>You don’t have dataset access yet.</p>
                )}
            </div>
        </Protected>
    );
}
