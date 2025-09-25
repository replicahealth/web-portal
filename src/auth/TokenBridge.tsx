// src/auth/TokenBridge.tsx
import { useAuth0 } from "@auth0/auth0-react";

export default function TokenBridge() {
    const { getAccessTokenSilently, isAuthenticated, user } = useAuth0();

    // Expose a function on window for non-React code to call
    (window as any).__auth0_getToken = async () => {
        const audience = import.meta.env.VITE_AUTH0_AUDIENCE;
        if (!audience) {
            throw new Error("VITE_AUTH0_AUDIENCE is required to fetch an access token");
        }
        if (!isAuthenticated) {
            throw new Error("Not authenticated");
        }
        return getAccessTokenSilently({
            authorizationParams: { audience }
        });
    };

    // Expose user ID for tracking
    (window as any).__auth0_getUserId = () => user?.sub;

    return null;
}
