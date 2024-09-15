const express = require('express');
const app = express();
app.use(express.json());

const db = require('./db');

// FullTable-Scan GET /mytablename
app.get('/mytablename', async (req, res) => {
    try {
        const results = await db.query('SELECT * FROM mytablename');
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Insert POST /mytablename
app.post('/mytablename', async (req, res) => {
    const { name } = req.body;
    try {
        const result = await db.query('INSERT INTO mytablename (name) VALUES (?)', [name]);
        res.status(201).json({ id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete DELETE /mytablename?name=kevin
app.delete('/mytablename', async (req, res) => {
    const { name } = req.query;
    try {
        const result = await db.query('DELETE FROM mytablename WHERE name = ?', [name]);
        res.status(200).json({ message: `${result.affectedRows} rows deleted` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
