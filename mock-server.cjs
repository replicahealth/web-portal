const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Mock public datasets
const publicGroups = [
    {
        name: "Loop Observational Study",
        type: "public",
        count: 2,
        files: [
            { key: "processed_data_final_expanded/Loop_Part1_of_2.csv", size: 5120000 },
            { key: "processed_data_final_expanded/Loop_Part2_of_2.csv", size: 4096000 }
        ]
    },
    {
        name: "FLAIR",
        type: "public",
        count: 1,
        files: [
            { key: "processed_data_final_expanded/Flair.csv", size: 2560000 }
        ]
    },
    {
        name: "OpenAPS Commons",
        type: "public",
        count: 1,
        files: [
            { key: "processed_data_final_expanded/OpenAPS.csv", size: 1792000 }
        ]
    },
    {
        name: "IOBP2 RCT",
        type: "public",
        count: 1,
        files: [
            { key: "processed_data_final_expanded/IOBP2.csv", size: 3072000 }
        ]
    },
    {
        name: "PEDAP",
        type: "public",
        count: 1,
        files: [
            { key: "processed_data_final_expanded/PEDAP.csv", size: 2048000 }
        ]
    },
    {
        name: "OhioT1DM",
        type: "public",
        count: 1,
        files: [
            { key: "processed_data_final_expanded/OhioT1DM.csv", size: 512000 }
        ]
    }
];

// Mock private datasets
const privateGroups = [
    {
        name: "DCLP3",
        type: "private",
        count: 1,
        files: [
            { key: "processed_data_final_expanded/DCLP3.csv", size: 1536000 }
        ]
    },
    {
        name: "DCLP5",
        type: "private",
        count: 1,
        files: [
            { key: "processed_data_final_expanded/DCLP5.csv", size: 2048000 }
        ]
    },
    {
        name: "T1DEXI",
        type: "private",
        count: 1,
        files: [
            { key: "processed_data_final_expanded/T1DEXI.csv", size: 1024000 }
        ]
    },
    {
        name: "T1DEXIP",
        type: "private",
        count: 1,
        files: [
            { key: "processed_data_final_expanded/T1DEXIP.csv", size: 512000 }
        ]
    },
    {
        name: "Tidepool-JDRF Project",
        type: "private",
        count: 1,
        files: [
            { key: "processed_data_final_expanded/Tidepool-JDRF-Study.csv", size: 3072000 }
        ]
    }
];

// Mock list endpoints
app.get('/presign', (req, res) => {
    const { op, type } = req.query;
    
    if (op === 'list') {
        if (!type || !['public', 'private'].includes(type)) {
            return res.status(400).json({ error: 'Invalid type parameter' });
        }
        
        const groups = type === 'public' ? publicGroups : privateGroups;
        
        res.json({
            bucket: "replica-general-data-repository",
            prefix: "processed_data_final_expanded/",
            type,
            groups,
            expires: 3600
        });
        return;
    }
    
    if (op === 'list_groups') {
        // Return all groups for backward compatibility
        res.json({
            bucket: "replica-general-data-repository",
            prefix: "processed_data_final_expanded/",
            groups: [...publicGroups, ...privateGroups],
            expires: 3600
        });
        return;
    }
    
    if (op === 'get') {
        const { key } = req.query;
        if (!key) {
            return res.status(400).json({ error: 'Missing key parameter' });
        }
        
        // For local testing, return a data URL that creates a mock CSV file
        const fileName = key.split('/').pop() || 'dataset.csv';
        const csvContent = `Dataset,Value,Timestamp\n${fileName.replace('.csv', '')},123,2023-12-01\nSample,456,2023-12-02`;
        const mockUrl = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
        
        res.json({
            url: mockUrl,
            method: 'GET',
            key,
            expires: Math.floor(Date.now() / 1000) + 3600
        });
        return;
    }
    
    res.status(400).json({ error: 'Invalid operation' });
});

// Mock batch endpoint
app.post('/presign', (req, res) => {
    const { op } = req.query;
    
    if (op === 'batch') {
        const { datasets } = req.body;
        
        if (!datasets || !Array.isArray(datasets)) {
            return res.status(400).json({ error: 'datasets required (array in JSON body)' });
        }
        
        const urls = [];
        const skipped = [];
        
        for (const datasetName of datasets) {
            const allGroups = [...publicGroups, ...privateGroups];
            const group = allGroups.find(g => g.name.toLowerCase() === datasetName.toLowerCase());
            
            if (group) {
                for (const file of group.files) {
                    const fileName = file.key.split('/').pop() || 'dataset.csv';
                    const csvContent = `Dataset,Value,Timestamp\n${fileName.replace('.csv', '')},123,2023-12-01\nSample,456,2023-12-02`;
                    const mockUrl = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
                    urls.push({
                        name: group.name,
                        key: file.key,
                        size: file.size,
                        url: mockUrl
                    });
                }
            } else {
                skipped.push({ name: datasetName, reason: 'group name not found' });
            }
        }
        
        res.json({ urls, skipped, expires: 3600 });
        return;
    }
    
    res.status(400).json({ error: 'Invalid operation' });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Mock server running on http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log('  GET /presign?op=list&type=public');
    console.log('  GET /presign?op=list&type=private');
    console.log('  GET /presign?op=list_groups');
    console.log('  POST /presign?op=batch');
});