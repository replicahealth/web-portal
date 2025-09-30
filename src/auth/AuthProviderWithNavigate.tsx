import { Auth0Provider } from '@auth0/auth0-react';
import TokenBridge from './TokenBridge';

export default function AuthProviderWithNavigate({ children }: { children: React.ReactNode }) {
    const domain = import.meta.env.VITE_AUTH0_DOMAIN!;
    const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID!;
    const redirectUri = window.location.origin;
    const audience = import.meta.env.VITE_AUTH0_AUDIENCE; // may be undefined

    console.log('Auth0 env', { domain, clientId, redirectUri, audience });

    return (
        <Auth0Provider
            domain={domain}
            clientId={clientId}
            authorizationParams={{
                redirect_uri: redirectUri,
                audience,                                   // ALWAYS pass your API audience
                scope: "openid profile email offline_access" // ask for refresh token rotation
            }}
            cacheLocation="localstorage"
            useRefreshTokens
        >
            {/* Expose token getter to non-React modules */}
            <TokenBridge />
            {children}
        </Auth0Provider>
    );
}
