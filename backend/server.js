require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000'] }));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/templates', require('./routes/templates'));
app.use('/api/references', require('./routes/references'));
app.use('/api/generate', require('./routes/generate'));
app.use('/api/export', require('./routes/export'));

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`✅ WriteMate Backend running on http://localhost:${PORT}`);
});
