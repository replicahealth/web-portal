import { useAuth0 } from '@auth0/auth0-react';

export default function Protected({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, loginWithRedirect, isLoading } = useAuth0();

    if (isLoading) return null;
    if (!isAuthenticated) {
        loginWithRedirect();
        return null;
    }
    return <>{children}</>;
}
