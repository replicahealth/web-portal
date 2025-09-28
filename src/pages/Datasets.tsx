// pages/Datasets.tsx
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import * as Sentry from '@sentry/react';
import { hasPrivate, hasPublic } from '../auth/roles';
import { RequestAccessForm } from '../components/RequestAccessForm';
import { Link } from 'react-router-dom';

import TermsModal from '../components/TermsModal';

// Dataset metadata - stored on frontend to work with any backend
const DATASET_METADATA: Record<string, {
    subjects: number;
    avgDuration: string;
    patientYears: number;
    description: string;
}> = {
    "Loop Observational Study": {
        subjects: 843,
        avgDuration: "11.6 months",
        patientYears: 806.5,
        description: "Large-scale observational study of DIY Loop automated insulin delivery system users"
    },
    "FLAIR": {
        subjects: 113,
        avgDuration: "6.7 months",
        patientYears: 63.3,
        description: "CGM-only dataset from flash glucose monitoring study"
    },
    "OpenAPS Commons": {
        subjects: 183,
        avgDuration: "9.2 months",
        patientYears: 140.1,
        description: "Community-contributed data from OpenAPS automated insulin delivery users"
    },
    "IOBP2 RCT": {
        subjects: 440,
        avgDuration: "3.8 months",
        patientYears: 136,
        description: "Randomized controlled trial data from insulin-on-board prediction study"
    },
    "PEDAP": {
        subjects: 99,
        avgDuration: "8.4 months",
        patientYears: 68.7,
        description: "Pediatric diabetes advanced technology study data"
    },
    "OhioT1DM": {
        subjects: 12,
        avgDuration: "1.8 months",
        patientYears: 1.8,
        description: "Small but deeply phenotyped dataset with exercise and physiological signals"
    },
    "DCLP3": {
        subjects: 112,
        avgDuration: "6.1 months",
        patientYears: 57.4,
        description: "Diabetes Control and Life Project phase 3 - hybrid closed-loop trial"
    },
    "DCLP5": {
        subjects: 100,
        avgDuration: "11 months",
        patientYears: 92.0,
        description: "Diabetes Control and Life Project phase 5 - long-term closed-loop outcomes"
    },
    "T1DEXI": {
        subjects: 409,
        avgDuration: "1.3 months",
        patientYears: 45.2,
        description: "Type 1 Diabetes Exercise Initiative - exercise-focused dataset"
    },
    "T1DEXIP": {
        subjects: 211,
        avgDuration: "0.3 months",
        patientYears: 5.9,
        description: "T1DEXI Pilot - preliminary exercise study data"
    },
    "Tidepool-JDRF Project": {
        subjects: 300,
        avgDuration: "11.6 months",
        patientYears: 286.5,
        description: "Large-scale real-world data from Tidepool platform users"
    }
};

