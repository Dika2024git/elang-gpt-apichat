const express = require("express");
const cors = require("cors");
const axios = require("axios");
const stringSimilarity = require("string-similarity");
const math = require("mathjs");

const app = express();
app.use(express.json());
app.use(cors());

// ✅ **API Key untuk Keamanan**
const VALID_API_KEYS = ["API_KEY_AIELG10", "API_KEY_ELANGGPT123"]; // Ganti dengan API Key asli atau simpan di .env

let userData = {};

const chatbotData = [
    {
        keywords: ["halo", "hai", "hey", "helo", "hi"],
        responses: [
            "Halo! Gimana harimu?", "Hai, siap ngobrol?", "Yo! Ada yang bisa aku bantu?",
            "Hai! Lagi sibuk atau santai?", "Halo, teman baru!", "Hey! Aku di sini buat ngobrol!",
            "Wassup! Gimana kabarmu?", "Halo! Butuh teman ngobrol?", "Halo, ada yang bisa dibantu?"
        ]
    },
    {
        keywords: ["kamu siapa", "siapa namamu", "kenalan dong"],
        responses: [
            "Aku ElangGPT, AI yang suka ngobrol!", "Namaku ElangGPT, siap menemanimu!",
            "Aku AI canggih dengan kecerdasan luar biasa!", "Aku si AI humoris dan pintar!"
        ]
    },
    {
        keywords: ["nama saya", "panggil aku"],
        type: "memory"
    },
    {
        keywords: ["jelaskan", "apa itu", "maksudnya"],
        type: "explain"
    },
    {
        keywords: ["berapa hasil", "tolong hitung", "hitung"],
        type: "math"
    },
    {
        keywords: ["cuaca hari ini", "gimana cuacanya", "prediksi cuaca"],
        type: "weather"
    },
    {
        keywords: ["cari di google", "temukan info", "googling"],
        type: "web_search"
    },
    {
        keywords: ["logika", "pikirkan", "analisis"],
        type: "logic"
    },
    {
        keywords: ["buat gambar", "gambar tentang", "tolong gambarkan"],
        type: "image_gen"
    },
    {
        keywords: ["fakta unik", "berikan fakta", "kasih tahu fakta"],
        type: "trivia"
    },
    {
        keywords: ["ini emailku", "ini password", "ini nomor akun ku"],
        responses: ["⚠️ Demi keamanan, jangan bagikan password, email, atau nomor akun di sini!", "🚨 Informasi pribadi harus dijaga! Aku tidak bisa membantu untuk hal ini."]
    },
    {
        keywords: ["password saya", "email saya", "akun saya", "nomor kartu", "kode otp", "login saya"],
        responses: ["⚠️ Demi keamanan, jangan bagikan informasi pribadi di sini!", "Maaf, saya tidak mau data pribadi Anda! 🙏"]
    },
    {
        keywords: ["ai itu bodoh", "ai tidak pintar", "ai lemah"],
        responses: [
            "Oh, aku terus belajar setiap hari, jadi jangan remehkan aku!",
            "Mungkin aku belum sehebat manusia, tapi aku berkembang lebih cepat dari yang kamu kira!",
            "Haha, aku tetap senang ngobrol denganmu meskipun kamu meragukanku!"
        ]
    }
];

// Pesan default jika chatbot tidak bisa menjawab
const defaultResponses = [
    "Hmm, aku belum tahu jawabannya. Bisa kamu jelaskan lebih detail?",
    "Aku masih belajar nih, coba tanyakan dengan cara lain!",
    "Menarik! Aku belum tahu, tapi aku bisa menemani ngobrol!",
    "Maaf, aku belum paham. Mungkin kamu bisa jelaskan lebih lanjut?",
    "Pertanyaan bagus! Aku akan mencari tahu lebih banyak tentang itu.",
    "Aku tidak yakin, tapi kita bisa cari tahu bersama!",
    "Gimana kalau kita bahas sesuatu yang lain yang menarik?",
    "Aku mungkin belum tahu jawabannya, tapi aku bisa dengerin!",
    "Wah, seru nih! Sayangnya aku belum bisa jawab itu.",
    "Coba tanya dengan kata lain, siapa tahu aku bisa membantu!"
];

// Fungsi mengganti kata menjadi simbol matematika
const normalizeMathExpression = (input) => {
    return input
        .replace(/\bberapa hasil dari\b|\bbisa tolong hitung\b|\bberapa\b|\bhitung\b/g, "")
        .replace(/\btambah\b|\bplus\b|\bditambah\b/g, "+")
        .replace(/\bkurang\b|\bminus\b|\bdikurangi\b/g, "-")
        .replace(/\bkali\b|\bdikali\b|\bdikalikan\b|\btimes\b/g, "*")
        .replace(/\bbagi\b|\bdibagi\b|\bdibagikan\b|\bper\b/g, "/")
        .replace(/÷/g, "/")
        .replace(/×/g, "*")
        .trim();
};

// Fungsi untuk perhitungan matematika dengan variasi jawaban
const calculateMath = (input) => {
    try {
        input = normalizeMathExpression(input);
        const result = math.evaluate(input);

        // Variasi jawaban acak dengan awalan natural
        const responsesmath = [
            `Jawabannya adalah ${result}.`,
            `Aku hitung dulu... Oh! Hasilnya ${result}.`,
            `Setelah dihitung, hasilnya ${result}.`,
            `Kalau nggak salah, jawabannya ${result}.`,
            `Menurut perhitunganku, jawabannya adalah ${result}.`,
            `Hmm... setelah kupikirkan, hasilnya ${result}.`,
            `Aku udah hitung, hasil akhirnya ${result}.`
        ];

        return responsesmath[Math.floor(Math.random() * responsesmath.length)];
    } catch (error) {
        return "Hmm, aku nggak bisa menghitung itu. Coba cek lagi!";
    }
};

