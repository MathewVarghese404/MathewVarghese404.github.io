require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from current directory
app.use(express.static(__dirname));

app.post('/api/chat', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'your_actual_key_here') {
        return res.status(500).json({ error: 'GEMINI_API_KEY is missing or invalid on the server.' });
    }

    try {
        const body = JSON.stringify(req.body);
        
        const options = {
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            }
        };

        // Set headers for SSE response
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const proxyReq = https.request(options, (proxyRes) => {
            proxyRes.on('data', (chunk) => {
                res.write(chunk);
            });

            proxyRes.on('end', () => {
                res.end();
            });
        });

        proxyReq.on('error', (e) => {
            console.error('Problem with request to Gemini API:', e.message);
            res.end();
        });

        proxyReq.write(body);
        proxyReq.end();
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`API proxy enabled at http://localhost:${PORT}/api/chat`);
});
