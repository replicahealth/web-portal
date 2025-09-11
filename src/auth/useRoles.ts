// auth/useRoles.ts
import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { PUBLIC_ROLE, PRIVATE_ROLE } from './roles';

export function useRoles() {
    const { getIdTokenClaims } = useAuth0();
    const [roles, setRoles] = useState<string[]>([]);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        (async () => {
            const claims = await getIdTokenClaims();
            const ns = 'https://replicahealth.com/roles'; // your namespaced claim
            const r = (claims?.[ns] as string[]) || [];
            setRoles(r);
            setReady(true);
        })();
    }, [getIdTokenClaims]);

    const hasPrivateV1 = roles.includes(PRIVATE_ROLE);
    const hasPublicV1 = hasPrivateV1 || roles.includes(PUBLIC_ROLE);

    return { roles, hasPublicV1, hasPrivateV1, ready };
}
