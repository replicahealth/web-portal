import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAccept: () => void;
    datasetType: 'public' | 'private';
}

export default function TermsModal({ isOpen, onClose, onAccept, datasetType }: TermsModalProps) {
    const { user } = useAuth0();
    const [hasScrolled, setHasScrolled] = React.useState(false);
    const termsRef = React.useRef<HTMLDivElement>(null);
    
    React.useEffect(() => {
        if (isOpen) {
            setHasScrolled(false);
        }
    }, [isOpen]);
    
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const element = e.currentTarget;
        const isScrolledToBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 5;
        setHasScrolled(isScrolledToBottom);
    };
    
    if (!isOpen) return null;

    const terms = `
${user?.email || '[RESEARCHER_EMAIL]'} (the "Researcher") has requested permission to use the ${datasetType === 'private' ? 'Private Research' : 'Public Research'} database (the "Database") at Replica Health and JAEB. In exchange for such permission, Researcher hereby agrees to the following terms and conditions:

1. Researcher shall use the Database only for non-commercial research and educational purposes.

2. Replica Health and JAEB make no representations or warranties regarding the Database, including but not limited to warranties of non-infringement or fitness for a particular purpose.

3. Researcher accepts full responsibility for his or her use of the Database and shall defend and indemnify the Replica Health team, Replica Health, and JAEB, including their employees, Trustees, officers and agents, against any and all claims arising from Researcher's use of the Database, including but not limited to Researcher's use of any copies of copyrighted images that he or she may create from the Database.

4. Researcher may provide research associates and colleagues with access to the Database provided that they first agree to be bound by these terms and conditions.

5. Replica Health and JAEB reserve the right to terminate Researcher's access to the Database at any time.

6. If Researcher is employed by a for-profit, commercial entity, Researcher's employer shall also be bound by these terms and conditions, and Researcher hereby represents that he or she is fully authorized to enter into this agreement on behalf of such employer.

7. The law of the State of New York shall apply to all disputes under this agreement.
    `;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '2rem',
                maxWidth: '600px',
                maxHeight: '80vh',
                overflow: 'auto',
                margin: '1rem'
            }}>
                <h2 style={{ marginBottom: '1rem', color: '#0f172a' }}>
                    {datasetType === 'private' ? 'Private' : 'Public'} Dataset Terms of Use
                </h2>
                
                <div 
                    ref={termsRef}
                    onScroll={handleScroll}
                    style={{
                        backgroundColor: '#f8fafc',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        maxHeight: '400px',
                        overflow: 'auto',
                        fontSize: '0.9rem',
                        lineHeight: '1.6',
                        whiteSpace: 'pre-line',
                        border: '1px solid #e2e8f0'
                    }}
                >
                    {terms}
                </div>
                
                {!hasScrolled && (
                    <div style={{
                        backgroundColor: '#fef3c7',
                        border: '1px solid #f59e0b',
                        borderRadius: '6px',
                        padding: '0.75rem',
                        marginBottom: '1rem',
                        fontSize: '0.875rem',
                        color: '#92400e',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <span>⬇️</span>
                        Please scroll to the bottom to read all terms before accepting
                    </div>
                )}

                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        className="btn btn-secondary"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            // Terms tracking will be handled by the backend when download occurs
                            onAccept();
                        }}
                        disabled={!hasScrolled}
                        style={{
                            opacity: hasScrolled ? 1 : 0.5,
                            cursor: hasScrolled ? 'pointer' : 'not-allowed'
                        }}
                    >
                        I Agree & Download
                    </button>
                </div>
            </div>
        </div>
    );
}