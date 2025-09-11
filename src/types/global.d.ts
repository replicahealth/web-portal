export { };

declare global {
    interface Window {
        __auth0_getToken?: () => Promise<string>;
    }
}
