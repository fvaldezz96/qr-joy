const express = require('express');
const path = require('path');
const app = express();

const DIST_DIR = path.join(__dirname, 'dist');
const HTML_FILE = path.join(DIST_DIR, 'index.html');

console.log('--- SERVER STARTING ---');
console.log('PORT:', process.env.PORT || 3000);
console.log('DIST_DIR:', DIST_DIR);

// Health check - MUST respond immediately
app.get('/health', (req, res) => {
    console.log('Health check OK');
    res.status(200).send('OK');
});

// Serve static files
app.use(express.static(DIST_DIR));

// SPA fallback
app.use((req, res) => {
    console.log('Request:', req.method, req.url);
    res.sendFile(HTML_FILE);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
