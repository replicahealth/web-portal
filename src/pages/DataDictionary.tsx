export default function DataDictionary() {
    const dataColumns = [
        {
            category: "Core Measurements",
            columns: [
                {
                    name: "cgm",
                    type: "Float",
                    unit: "mg/dL",
                    description: "Blood glucose value from continuous glucose monitor",
                    availability: "All datasets",
                    coverage: "82.6%",
                    notes: "Primary outcome variable for glucose control algorithms"
                },
                {
                    name: "basal",
                    type: "Float",
                    unit: "IU",
                    description: "Basal insulin dose delivered within the previous 5 minutes",
                    availability: "All datasets except IOBP2",
                    coverage: "87.4%",
                    notes: "In IOBP2, all insulin is recorded as bolus"
                },
                {
                    name: "bolus",
                    type: "Float",
                    unit: "IU",
                    description: "Bolus insulin dose delivered within the previous 5 minutes",
                    availability: "All datasets",
                    coverage: "40.3%",
                    notes: "Sparse - typically 3-5 boluses per day"
                },
                {
                    name: "insulin",
                    type: "Float",
                    unit: "IU",
                    description: "Total insulin delivered within the previous 5 minutes (basal + bolus)",
                    availability: "All datasets",
                    coverage: "92.8%",
                    notes: "Derived field for total insulin exposure"
                },
                {
                    name: "carbs",
                    type: "Integer",
                    unit: "g",
                    description: "User reported carbohydrates",
                    availability: "Most datasets",
                    coverage: "59.6%",
                    notes: "Contains both 0s and nulls depending on source. Sparse - 3-4 entries per day max"
                },
                {
                    name: "scheduled_basal",
                    type: "Float",
                    unit: "IU/hr",
                    description: "Programmed basal rate (before any temporary adjustments)",
                    availability: "Most datasets",
                    coverage: "96.9%",
                    notes: "Useful for understanding algorithm adjustments vs. programmed rates"
                }
            ]
        },
        {
            category: "Temporal & Identification",
            columns: [
                {
                    name: "id",
                    type: "String",
                    unit: "",
                    description: "Unique identifier for the subject",
                    availability: "All datasets",
                    coverage: "100%",
                    notes: "Consolidation may occur when duplicates found across studies"
                },
                {
                    name: "date",
                    type: "Datetime",
                    unit: "",
                    description: "Timestamp of the measurement",
                    availability: "All datasets",
                    coverage: "100%",
                    notes: "Localized when possible; minority have ambiguous or unknown timezone"
                },
                {
                    name: "source_file",
                    type: "String",
                    unit: "",
                    description: "Name of the source dataset file",
                    availability: "All datasets",
                    coverage: "100%",
                    notes: "Values include: Loop_Part(1-8)_of_8, Flair, T1DEXI, DCLP3, PEDAP, OhioT1DM, etc."
                }
            ]
        },
        {
            category: "Subject Demographics",
            columns: [
                {
                    name: "age",
                    type: "Integer",
                    unit: "years",
                    description: "Age of subject (block sparse - repeated for same subject)",
                    availability: "Most datasets",
                    coverage: "99.8%",
                    notes: "Static within each subject's data"
                },
                {
                    name: "gender",
                    type: "String",
                    unit: "",
                    description: "Subject gender",
                    availability: "Most datasets",
                    coverage: "90.2%",
                    notes: "Values: 'Female', 'Male', 'Non-binary'"
                },
                {
                    name: "height",
                    type: "Float",
                    unit: "feet",
                    description: "Height of the subject",
                    availability: "Most datasets",
                    coverage: "81.5%",
                    notes: "Static demographic information"
                },
                {
                    name: "weight",
                    type: "Float",
                    unit: "lbs",
                    description: "Weight of the subject",
                    availability: "Most datasets",
                    coverage: "81.5%",
                    notes: "May vary slightly over study duration"
                },
                {
                    name: "TDD",
                    type: "Float",
                    unit: "IU",
                    description: "Average total daily insulin for subject (block sparse)",
                    availability: "Most datasets",
                    coverage: "96.9%",
                    notes: "Calculated average, repeated for all rows of same subject"
                },
                {
                    name: "age_of_diagnosis",
                    type: "Integer",
                    unit: "years",
                    description: "Age when diagnosed with Type 1 Diabetes",
                    availability: "Some datasets",
                    coverage: "Variable",
                    notes: "Important for understanding disease duration"
                },
                {
                    name: "ethnicity",
                    type: "String",
                    unit: "",
                    description: "Subject ethnicity",
                    availability: "Limited datasets",
                    coverage: "Variable",
                    notes: "Multiple ethnicities separated by comma"
                },
                {
                    name: "is_pregnant",
                    type: "Boolean",
                    unit: "",
                    description: "Whether subject was pregnant at start of data collection",
                    availability: "Limited datasets",
                    coverage: "Variable",
                    notes: "Important for glucose target considerations"
                }
            ]
        },
        {
            category: "Exercise & Activity",
            columns: [
                {
                    name: "steps",
                    type: "Float",
                    unit: "count",
                    description: "Sum of steps in the previous 5 minutes",
                    availability: "Limited datasets",
                    coverage: "2.8%",
                    notes: "Primarily from wearable devices"
                },
                {
                    name: "heartrate",
                    type: "Float",
                    unit: "bpm",
                    description: "Average heart rate during the previous 5 minutes",
                    availability: "Limited datasets",
                    coverage: "1.9%",
                    notes: "From fitness trackers or smartwatches"
                },
                {
                    name: "calories_burned",
                    type: "Float",
                    unit: "kcal",
                    description: "Sum of calories burned within the previous 5 minutes",
                    availability: "Limited datasets",
                    coverage: "24.0%",
                    notes: "Estimated from activity data"
                },
                {
                    name: "workout_duration",
                    type: "Float",
                    unit: "minutes",
                    description: "Duration of workout/exercise session",
                    availability: "Limited datasets",
                    coverage: "5.5%",
                    notes: "User-reported or device-detected"
                },
                {
                    name: "workout_intensity",
                    type: "Float",
                    unit: "1-10 scale",
                    description: "User-reported workout intensity",
                    availability: "Very limited",
                    coverage: "0.009%",
                    notes: "Subjective intensity rating"
                },
                {
                    name: "workout_label",
                    type: "String",
                    unit: "",
                    description: "Name/type of workout",
                    availability: "Very limited",
                    coverage: "0.04%",
                    notes: "E.g., 'Running', 'Cycling', etc."
                },
                {
                    name: "acceleration",
                    type: "Double",
                    unit: "m/s²",
                    description: "Mean acceleration aggregated for 5-minute intervals",
                    availability: "OhioT1DM only",
                    coverage: "0.03%",
                    notes: "From accelerometer data"
                }
            ]
        },
        {
            category: "Device & Algorithm Information",
            columns: [
                {
                    name: "cgm_device",
                    type: "String",
                    unit: "",
                    description: "Model/brand of continuous glucose monitor",
                    availability: "Most datasets",
                    coverage: "Variable",
                    notes: "E.g., 'Dexcom G6', 'Freestyle Libre'"
                },
                {
                    name: "insulin_delivery_device",
                    type: "String",
                    unit: "",
                    description: "Device used to deliver insulin",
                    availability: "Most datasets",
                    coverage: "Variable",
                    notes: "E.g., 'Omnipod DASH', 'MiniMed 670G', 'Multiple Daily Injections'"
                },
                {
                    name: "insulin_delivery_algorithm",
                    type: "String",
                    unit: "",
                    description: "Automated insulin delivery algorithm name, if any",
                    availability: "AID datasets",
                    coverage: "Variable",
                    notes: "E.g., 'LoopAlgorithm', 'Control-IQ', 'Omnipod 5'"
                },
                {
                    name: "insulin_delivery_modality",
                    type: "String",
                    unit: "",
                    description: "Type of insulin delivery system",
                    availability: "Most datasets",
                    coverage: "Variable",
                    notes: "Values: 'MDI' (injections), 'SAP' (pump), 'AID' (automated)"
                },
                {
                    name: "insulin_type_basal",
                    type: "String",
                    unit: "",
                    description: "Type of insulin used for basal doses",
                    availability: "Some datasets",
                    coverage: "Variable",
                    notes: "E.g., 'fiasp', 'humalog', 'lyumjev'"
                },
                {
                    name: "insulin_type_bolus",
                    type: "String",
                    unit: "",
                    description: "Type of insulin used for bolus doses",
                    availability: "Most datasets",
                    coverage: "82.7%",
                    notes: "Both rapid and long-acting types may appear"
                }
            ]
        },
        {
            category: "Physiological Signals",
            columns: [
                {
                    name: "galvanic_skin_response",
                    type: "Float",
                    unit: "µS (micro-Siemens)",
                    description: "Galvanic skin response in the previous 5 minutes",
                    availability: "OhioT1DM only",
                    coverage: "0.08%",
                    notes: "Indicator of stress/arousal"
                },
                {
                    name: "skin_temp",
                    type: "Float",
                    unit: "°F",
                    description: "Average skin temperature the previous 5 minutes",
                    availability: "OhioT1DM only",
                    coverage: "0.08%",
                    notes: "From wearable temperature sensor"
                },
                {
                    name: "air_temp",
                    type: "Float",
                    unit: "°F",
                    description: "Average air temperature the previous 5 minutes",
                    availability: "OhioT1DM only",
                    coverage: "0.05%",
                    notes: "Environmental temperature"
                }
            ]
        },
        {
            category: "Meal Information",
            columns: [
                {
                    name: "absorption_time",
                    type: "Integer",
                    unit: "minutes",
                    description: "Reported carbohydrate absorption time for meal events",
                    availability: "Loop, Tidepool, Replica",
                    coverage: "0.004%",
                    notes: "Sparse - only appears 3-4 times daily where collected"
                },
                {
                    name: "meal_label",
                    type: "String",
                    unit: "",
                    description: "User-reported name/description of meal",
                    availability: "Very limited",
                    coverage: "0.07%",
                    notes: "Free text meal descriptions"
                }
            ]
        }
    ];

    return (
        <div className="container">
            <h1 style={{ marginBottom: '1rem' }}>MetaboNet Data Dictionary</h1>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <div className="card-body">
                    <h2 className="section-title">Overview</h2>
                    <p style={{ lineHeight: '1.7' }}>
                        This comprehensive data dictionary describes all columns available in the MetaboNet dataset.
                        Each row in the dataset represents a 5-minute interval of measurements, with columns standardized
                        across all source datasets. While core measurements (CGM, insulin) are present in all datasets,
                        additional features vary by source based on the original study design and available sensors.
                    </p>
                    <p style={{ lineHeight: '1.7', marginTop: '1rem' }}>
                        <strong>Coverage percentages</strong> indicate the proportion of non-null values across the entire
                        consolidated dataset. Lower coverage doesn't indicate poor quality—it often reflects that a feature
                        is only available in specific studies or represents sparse events (e.g., meals, exercise).
                    </p>
                </div>
            </div>

            {dataColumns.map((category, idx) => (
                <div key={idx} className="card" style={{ marginBottom: '1.5rem' }}>
                    <div className="card-body">
                        <h2 className="section-title">{category.category}</h2>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                        <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600', minWidth: '120px' }}>Column</th>
                                        <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600', minWidth: '80px' }}>Type</th>
                                        <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600', minWidth: '80px' }}>Unit</th>
                                        <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600', minWidth: '250px' }}>Description</th>
                                        <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600', minWidth: '100px' }}>Coverage</th>
                                        <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600', minWidth: '200px' }}>Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {category.columns.map((col, colIdx) => (
                                        <tr key={colIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '10px', fontFamily: 'monospace', fontWeight: '500', color: '#1e40af' }}>
                                                {col.name}
                                            </td>
                                            <td style={{ padding: '10px', fontSize: '0.85rem', color: '#475569' }}>
                                                {col.type}
                                            </td>
                                            <td style={{ padding: '10px', fontSize: '0.85rem', color: '#475569' }}>
                                                {col.unit || '—'}
                                            </td>
                                            <td style={{ padding: '10px', fontSize: '0.85rem', lineHeight: '1.5' }}>
                                                {col.description}
                                            </td>
                                            <td style={{ padding: '10px', fontSize: '0.85rem' }}>
                                                <span style={{
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    background: parseFloat(col.coverage) > 80 ? '#dcfce7' :
                                                               parseFloat(col.coverage) > 50 ? '#fef3c7' : '#fee2e2',
                                                    color: parseFloat(col.coverage) > 80 ? '#166534' :
                                                           parseFloat(col.coverage) > 50 ? '#92400e' : '#991b1b',
                                                    fontWeight: '500'
                                                }}>
                                                    {col.coverage}
                                                </span>
                                            </td>
                                            <td style={{ padding: '10px', fontSize: '0.85rem', color: '#64748b', lineHeight: '1.4' }}>
                                                {col.notes}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ))}

            <div className="card" style={{ marginBottom: '2rem' }}>
                <div className="card-body">
                    <h2 className="section-title">Source Dataset Information</h2>
                    <p style={{ marginBottom: '1rem', lineHeight: '1.7' }}>
                        The <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '3px' }}>source_file</code> column
                        identifies the origin dataset for each row. This enables researchers to filter data by study characteristics,
                        account for study-specific effects, or focus on datasets with particular features (e.g., only OhioT1DM for
                        physiological signals).
                    </p>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                    <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600' }}>Source File Value</th>
                                    <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600' }}>Dataset Name</th>
                                    <th style={{ padding: '10px', textAlign: 'left', fontWeight: '600' }}>Special Features</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: '0.85rem' }}>Loop_Part1_of_8...Loop_Part8_of_8</td>
                                    <td style={{ padding: '10px' }}>Loop Observational Study</td>
                                    <td style={{ padding: '10px', fontSize: '0.85rem', color: '#475569' }}>Large DIY AID user cohort, Loop algorithm data</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
                                    <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: '0.85rem' }}>IOBP2</td>
                                    <td style={{ padding: '10px' }}>IOBP2 RCT</td>
                                    <td style={{ padding: '10px', fontSize: '0.85rem', color: '#475569' }}>Insulin-on-board prediction RCT, all insulin as bolus</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: '0.85rem' }}>T1DEXI</td>
                                    <td style={{ padding: '10px' }}>T1D Exercise Initiative</td>
                                    <td style={{ padding: '10px', fontSize: '0.85rem', color: '#475569' }}>Structured exercise protocols with heart rate monitoring</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
                                    <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: '0.85rem' }}>T1DEXIP</td>
                                    <td style={{ padding: '10px' }}>T1DEXI Pilot</td>
                                    <td style={{ padding: '10px', fontSize: '0.85rem', color: '#475569' }}>Preliminary exercise study data</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: '0.85rem' }}>Tidepool_PartX_of_8</td>
                                    <td style={{ padding: '10px' }}>Tidepool-JDRF Project</td>
                                    <td style={{ padding: '10px', fontSize: '0.85rem', color: '#475569' }}>Real-world diverse pump/CGM combinations</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
                                    <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: '0.85rem' }}>OpenAPS_Commons</td>
                                    <td style={{ padding: '10px' }}>OpenAPS Commons</td>
                                    <td style={{ padding: '10px', fontSize: '0.85rem', color: '#475569' }}>Community-contributed OpenAPS AID data</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: '0.85rem' }}>Flair</td>
                                    <td style={{ padding: '10px' }}>FLAIR Study</td>
                                    <td style={{ padding: '10px', fontSize: '0.85rem', color: '#475569' }}>Flash glucose monitoring (CGM only)</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
                                    <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: '0.85rem' }}>DCLP3</td>
                                    <td style={{ padding: '10px' }}>DCLP3</td>
                                    <td style={{ padding: '10px', fontSize: '0.85rem', color: '#475569' }}>Diabetes Control and Life Project phase 3, hybrid closed-loop</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: '0.85rem' }}>DCLP5</td>
                                    <td style={{ padding: '10px' }}>DCLP5</td>
                                    <td style={{ padding: '10px', fontSize: '0.85rem', color: '#475569' }}>Long-term closed-loop outcomes study</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
                                    <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: '0.85rem' }}>PEDAP</td>
                                    <td style={{ padding: '10px' }}>PEDAP</td>
                                    <td style={{ padding: '10px', fontSize: '0.85rem', color: '#475569' }}>Pediatric diabetes advanced technology study</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: '0.85rem' }}>OhioT1DM</td>
                                    <td style={{ padding: '10px' }}>OhioT1DM</td>
                                    <td style={{ padding: '10px', fontSize: '0.85rem', color: '#475569' }}>Physiological signals (GSR, temperature), deep phenotyping</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-body">
                    <h2 className="section-title">Usage Guidelines</h2>

                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Handling Missing Data</h3>
                    <ul style={{ lineHeight: '1.8', marginLeft: '1.5rem' }}>
                        <li><strong>CGM gaps:</strong> ~17% missing due to sensor warm-up, failures, or removal</li>
                        <li><strong>Sparse events:</strong> Meals, boluses, and exercise are naturally sparse (mostly null)</li>
                        <li><strong>Feature availability:</strong> Check source_file to understand which features are available</li>
                    </ul>

                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Time Alignment</h3>
                    <ul style={{ lineHeight: '1.8', marginLeft: '1.5rem' }}>
                        <li>All data aggregated to 5-minute intervals</li>
                        <li>Insulin doses sum total delivery in previous 5 minutes</li>
                        <li>Activity metrics (steps, calories) sum over the interval</li>
                        <li>Physiological signals (HR, temperature) average over the interval</li>
                    </ul>

                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Important Considerations</h3>
                    <ul style={{ lineHeight: '1.8', marginLeft: '1.5rem' }}>
                        <li><strong>Timezone handling:</strong> Most dates localized, but some have ambiguous or unknown timezones</li>
                        <li><strong>Block-sparse fields:</strong> Demographics (age, TDD) repeated for all rows of same subject</li>
                        <li><strong>Zero vs null:</strong> Carbs may use 0 or null for "no carbs" depending on source</li>
                        <li><strong>Study effects:</strong> Consider source_file when analyzing to account for protocol differences</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}