const express = require('express');
const path = require("path");
const { exec } = require('child_process');

const app = express();
app.use(express.json());

// API GET untuk Model Python
app.get('/url/chat', (req, res) => {
    const text = req.query.text || "Hello, AI!";
    exec(`python3 model.py "${text}"`, (error, stdout, stderr) => {
        if (error) return res.status(500).json({ error: stderr });
        res.json({ result: stdout.trim() });
    });
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend.html"));
});

module.exports = app;