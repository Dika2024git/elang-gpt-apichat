const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();
app.use(express.json());

// 🔹 Baca API Key dari file JSON
const config = JSON.parse(fs.readFileSync("config.json", "utf8"));
const API_KEYS = config.API_KEYS;

app.get("/chat", (req, res) => {
    const text = req.query.text;
    const apikey = req.query.apikey
    
    // 🔹 Validasi API Key (harus ada dalam daftar API_KEYS)
    if (!apikey || !API_KEYS.includes(apikey)) {
        return res.status(403).json({
            status: "error",
            message: "Akses ditolak! API Key tidak valid."
        });
    }
    
    // 🔹 Validasi input text
    if (!text || text.trim() === "") {
        return res.status(400).json({
            status: "error",
            message: "Masukkan teks yang valid!"
        });
    }

    exec(`python3 model.py "${text}"`, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({
                status: "error",
                message: "Gagal menjalankan AI",
                details: stderr
            });
        }
        // 🔹 JSON Response (Input & Output)
        res.json({
            status: "success",
            input: text,
            output: stdout.trim()
        });
    });
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend.html"));
});

module.exports = app;