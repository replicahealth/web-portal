export const PUBLIC_ROLE = 'dataset:public_v1';
export const PRIVATE_ROLE = 'dataset:private_v1';

export function hasPublic(roles: string[]) {
    return roles.includes(PUBLIC_ROLE) || roles.includes(PRIVATE_ROLE);
}
export function hasPrivate(roles: string[]) {
    return roles.includes(PRIVATE_ROLE);
}