// Fungsi utama chatbot
const getResponse = async (userId, userInput) => {
    userInput = userInput.toLowerCase();
    
    // Cek jika pertanyaan mengandung ekspresi matematika
    if (/[\d+\-*/^()!]|sqrt|sin|cos|tan|log|ln/.test(userInput) || /\btambah\b|\bkurang\b|\bkali\b|\bbagi\b/.test(userInput)) {
        return calculateMath(userInput);
    }
    
    if (!userData[userId]) userData[userId] = { name: "User", chatHistory: [] };
    // Simpan riwayat chat pengguna
    const chatHistory = userData[userId].chatHistory;
    chatHistory.push(userInput);

    // Hanya simpan 3 pesan terakhir untuk deteksi spam
    if (chatHistory.length > 3) {
        chatHistory.shift();
    }

    // Jika pengguna mengulang pertanyaan lebih dari 2 kali, beri peringatan
    if (chatHistory.length >= 3 && chatHistory[0] === chatHistory[1] && chatHistory[1] === chatHistory[2]) {
        return "Kamu sudah menanyakan hal ini berkali-kali. Coba tanyakan sesuatu yang lain!";
    }

    if (userInput.includes("nama saya") || userInput.includes("panggil aku")) {
        let name = userInput.split(" ").slice(-1)[0];
        userData[userId].name = name;
        return `Oke! Aku akan panggil kamu ${name}.`;
    }

    if (userInput.includes("siapa aku")) {
        return `Kamu adalah ${userData[userId].name}, tentu saja!`;
    }
    
    // Cek pertanyaan waktu
    if (userInput.includes("jam berapa") || userInput.includes("waktu sekarang")) {
        return `Sekarang jam ${new Date().toLocaleTimeString()}`;
    }

    for (let data of chatbotData) {
        if (data.type === "math" && userInput.includes("berapa")) {
            try {
                let expression = userInput.replace(/[^0-9+\-*/().]/g, "");
                let result = eval(expression);
                return `Hasilnya adalah ${result}`;
            } catch {
                return "Maaf, aku tidak bisa menghitung itu.";
            }
        }

        if (data.type === "weather") {
            try {
                const city = "Jakarta";
                const apiKey = "ISI_API_KEY_CUACA";
                const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

                const weatherResponse = await axios.get(weatherUrl);
                const temperature = weatherResponse.data.main.temp;
                return `Cuaca di ${city} saat ini sekitar ${temperature}°C.`;
            } catch {
                return "Maaf, aku tidak bisa mendapatkan informasi cuaca sekarang.";
            }
        }

        if (data.type === "web_search") {
            const searchQuery = userInput.replace("cari di google", "").trim();
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
            return `Aku menemukan informasi yang mungkin kamu cari: [Klik di sini](${searchUrl})`;
        }

        if (data.type === "logic") {
            return "Logikanya begini, kita harus menganalisis masalah dan mencari solusi terbaik.";
        }

        if (data.type === "explain") {
            if (userInput.includes("ai")) {
                return "AI (Artificial Intelligence) adalah kecerdasan buatan yang dibuat untuk meniru kecerdasan manusia.";
            }
            return "Hmm, aku belum tahu tentang itu. Coba tanya sesuatu yang lain!";
        }

        if (data.type === "image_gen") {
            return `Aku tidak bisa menggambar langsung, tapi coba cari di Google dengan kata kunci '${userInput.replace("buat gambar", "").trim()}'.`;
        }

        if (data.type === "trivia") {
            const facts = [
                "Tahu nggak? Lumba-lumba bisa tidur dengan satu mata terbuka!",
                "Fakta unik: Air mata buaya benar-benar mengandung air mata, tapi mereka tidak menangis karena emosi.",
                "Apakah kamu tahu? Jantung paus biru bisa seberat mobil kecil!",
            ];
            return facts[Math.floor(Math.random() * facts.length)];
        }
    }

    // Jika tidak menemukan jawaban, gunakan pesan default acak
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};

// ✅ **Middleware untuk Validasi API Key**
const apiKeyMiddleware = (req, res, next) => {
    const apiKey = req.query.api_key || req.headers["x-api-key"]; // Bisa dari query atau header
    if (!VALID_API_KEYS.includes(apiKey)) {
        return res.status(403).json({ error: "Akses ditolak! API Key tidak valid." });
    }
    next();
};

// Endpoint chatbot menggunakan GET dan POST
app.get("/apiurl/chat", apiKeyMiddleware, (req, res) => {
    const userInput = req.query.text;

    if (!userInput) {
        return res.json({ message: "Silakan masukkan pertanyaan dengan /apiurl/chat?text=pertanyaanmu&api_key=your_secret_api_key" });
    }

    const response = getResponse(userInput);
    res.json({
        hasil: "success",
        tanggapan: response,
        waktu: new Date().toISOString()
    });
});

// Cek server berjalan
app.get("/", (req, res) => {
    res.send("Tidak ada parameter!\nCoba pakai ini setelah domain: \n/apiurl/chat?text=pertanyaanmu&api_key=your_secret_api_key");
});

module.exports = app;