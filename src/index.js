const express = require('express');
const app = express();

app.get('/health', (_, res) => res.json({ status: 'ok' }));

app.listen(3000, () => console.log('App running on port 3000'));
