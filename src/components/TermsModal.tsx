

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAccept: () => void;
    datasetType: 'public' | 'private';
}

export default function TermsModal({ isOpen, onClose, onAccept, datasetType }: TermsModalProps) {
    if (!isOpen) return null;

    const terms = datasetType === 'private' ? `
# Private Dataset Terms of Use

## 1. Data Usage Agreement
By downloading this private dataset, you agree to:
- Use the data solely for research purposes
- Not redistribute or share the data with third parties
- Maintain strict confidentiality of all patient information
- Follow all applicable privacy regulations (HIPAA, GDPR, etc.)

## 2. Restrictions
- Commercial use is strictly prohibited
- Data must be stored securely with appropriate encryption
- Access limited to authorized research personnel only
- Data must be deleted after research completion

## 3. Attribution
Any publications using this data must cite:
"Data provided by Replica Health Research Portal"

## 4. Liability
Replica Health provides this data "as is" without warranties.
Users assume all responsibility for data handling and compliance.
    ` : `
# Public Dataset Terms of Use

## 1. Data Usage Agreement
By downloading this public dataset, you agree to:
- Use the data for research and educational purposes
- Properly attribute the data source in any publications
- Respect the privacy of individuals in the dataset

## 2. Permitted Uses
- Academic research and education
- Non-commercial analysis and visualization
- Open source research projects

## 3. Attribution
Please cite: "Data provided by Replica Health Research Portal"

## 4. Liability
Replica Health provides this data "as is" without warranties.
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
                
                <div style={{
                    backgroundColor: '#f8fafc',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    maxHeight: '400px',
                    overflow: 'auto',
                    fontSize: '0.9rem',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-line'
                }}>
                    {terms}
                </div>

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
                        onClick={onAccept}
                    >
                        I Agree & Download
                    </button>
                </div>
            </div>
        </div>
    );
}