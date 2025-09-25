// components/TermsGate.tsx
import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { presignArchive, recordConsent } from '../lib/api';

type Props = {
    kind: 'public' | 'private';
    version: string;
    label: string;
    termsPath: string;              // e.g. '/terms-public.md'
    onAfterDownload?: () => void;   // optional hook after we trigger the download
};

export default function TermsGate({ kind, version, label, termsPath, onAfterDownload }: Props) {
    const [open, setOpen] = useState(false);
    const [terms, setTerms] = useState<string>('');
    const [agree, setAgree] = useState(false);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const { getAccessTokenSilently } = useAuth0();

    useEffect(() => {
        fetch(termsPath)
            .then(r => r.text())
            .then(setTerms)
            .catch(() => setTerms(''));
    }, [termsPath]);

    const confirm = async () => {
        try {
            setErr(null);
            setBusy(true);

            // Make sure we have a fresh access token (audience set).
            await getAccessTokenSilently({
                authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE }
            });

            // Optional: record consent in your own API (no-op if you don’t have this yet)
            await recordConsent?.(kind, version).catch(() => { /* ignore if not wired */ });

            // Ask the Lambda for a presigned ZIP URL
            const url = await presignArchive(kind); // returns string
            setOpen(false);
            onAfterDownload?.();

            // Start the download
            window.location.href = url;
        } catch (e: unknown) {
            setErr(e instanceof Error ? e.message : 'Failed to fetch');
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            <button onClick={() => setOpen(true)} className="btn">{label}</button>
            {open && (
                <div style={modalWrap}>
                    <div style={modalCard}>
                        <h3>Terms of Use (v{version})</h3>
                        <div style={{ whiteSpace: 'pre-wrap', maxHeight: 300, overflow: 'auto', border: '1px solid #eee', padding: 12, marginTop: 8 }}>
                            {terms}
                        </div>

                        <label style={{ display: 'block', marginTop: 12 }}>
                            <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} /> I agree
                        </label>

                        {err && <p style={{ color: 'red', marginTop: 8 }}>{err}</p>}

                        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                            <button onClick={() => setOpen(false)} disabled={busy}>Cancel</button>
                            <button onClick={confirm} disabled={!agree || busy}>
                                {busy ? 'Preparing…' : 'Download ZIP'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

const modalWrap: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
};
const modalCard: React.CSSProperties = {
    width: 'min(700px, 92vw)', background: '#fff', borderRadius: 8,
    padding: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
};
