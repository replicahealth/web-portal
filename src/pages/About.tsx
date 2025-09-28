import { Link } from 'react-router-dom';

export default function About() {
    return (
        <div className="container">
            <div className="welcome" style={{ marginBottom: '2rem' }}>
                <h1>MetaboNet: A Standardized Type 1 Diabetes Dataset</h1>
                <p style={{ fontSize: '1.2rem', marginBottom: '0' }}>
                    A consolidated dataset of 2,802 subjects and 1,500+ patient-years of continuous glucose monitoring and insulin pump data for automated insulin delivery research
                </p>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <div className="card-body">
                    <h2 className="section-title">Overview</h2>
                    <p style={{ fontSize: '1.05rem', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                        MetaboNet consolidates multiple Type 1 Diabetes management datasets into a standardized format to address the fragmentation that has limited algorithm comparability and generalizability in automated insulin delivery (AID) research. Similar to ImageNet's role in computer vision research, this dataset provides a common benchmark for algorithm development and validation.
                    </p>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '2rem',
                        padding: '2rem',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        marginTop: '1.5rem'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#3b82f6' }}>2,802</div>
                            <div style={{ fontSize: '1rem', color: '#64748b', marginTop: '0.5rem' }}>Subjects</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#3b82f6' }}>1,500+</div>
                            <div style={{ fontSize: '1rem', color: '#64748b', marginTop: '0.5rem' }}>Patient-Years</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#3b82f6' }}>1-82</div>
                            <div style={{ fontSize: '1rem', color: '#64748b', marginTop: '0.5rem' }}>Age Range (years)</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#3b82f6' }}>2.3-99.1%</div>
                            <div style={{ fontSize: '1rem', color: '#64748b', marginTop: '0.5rem' }}>Time in Range</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <div className="card-body">
                    <h2 className="section-title">The Challenge We're Solving</h2>
                    <p style={{ marginBottom: '1.5rem', lineHeight: '1.8' }}>
                        Automated Insulin Delivery research has been historically challenged by fragmentation and lack of standardization across existing management datasets. Individual datasets vary widely in structure, preprocessing methods, and patient diversity, making it difficult for researchers to:
                    </p>
                    <ul style={{ lineHeight: '2', marginLeft: '2rem' }}>
                        <li>Compare results across different studies</li>
                        <li>Validate algorithms on diverse populations</li>
                        <li>Reproduce and build upon existing research</li>
                        <li>Develop generalizable insulin delivery algorithms</li>
                    </ul>
                    <p style={{ marginTop: '1.5rem', lineHeight: '1.8' }}>
                        MetaboNet addresses these challenges by standardizing data format and preprocessing methods across all included datasets, enabling direct comparison of algorithm performance and reproducible research.
                    </p>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <div className="card-body">
                    <h2 className="section-title">Dataset Composition</h2>
                    <p style={{ marginBottom: '1.5rem', lineHeight: '1.8' }}>
                        MetaboNet consolidates data from multiple sources, each bringing unique value to the comprehensive dataset. All datasets include continuous glucose monitoring (CGM) and corresponding insulin pump dosing data as core requirements.
                    </p>

                    <div style={{ marginTop: '2rem' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem' }}>Current Dataset Sources</h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Dataset</th>
                                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Subjects</th>
                                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Avg Duration</th>
                                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Access Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px' }}>Loop Observational Study</td>
                                        <td style={{ padding: '12px' }}>843</td>
                                        <td style={{ padding: '12px' }}>11.6 months</td>
                                        <td style={{ padding: '12px', color: '#16a34a' }}>Public</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px' }}>T1DEXI</td>
                                        <td style={{ padding: '12px' }}>409</td>
                                        <td style={{ padding: '12px' }}>1.3 months</td>
                                        <td style={{ padding: '12px', color: '#2563eb' }}>DUA Required</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px' }}>IOBP2 RCT</td>
                                        <td style={{ padding: '12px' }}>440</td>
                                        <td style={{ padding: '12px' }}>3.8 months</td>
                                        <td style={{ padding: '12px', color: '#16a34a' }}>Public</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px' }}>Tidepool-JDRF Project</td>
                                        <td style={{ padding: '12px' }}>300</td>
                                        <td style={{ padding: '12px' }}>11.6 months</td>
                                        <td style={{ padding: '12px', color: '#2563eb' }}>DUA Required</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px' }}>OpenAPS Commons</td>
                                        <td style={{ padding: '12px' }}>183</td>
                                        <td style={{ padding: '12px' }}>9.2 months</td>
                                        <td style={{ padding: '12px', color: '#16a34a' }}>Public</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px' }}>DCLP3 & DCLP5</td>
                                        <td style={{ padding: '12px' }}>212</td>
                                        <td style={{ padding: '12px' }}>8.5 months</td>
                                        <td style={{ padding: '12px', color: '#16a34a' }}>Public</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div style={{
                        marginTop: '2rem',
                        padding: '1.5rem',
                        background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
                        borderRadius: '8px'
                    }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>Planned Expansion</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                            <div>
                                <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1e40af' }}>8,900+</div>
                                <div style={{ fontSize: '0.9rem', color: '#3730a3' }}>Planned Patient-Years</div>
                            </div>
                            <div style={{ flex: 1, fontSize: '0.95rem', color: '#1e293b' }}>
                                We are actively working to integrate additional datasets including the Tidepool Data Donation Dataset (~2,800 subjects) and commercial partner data, which will expand our coverage by over 5× the current size.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

<div className="card" style={{ marginBottom: '2rem' }}>
                <div className="card-body">
                    <h2 className="section-title">Core Features</h2>
                    <p style={{ marginBottom: '1.5rem', lineHeight: '1.8' }}>
                        Each row in MetaboNet includes these essential components for insulin delivery algorithm development:
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                        <div style={{ padding: '1.5rem', background: '#f0f9ff', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e40af' }}>
                                📊 Continuous Glucose Monitoring
                            </h3>
                            <p style={{ fontSize: '0.95rem', color: '#475569' }}>
                                High-frequency glucose readings providing real-time insight into glycemic patterns
                            </p>
                        </div>
                        <div style={{ padding: '1.5rem', background: '#f0fdf4', borderRadius: '8px', borderLeft: '4px solid #16a34a' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#14532d' }}>
                                💉 Insulin Pump Data
                            </h3>
                            <p style={{ fontSize: '0.95rem', color: '#475569' }}>
                                Complete basal rates, bolus doses, and pump settings synchronized with CGM data
                            </p>
                        </div>
                        <div style={{ padding: '1.5rem', background: '#fef3c7', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#78350f' }}>
                                🍎 Carbohydrate Data
                            </h3>
                            <p style={{ fontSize: '0.95rem', color: '#475569' }}>
                                Reported carbohydrate intake when available, enabling meal-aware algorithm development
                            </p>
                        </div>
                        <div style={{ padding: '1.5rem', background: '#fce7f3', borderRadius: '8px', borderLeft: '4px solid #ec4899' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#831843' }}>
                                🏃 Exercise Events
                            </h3>
                            <p style={{ fontSize: '0.95rem', color: '#475569' }}>
                                Physical activity data for understanding glucose response to exercise
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <div className="card-body">
                    <h2 className="section-title">Access & Availability</h2>
                    <p style={{ marginBottom: '1.5rem', lineHeight: '1.8' }}>
                        MetaboNet is structured to maximize accessibility while respecting data use agreements and privacy requirements:
                    </p>

                    <div style={{ marginTop: '1.5rem' }}>
                        <div style={{ marginBottom: '1.5rem', padding: '1.5rem', background: '#f0fdf4', borderRadius: '8px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#16a34a', marginBottom: '0.5rem' }}>
                                🌍 Public Access Tier
                            </h3>
                            <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                                Immediately available datasets comprising 1,500 patient-years of data. These include Loop Observational Study, IOBP2 RCT, PEDAP, FLAIR,
                                and DCLP studies, with data originating from the Jaeb Center for Health Research and other public sources.
                            </p>
                        </div>

                        <div style={{ marginBottom: '1.5rem', padding: '1.5rem', background: '#eff6ff', borderRadius: '8px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#2563eb', marginBottom: '0.5rem' }}>
                                🔒 DUA-Protected Tier
                            </h3>
                            <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                                Datasets requiring data use agreements, including T1DEXI, T1DEXIP, and Tidepool-JDRF data.
                                We provide guidance on obtaining necessary approvals for access.
                            </p>
                        </div>

                        <div style={{ padding: '1.5rem', background: '#f3f4f6', borderRadius: '8px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                                🏢 Research Partnership
                            </h3>
                            <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                                Additional data available through research partnerships and direct collaborations.
                                Contact us for custom data requirements.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <div className="card-body">
                    <h2 className="section-title">Research Impact</h2>
                    <p style={{ marginBottom: '1.5rem', lineHeight: '1.8' }}>
                        By providing a standardized, comprehensive dataset, MetaboNet enables:
                    </p>

                    <ul style={{ lineHeight: '2', marginLeft: '2rem' }}>
                        <li><strong>Reproducible Research:</strong> Standardized format allows direct comparison of algorithm performance</li>
                        <li><strong>Robust Algorithm Development:</strong> Diverse patient population ensures generalizable solutions</li>
                        <li><strong>Accelerated Innovation:</strong> Researchers can focus on algorithm development rather than data preprocessing</li>
                        <li><strong>Collaborative Science:</strong> Common dataset enables the community to build on each other's work</li>
                        <li><strong>Clinical Translation:</strong> Real-world diversity supports development of clinically viable solutions</li>
                    </ul>
                </div>
            </div>

            <div className="card">
                <div className="card-body">
                    <h2 className="section-title">Data Access and Collaboration</h2>
                    <p style={{ marginBottom: '1.5rem', lineHeight: '1.8' }}>
                        MetaboNet is available to researchers working on automated insulin delivery algorithms and related diabetes management systems.
                        Access procedures vary by dataset tier, with public datasets immediately available and DUA-protected datasets requiring appropriate agreements.
                        Researchers interested in contributing additional datasets or accessing commercial partnership data should contact the Replica Health team.
                    </p>

                    <div style={{
                        marginTop: '2rem',
                        padding: '2rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '12px',
                        color: 'white',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Access MetaboNet</h3>
                        <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
                            View available datasets and access procedures
                        </p>
                        <Link to="/data" style={{
                            display: 'inline-block',
                            padding: '0.875rem 2rem',
                            background: 'white',
                            color: '#764ba2',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: '600',
                            fontSize: '1rem'
                        }}>
                            Browse Data →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}