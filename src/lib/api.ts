export interface PresignResponse { url: string; method: "GET"; key: string; expires: number }

const PRESIGN_BASE = import.meta.env.VITE_PRESIGN_API_BASE as string;
const API_BASE = import.meta.env.VITE_API_BASE as string | undefined;

const PUBLIC_ARCHIVE_KEY =
    import.meta.env.VITE_PUBLIC_ARCHIVE_KEY || "archives/public-dataset.zip";
const PRIVATE_ARCHIVE_KEY =
    import.meta.env.VITE_PRIVATE_ARCHIVE_KEY || "archives/private-dataset.zip";

// --- types you can export if helpful ---
export interface PresignedFile {
    key: string;
    size?: number;
    url: string;           // presigned GET
}
export interface DatasetGroup {
    name: string;
    count: number;
    files: PresignedFile[];
}

function assert(val: unknown, msg: string): asserts val {
    if (!val) throw new Error(msg);
}

async function getToken(): Promise<string> {
    const g = (window as Window & { __auth0_getToken?: () => Promise<string> }).__auth0_getToken;
    assert(g, "__auth0_getToken is not initialized (mount <TokenBridge /> inside <Auth0Provider>).");
    return g();
}

/** Optional: record consent on your API (keeps your previous behavior). No-op if VITE_API_BASE is unset. */
export async function recordConsent(kind: "public" | "private", termsVersion: string, token?: string) {
    if (!API_BASE) return;
    const t = token || (await getToken());
    const res = await fetch(`${API_BASE}/datasets/${kind}/consent`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${t}` },
        body: JSON.stringify({ terms_version: termsVersion }),
    });
    if (!res.ok) throw new Error(`consent failed ${res.status}: ${await res.text()}`);
}

/** Convenience to open the presigned URL. */
export async function downloadArchive(kind: "public" | "private", sameTab = false) {
    const url = await presignArchive(kind);
    if (sameTab) window.location.assign(url);
    else window.open(url, "_blank", "noopener,noreferrer");
}

/** Lists files grouped by dataset for 'public' or 'private'. */
export async function listDatasets(type: "public" | "private"): Promise<{
    bucket: string;
    prefix: string;
    type: "public" | "private";
    groups: DatasetGroup[];
    expires: number;
}> {
    if (!PRESIGN_BASE) throw new Error("VITE_PRESIGN_API_BASE is not set");

    const url = new URL(`${PRESIGN_BASE}/presign`);
    url.searchParams.set("op", "list");
    url.searchParams.set("type", type);

    const token = await getToken();
    const r = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error(`listDatasets failed: ${r.status} ${await r.text()}`);
    return r.json();
}

/** Convenience: open one file’s presigned URL */
export async function openPresignedUrl(url: string, sameTab = false) {
    if (sameTab) window.location.assign(url);
    else window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * Existing: Request a dataset download URL from your backend.
 */
export async function requestDownloadUrl(
    kind: "public" | "private",
    termsVersion: string,
    token: string
) {
    const res = await fetch(`${API_BASE}/datasets/${kind}/consent`, {
        method: "POST",
        headers: {
            "content-type": "application/json",
            authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ terms_version: termsVersion }),
    });
    if (!res.ok) {
        const t = await res.text();
        throw new Error(`Request failed ${res.status}: ${t}`);
    }
    return (await res.json()) as { url: string };
}

/**
 * New: Request a presigned GET url from API Gateway / Lambda for an S3 key
 */
export async function presignGet(key: string) {
    const url = new URL(`${PRESIGN_BASE}/presign`);
    url.searchParams.set("op", "get");
    url.searchParams.set("key", key);

    const token = await getToken();
    const r = await fetch(url.toString(), {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) {
        throw new Error(`presign failed: ${r.status} ${await r.text()}`);
    }
    return r.json() as Promise<{ url: string; method: "GET"; key: string; expires: number }>;
}

export async function openDownload(key: string, newTab = true) {
    const { url } = await presignGet(key); // your existing helper
    if (newTab) {
        window.open(url, '_blank', 'noopener,noreferrer'); // avoids referrer & window handle
    } else {
        window.location.assign(url); // same tab
    }
}

import { recordDownload } from './userTracking';

// NEW helper: get a presigned URL for the archive zip
export async function presignArchive(kind: 'public' | 'private'): Promise<string> {
    const base = import.meta.env.VITE_PRESIGN_API_BASE as string;
    if (!base) throw new Error('VITE_PRESIGN_API_BASE is not set');

    // map the kind -> key of the zip you will host in S3
    const key = kind === 'public' ? PUBLIC_ARCHIVE_KEY : PRIVATE_ARCHIVE_KEY;

    const url = new URL(`${base}/presign`);
    url.searchParams.set('op', 'get');
    url.searchParams.set('key', key);

    // get an access token with audience (via the TokenBridge you added)
    const getTokenFn = (window as Window & { __auth0_getToken?: () => Promise<string> }).__auth0_getToken;
    if (!getTokenFn) throw new Error('__auth0_getToken bridge is not initialized');
    const token = await getTokenFn();

    const r = await fetch(url.toString(), {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!r.ok) {
        const t = await r.text().catch(() => '');
        throw new Error(`presign failed: ${r.status} ${t}`);
    }
    const json = await r.json() as { url: string };
    
    // Record download
    try {
        const getUserId = (window as Window & { __auth0_getUserId?: () => string | undefined }).__auth0_getUserId;
        const userId = getUserId?.();
        if (userId) {
            await recordDownload(userId, key, kind);
        }
    } catch (error) {
        console.warn('Failed to record download:', error);
    }
    
    return json.url; // the pre-signed S3 URL
}
