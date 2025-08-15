const express = require('express');
const app = express();

// Route for root URL
app.get('/', (req, res) => {
    res.send('hi bharat');
});

// Optional: keep /health for pipeline tests
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(5001, () => console.log('App running on port 5001'));
