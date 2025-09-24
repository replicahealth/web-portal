const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Mock dataset groups (based on your Lambda function's toGroupName mapping)
const mockGroups = [
    {
        name: "DCLP",
        count: 3,
        files: [
            { key: "processed_data_final_expanded/DCLP1.csv", size: 1024000 },
            { key: "processed_data_final_expanded/DCLP2.csv", size: 2048000 },
            { key: "processed_data_final_expanded/DCLP3.csv", size: 1536000 }
        ]
    },
    {
        name: "Loop study public dataset",
        count: 2,
        files: [
            { key: "processed_data_final_expanded/Loop_Part1_of_2.csv", size: 5120000 },
            { key: "processed_data_final_expanded/Loop_Part2_of_2.csv", size: 4096000 }
        ]
    },
    {
        name: "JDRF_CGM_RCT",
        count: 1,
        files: [
            { key: "processed_data_final_expanded/Tidepool-JDRF-Study.csv", size: 3072000 }
        ]
    },
    {
        name: "FLAIRPublicDataSet",
        count: 1,
        files: [
            { key: "processed_data_final_expanded/Flair.csv", size: 2560000 }
        ]
    },
    {
        name: "OpenAPS Data",
        count: 1,
        files: [
            { key: "processed_data_final_expanded/OpenAPS.csv", size: 1792000 }
        ]
    }
];

// Mock list_groups endpoint
app.get('/presign', (req, res) => {
    const { op } = req.query;
    
    if (op === 'list_groups') {
        res.json({
            bucket: "replica-general-data-repository",
            prefix: "processed_data_final_expanded/",
            groups: mockGroups,
            expires: 3600
        });
        return;
    }
    
    if (op === 'get') {
        const { key } = req.query;
        if (!key) {
            return res.status(400).json({ error: 'Missing key parameter' });
        }
        
        // Generate mock presigned URL
        const mockUrl = `https://replica-general-data-repository.s3.amazonaws.com/${key}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=3600&mock=true`;
        
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
            const group = mockGroups.find(g => g.name.toLowerCase() === datasetName.toLowerCase());
            
            if (group) {
                for (const file of group.files) {
                    const mockUrl = `https://replica-general-data-repository.s3.amazonaws.com/${file.key}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=3600&mock=true`;
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
    console.log('  GET /presign?op=list_groups');
    console.log('  POST /presign?op=batch');
});