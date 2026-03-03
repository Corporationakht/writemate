const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// GET /api/templates/:type
router.get('/:type', (req, res) => {
    const { type } = req.params;
    const filePath = path.join(__dirname, '..', 'templates', `${type}.json`);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: `Template "${type}" tidak ditemukan.` });
    }

    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Gagal membaca template.' });
    }
});

module.exports = router;
