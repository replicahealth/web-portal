// pages/Datasets.tsx
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Protected from '../components/Protected';
import { hasPublic, hasPrivate } from '../auth/roles';

import TermsModal from '../components/TermsModal';

interface Dataset {
    name: string;
    count: number;
    type?: 'public' | 'private';
    files: Array<{
        key: string;
        size: number;
    }>;
}

export default function Datasets() {
    const { user, getIdTokenClaims } = useAuth0();
    const [roles, setRoles] = React.useState<string[]>([]);
    const [loaded, setLoaded] = React.useState(false);
    const [datasets, setDatasets] = React.useState<Dataset[]>([]);
    const [selectedDatasets, setSelectedDatasets] = React.useState<Set<string>>(new Set());
    const [loading, setLoading] = React.useState(false);
    const [showTermsModal, setShowTermsModal] = React.useState(false);
    const [termsDatasetType, setTermsDatasetType] = React.useState<'public' | 'private'>('public');

    React.useEffect(() => {
        (async () => {
            const claims = await getIdTokenClaims();
            const ns = 'https://replicahealth.com/roles';
            const r = (claims?.[ns] as string[]) || [];
            setRoles(r);
            setLoaded(true);
        })();
    }, [getIdTokenClaims]);

    React.useEffect(() => {
        if (!loaded) return;
        loadDatasets();
    }, [loaded, roles]);

    const loadDatasets = async () => {
        const seesPrivate = hasPrivate(roles);
        const seesPublic = hasPublic(roles) || seesPrivate;
        
        const allDatasets: Dataset[] = [];
        
        try {
            const getToken = (window as any).__auth0_getToken;
            if (!getToken) throw new Error('Auth token not available');
            const token = await getToken();
            
            console.log('Token:', token);
            console.log('API URL:', `${import.meta.env.VITE_PRESIGN_API_BASE}/presign?op=list_groups`);
            
            const response = await fetch(`${import.meta.env.VITE_PRESIGN_API_BASE}/presign?op=list_groups`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('API Response:', data);
                data.groups.forEach((group: any) => {
                    // Keep the original type from Lambda (public/private)
                    allDatasets.push({ ...group });
                });
                console.log('All datasets:', allDatasets);
                console.log('Private datasets:', allDatasets.filter(d => d.type === 'private'));
                console.log('Public datasets:', allDatasets.filter(d => d.type === 'public'));
            } else {
                const errorData = await response.json();
                console.error('API Error:', errorData);
            }
            
            setDatasets(allDatasets);
        } catch (error) {
            console.error('Failed to load datasets:', error);
        }
    };

    const handleCheckboxChange = (datasetName: string) => {
        const newSelected = new Set(selectedDatasets);
        if (newSelected.has(datasetName)) {
            newSelected.delete(datasetName);
        } else {
            newSelected.add(datasetName);
        }
        setSelectedDatasets(newSelected);
    };

    const handleDownloadClick = () => {
        if (selectedDatasets.size === 0) return;
        
        // Determine if we have private datasets selected
        const selectedDatasetObjects = datasets.filter(d => selectedDatasets.has(d.name));
        const hasPrivateSelected = selectedDatasetObjects.some(d => d.type === 'private');
        
        setTermsDatasetType(hasPrivateSelected ? 'private' : 'public');
        setShowTermsModal(true);
    };

    const handleTermsAccept = async () => {
        setShowTermsModal(false);
        setLoading(true);
        
        try {
            const getToken = (window as any).__auth0_getToken;
            const token = await getToken();
            const selectedNames = Array.from(selectedDatasets);
            
            const response = await fetch(`${import.meta.env.VITE_PRESIGN_API_BASE}/presign?op=batch`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ datasets: selectedNames })
            });
            
            if (!response.ok) throw new Error('Batch download failed');
            const { urls } = await response.json();
            
            for (const item of urls) {
                if (item.url.startsWith('data:')) {
                    // For mock data URLs, create a download link
                    const link = document.createElement('a');
                    link.href = item.url;
                    link.download = item.key.split('/').pop() || 'dataset.csv';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } else {
                    window.open(item.url, '_blank');
                }
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        } catch (error) {
            console.error('Download failed:', error);
            alert('Download failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!loaded) return null;

    const seesPrivate = hasPrivate(roles);
    const seesPublic = hasPublic(roles) || seesPrivate;

    if (!seesPublic && !seesPrivate) {
        return (
            <Protected>
                <div style={{ padding: 24 }}>
                    <h2>Datasets</h2>
                    <p>You don't have dataset access yet.</p>
                </div>
            </Protected>
        );
    }

    return (
        <Protected>
            <div style={{ padding: 24 }}>
                <h2>Datasets</h2>
                <p>Welcome {user?.email}</p>
                
                {datasets.length > 0 && (
                    <div style={{ marginTop: 24 }}>
                        <div style={{ 
                            position: 'sticky', 
                            top: 0, 
                            backgroundColor: '#f8fafc', 
                            padding: '16px 0', 
                            marginBottom: 16, 
                            display: 'flex', 
                            gap: 16, 
                            alignItems: 'center',
                            borderBottom: '1px solid #e2e8f0',
                            zIndex: 10
                        }}>
                            <button
                                onClick={handleDownloadClick}
                                disabled={selectedDatasets.size === 0 || loading}
                                className="btn btn-primary"
                                style={{
                                    opacity: selectedDatasets.size === 0 ? 0.5 : 1,
                                    cursor: selectedDatasets.size > 0 ? 'pointer' : 'not-allowed'
                                }}
                            >
                                {loading ? 'Downloading...' : `Download Selected (${selectedDatasets.size})`}
                            </button>
                            
                            <button
                                onClick={() => setSelectedDatasets(new Set())}
                                disabled={selectedDatasets.size === 0}
                                className="btn btn-secondary"
                            >
                                Clear Selection
                            </button>
                        </div>
                        
                        {seesPrivate && datasets.filter(d => d.type === 'private').length > 0 && (
                            <div style={{ marginBottom: 24 }}>
                                <h3>Private Datasets</h3>
                                <div style={{ border: '1px solid #ddd', borderRadius: 4, backgroundColor: 'white' }}>
                                    {datasets.filter(d => d.type === 'private').map((dataset) => (
                                        <div
                                            key={dataset.name}
                                            style={{
                                                padding: 12,
                                                borderBottom: '1px solid #eee',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 12
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedDatasets.has(dataset.name)}
                                                onChange={() => handleCheckboxChange(dataset.name)}
                                                style={{ cursor: 'pointer' }}
                                            />
                                            
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 'bold' }}>{dataset.name}</div>
                                                <div style={{ fontSize: '0.9em', color: '#666' }}>
                                                    {dataset.count} files
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {seesPublic && datasets.filter(d => d.type === 'public').length > 0 && (
                            <div>
                                <h3>Public Datasets</h3>
                                <div style={{ border: '1px solid #ddd', borderRadius: 4, backgroundColor: 'white' }}>
                                    {datasets.filter(d => d.type === 'public').map((dataset) => (
                                        <div
                                            key={dataset.name}
                                            style={{
                                                padding: 12,
                                                borderBottom: '1px solid #eee',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 12
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedDatasets.has(dataset.name)}
                                                onChange={() => handleCheckboxChange(dataset.name)}
                                                style={{ cursor: 'pointer' }}
                                            />
                                            
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 'bold' }}>{dataset.name}</div>
                                                <div style={{ fontSize: '0.9em', color: '#666' }}>
                                                    {dataset.count} files
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                
                {datasets.length === 0 && (
                    <p style={{ marginTop: 16 }}>Loading datasets...</p>
                )}
                
                <TermsModal
                    isOpen={showTermsModal}
                    onClose={() => setShowTermsModal(false)}
                    onAccept={handleTermsAccept}
                    datasetType={termsDatasetType}
                />
            </div>
        </Protected>
    );
}