const express = require("express");
const { exec } = require("child_process");

const app = express();
app.use(express.json());

app.get("/chat", (req, res) => {
    const text = req.query.text;
    
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