interface Dataset {
    name: string;
    count: number;
    type?: 'public' | 'private';
    files: Array<{
        key: string;
        size: number;
    }>;
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatTotalSize(files: Array<{key: string; size: number}>): string {
    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    return formatFileSize(totalBytes);
}

export default function Datasets() {
    const { user, getIdTokenClaims, isAuthenticated, loginWithRedirect } = useAuth0();
    const [roles, setRoles] = React.useState<string[]>([]);
    const [loaded, setLoaded] = React.useState(false);
    const [datasets, setDatasets] = React.useState<Dataset[]>([]);
    const [selectedDatasets, setSelectedDatasets] = React.useState<Set<string>>(new Set());
    const [loading, setLoading] = React.useState(false);
    const [showTermsModal, setShowTermsModal] = React.useState(false);
    const [termsDatasetType, setTermsDatasetType] = React.useState<'public' | 'private'>('public');

    React.useEffect(() => {
        (async () => {
            if (!isAuthenticated) {
                setRoles([]);
                setLoaded(true);
                return;
            }
            try {
                const claims = await getIdTokenClaims();
                const ns = 'https://replicahealth.com/roles';
                const r = (claims?.[ns] as string[]) || [];
                setRoles(r);
                setLoaded(true);

                // Set Sentry user context
                Sentry.setUser({
                    id: user?.sub,
                    email: user?.email,
                    username: user?.name
                });
            } catch (error) {
                console.error('Failed to get token claims:', error);
                Sentry.captureException(error);
                setRoles([]);
                setLoaded(true);
            }
        })();
    }, [getIdTokenClaims, user, isAuthenticated]);

    React.useEffect(() => {
        if (!loaded) return;
        if (isAuthenticated) {
            loadDatasets();
        }
    }, [loaded, roles, isAuthenticated]);

    const loadDatasets = async () => {
        
        const allDatasets: Dataset[] = [];
        
        try {
            const getToken = (window as Window & { __auth0_getToken?: () => Promise<string> }).__auth0_getToken;
            if (!getToken) throw new Error('Auth token not available');
            const token = await getToken();
            
            const response = await fetch(`${import.meta.env.VITE_PRESIGN_API_BASE}/presign?op=list_groups`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                data.groups.forEach((group: Dataset) => {
                    allDatasets.push({ ...group });
                });
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
            const getToken = (window as Window & { __auth0_getToken?: () => Promise<string> }).__auth0_getToken;
            if (!getToken) throw new Error('Auth token not available');
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
            
            // Show download instructions for multiple files
            if (urls.length > 1) {
                const message = `Found ${urls.length} files to download:\n\n${urls.map((item: { key: string; url: string }, i: number) => `${i+1}. ${item.key.split('/').pop()}`).join('\n')}\n\nClick OK to open all download links. You may need to allow popups in your browser.`;
                if (!confirm(message)) {
                    return;
                }
            }
            
            // Create and trigger all downloads immediately
            urls.forEach((item: { key: string; url: string }) => {
                
                // Use window.open for better popup handling
                const newWindow = window.open(item.url, '_blank');
                
                // Fallback to link click if popup blocked
                if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                    const link = document.createElement('a');
                    link.href = item.url;
                    link.download = item.key.split('/').pop() || 'dataset.csv';
                    link.target = '_blank';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            });
            
            // Show popup blocker warning if multiple files
            if (urls.length > 1) {
                setTimeout(() => {
                    alert('If some downloads didn\'t start, please allow popups for this site and try again.');
                }, 1000);
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

    // No authentication required - show page content based on auth state
    if (!isAuthenticated) {
        return (
            <div className="container">
                <h2>Data</h2>
                <div className="card" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                    <div className="card-body">
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.75rem', color: '#1e40af' }}>
                            📊 Standardized Data Format
                        </h3>
                        <p style={{ fontSize: '0.95rem', lineHeight: '1.7', color: '#475569', marginBottom: '1rem' }}>
                            All datasets in MetaboNet follow a unified tabular format with identical column structure. Each row represents
                            measurements taken at 5-minute intervals, enabling direct comparison across studies and eliminating dataset-specific preprocessing.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '6px' }}>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e40af' }}>Core Measurements</h4>
                                <ul style={{ fontSize: '0.85rem', color: '#475569', margin: 0, paddingLeft: '1.2rem', lineHeight: '1.6' }}>
                                    <li><strong>cgm</strong>: Blood glucose (mg/dL) - ~83% coverage</li>
                                    <li><strong>basal</strong>: Basal insulin delivered (IU/5min)</li>
                                    <li><strong>bolus</strong>: Bolus insulin delivered (IU/5min)</li>
                                    <li><strong>insulin</strong>: Total insulin (basal+bolus)</li>
                                    <li><strong>carbs</strong>: Reported carbohydrates (g)</li>
                                </ul>
                            </div>

                            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '6px' }}>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e40af' }}>Subject Metadata</h4>
                                <ul style={{ fontSize: '0.85rem', color: '#475569', margin: 0, paddingLeft: '1.2rem', lineHeight: '1.6' }}>
                                    <li><strong>id</strong>: Unique subject identifier</li>
                                    <li><strong>age</strong>: Subject age (years)</li>
                                    <li><strong>gender</strong>: Subject gender</li>
                                    <li><strong>TDD</strong>: Average total daily insulin (IU)</li>
                                    <li><strong>source_file</strong>: Original dataset name</li>
                                </ul>
                            </div>

                            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '6px' }}>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e40af' }}>Additional Features</h4>
                                <ul style={{ fontSize: '0.85rem', color: '#475569', margin: 0, paddingLeft: '1.2rem', lineHeight: '1.6' }}>
                                    <li><strong>heartrate</strong>: Average HR (bpm)</li>
                                    <li><strong>steps</strong>: Step count per 5min</li>
                                    <li><strong>workout_duration</strong>: Exercise time (min)</li>
                                    <li><strong>cgm_device</strong>: Device model</li>
                                    <li><strong>insulin_delivery_algorithm</strong>: AID system</li>
                                </ul>
                            </div>
                        </div>

                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '1rem', marginBottom: 0, fontStyle: 'italic' }}>
                            Note: Feature availability varies by source dataset. Core glucose and insulin data are present in all datasets,
                            while exercise and physiological signals are available in specific studies (e.g., OhioT1DM includes galvanic skin response and temperature).
                            <Link to="/data-dictionary" style={{ marginLeft: '0.5rem', color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>
                                View complete data dictionary →
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="card" style={{ marginTop: '2rem' }}>
                    <div className="card-body" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Sign In to Access Data</h3>
                        <p style={{ fontSize: '1.05rem', color: '#64748b', marginBottom: '2rem' }}>
                            To browse and download datasets, please sign in with your account.
                            If you don't have access yet, you can request it after signing in.
                        </p>
                        <button
                            className="btn btn-primary"
                            onClick={() => loginWithRedirect()}
                            style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}
                        >
                            Sign In to View Datasets
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!seesPrivate && !hasPublic(roles)) {
        return (
            <div className="container">
                <h2>Data</h2>
                <RequestAccessForm userEmail={user?.email} />
            </div>
        );
    }

    return (
        <div className="container">
                <h2>Data</h2>
                <p>Welcome {user?.email}</p>

                <div className="card" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                    <div className="card-body">
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.75rem', color: '#1e40af' }}>
                            📊 Standardized Data Format
                        </h3>
                        <p style={{ fontSize: '0.95rem', lineHeight: '1.7', color: '#475569', marginBottom: '1rem' }}>
                            All datasets in MetaboNet follow a unified tabular format with identical column structure. Each row represents
                            measurements taken at 5-minute intervals, enabling direct comparison across studies and eliminating dataset-specific preprocessing.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '6px' }}>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e40af' }}>Core Measurements</h4>
                                <ul style={{ fontSize: '0.85rem', color: '#475569', margin: 0, paddingLeft: '1.2rem', lineHeight: '1.6' }}>
                                    <li><strong>cgm</strong>: Blood glucose (mg/dL) - ~83% coverage</li>
                                    <li><strong>basal</strong>: Basal insulin delivered (IU/5min)</li>
                                    <li><strong>bolus</strong>: Bolus insulin delivered (IU/5min)</li>
                                    <li><strong>insulin</strong>: Total insulin (basal+bolus)</li>
                                    <li><strong>carbs</strong>: Reported carbohydrates (g)</li>
                                </ul>
                            </div>

                            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '6px' }}>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e40af' }}>Subject Metadata</h4>
                                <ul style={{ fontSize: '0.85rem', color: '#475569', margin: 0, paddingLeft: '1.2rem', lineHeight: '1.6' }}>
                                    <li><strong>id</strong>: Unique subject identifier</li>
                                    <li><strong>age</strong>: Subject age (years)</li>
                                    <li><strong>gender</strong>: Subject gender</li>
                                    <li><strong>TDD</strong>: Average total daily insulin (IU)</li>
                                    <li><strong>source_file</strong>: Original dataset name</li>
                                </ul>
                            </div>

                            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '6px' }}>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e40af' }}>Additional Features</h4>
                                <ul style={{ fontSize: '0.85rem', color: '#475569', margin: 0, paddingLeft: '1.2rem', lineHeight: '1.6' }}>
                                    <li><strong>heartrate</strong>: Average HR (bpm)</li>
                                    <li><strong>steps</strong>: Step count per 5min</li>
                                    <li><strong>workout_duration</strong>: Exercise time (min)</li>
                                    <li><strong>cgm_device</strong>: Device model</li>
                                    <li><strong>insulin_delivery_algorithm</strong>: AID system</li>
                                </ul>
                            </div>
                        </div>

                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '1rem', marginBottom: 0, fontStyle: 'italic' }}>
                            Note: Feature availability varies by source dataset. Core glucose and insulin data are present in all datasets,
                            while exercise and physiological signals are available in specific studies (e.g., OhioT1DM includes galvanic skin response and temperature).
                            <Link to="/data-dictionary" style={{ marginLeft: '0.5rem', color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>
                                View complete data dictionary →
                            </Link>
                        </p>
                    </div>
                </div>

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
                                {loading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span className="spinner"></span>
                                        Downloading...
                                    </span>
                                ) : `Download Selected (${selectedDatasets.size})`}
                            </button>
                            
                            <button
                                onClick={() => setSelectedDatasets(new Set())}
                                disabled={selectedDatasets.size === 0}
                                className="btn btn-secondary"
                            >
                                Clear Selection
                            </button>
                        </div>

                        {datasets.filter(d => d.type === 'public').length > 0 && (
                            <div style={{ marginBottom: 24 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <h3>Public Datasets</h3>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button
                                            onClick={() => {
                                                const publicDatasets = datasets.filter(d => d.type === 'public');
                                                setSelectedDatasets(prev => {
                                                    const newSet = new Set(prev);
                                                    publicDatasets.forEach(d => newSet.add(d.name));
                                                    return newSet;
                                                });
                                            }}
                                            className="btn btn-secondary"
                                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                        >
                                            Select All
                                        </button>
                                        <button
                                            onClick={() => {
                                                const publicDatasets = datasets.filter(d => d.type === 'public');
                                                setSelectedDatasets(prev => {
                                                    const newSet = new Set(prev);
                                                    publicDatasets.forEach(d => newSet.delete(d.name));
                                                    return newSet;
                                                });
                                            }}
                                            className="btn btn-secondary"
                                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                        >
                                            Deselect All
                                        </button>
                                    </div>
                                </div>
                                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: 12, lineHeight: '1.6' }}>
                                    Immediately available datasets donated by the Jaeb Center for Health Research, Loop observational study,
                                    and other public sources. These datasets comprise over 1,500 patient-years of data and require no additional
                                    agreements beyond standard MetaboNet terms of use.
                                </p>
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
                                                {DATASET_METADATA[dataset.name] && (
                                                    <>
                                                        <div style={{ fontSize: '0.85em', color: '#475569', marginTop: '0.25rem', marginBottom: '0.25rem' }}>
                                                            {DATASET_METADATA[dataset.name].description}
                                                        </div>
                                                        <div style={{ fontSize: '0.9em', color: '#666' }}>
                                                            {DATASET_METADATA[dataset.name].subjects} subjects •
                                                            {DATASET_METADATA[dataset.name].avgDuration} avg •
                                                            {DATASET_METADATA[dataset.name].patientYears} patient-years •
                                                            {dataset.count} files • {formatTotalSize(dataset.files)}
                                                        </div>
                                                    </>
                                                )}
                                                {!DATASET_METADATA[dataset.name] && (
                                                    <div style={{ fontSize: '0.9em', color: '#666' }}>
                                                        {dataset.count} files • {formatTotalSize(dataset.files)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {seesPrivate && datasets.filter(d => d.type === 'private').length > 0 && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <h3>Private Datasets</h3>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button
                                            onClick={() => {
                                                const privateDatasets = datasets.filter(d => d.type === 'private');
                                                setSelectedDatasets(prev => {
                                                    const newSet = new Set(prev);
                                                    privateDatasets.forEach(d => newSet.add(d.name));
                                                    return newSet;
                                                });
                                            }}
                                            className="btn btn-secondary"
                                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                        >
                                            Select All
                                        </button>
                                        <button
                                            onClick={() => {
                                                const privateDatasets = datasets.filter(d => d.type === 'private');
                                                setSelectedDatasets(prev => {
                                                    const newSet = new Set(prev);
                                                    privateDatasets.forEach(d => newSet.delete(d.name));
                                                    return newSet;
                                                });
                                            }}
                                            className="btn btn-secondary"
                                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                        >
                                            Deselect All
                                        </button>
                                    </div>
                                </div>
                                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: 12, lineHeight: '1.6' }}>
                                    These datasets are available for research use with appropriate data use agreements (DUAs).
                                    Access procedures vary by dataset - some require institutional agreements while others can be accessed
                                    through individual researcher applications.
                                </p>
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
                                                {DATASET_METADATA[dataset.name] && (
                                                    <>
                                                        <div style={{ fontSize: '0.85em', color: '#475569', marginTop: '0.25rem', marginBottom: '0.25rem' }}>
                                                            {DATASET_METADATA[dataset.name].description}
                                                        </div>
                                                        <div style={{ fontSize: '0.9em', color: '#666' }}>
                                                            {DATASET_METADATA[dataset.name].subjects} subjects •
                                                            {DATASET_METADATA[dataset.name].avgDuration} avg •
                                                            {DATASET_METADATA[dataset.name].patientYears} patient-years •
                                                            {dataset.count} files • {formatTotalSize(dataset.files)}
                                                        </div>
                                                    </>
                                                )}
                                                {!DATASET_METADATA[dataset.name] && (
                                                    <div style={{ fontSize: '0.9em', color: '#666' }}>
                                                        {dataset.count} files • {formatTotalSize(dataset.files)}
                                                    </div>
                                                )}
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
    );
}