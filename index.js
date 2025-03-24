const express = require("express");
const cors = require("cors");
const { pipeline } = require("@xenova/transformers");

const app = express();
app.use(cors());
app.use(express.json());

let elangGPT;

// Fungsi untuk memuat model hanya sekali
async function loadModel() {
    console.log("🔥 Memuat model Elang GPT...");
    elangGPT = await pipeline("text-generation", "Xenova/gpt2");
    console.log("✅ Elang GPT siap digunakan!");
}

loadModel();

// Kamus terjemahan bahasa daerah
const translations = {
    "aceh": { "saya": "ka", "kamu": "droeneuh", "baik": "bagah", "terima kasih": "meunyoe geutanyoe", "sukses": "meugah" },
    "sasak": { "saya": "tiang", "kamu": "side", "baik": "baniq", "terima kasih": "matur tampiasih", "sukses": "mangkin maju" },
    "toraja": { "saya": "aku", "kamu": "kau", "baik": "melo", "terima kasih": "kurru sumanga", "sukses": "sukses" },
    "ambon": { "saya": "beta", "kamu": "ale", "baik": "bagus skali", "terima kasih": "terima kasih", "sukses": "mangarti" },
    "flores": { "saya": "hau", "kamu": "ita", "baik": "hade", "terima kasih": "obrigadu", "sukses": "sukses" },
    "manado": { "saya": "kita", "kamu": "ngana", "baik": "bagus", "terima kasih": "makase", "sukses": "jadi orang besar" },
    "dayak": { "saya": "aku", "kamu": "ikau", "baik": "manah", "terima kasih": "terima kasih", "sukses": "sukses" },
    "makassar": { "saya": "iya", "kamu": "ko", "baik": "becce", "terima kasih": "tarima kasih", "sukses": "sukses" },
    "ternate": { "saya": "kita", "kamu": "ngana", "baik": "bagus", "terima kasih": "sanget", "sukses": "jadi bos" },
    "kupang": { "saya": "beta", "kamu": "ose", "baik": "bagus", "terima kasih": "domo", "sukses": "maju terus" },
    "betawi": {
            "saya": "gue", "kamu": "elu", "baik": "cakep", "terima kasih": "makasih", "sukses": "tajir"
        },
        "sunda": {
            "saya": "aing", "kamu": "maneh", "baik": "hadé", "terima kasih": "hatur nuhun", "sukses": "sagala aya"
        },
        "jawa": {
            "saya": "aku", "kamu": "koen", "baik": "apik", "terima kasih": "matur nuwun", "sukses": "bejo"
        },
        "madura": {
            "saya": "engkok", "kamu": "be’en", "baik": "bhagus", "terima kasih": "suksema", "sukses": "raghina"
        },
        "melayu": {
            "saya": "ambo", "kamu": "awak", "baik": "bagus", "terima kasih": "terime kasih", "sukses": "maju jaya"
        },
        "minang": {
            "saya": "ambo", "kamu": "ang", "baik": "elok", "terima kasih": "tarimo kasih", "sukses": "berjayo"
        },
        "bugis": {
            "saya": "iyya", "kamu": "iko", "baik": "becce", "terima kasih": "tarima kasih", "sukses": "sukses"
        },
        "bali": {
            "saya": "tiang", "kamu": "ragane", "baik": "becik", "terima kasih": "suksma", "sukses": "suksma jaya"
        },
        "batak": {
            "saya": "ahuling", "kamu": "ho", "baik": "baik ma", "terima kasih": "mauliate", "sukses": "sukses ma"
        },
        "banjar": {
            "saya": "ulun", "kamu": "ikam", "baik": "bagus", "terima kasih": "salam hormat", "sukses": "mangula"
        },
        "papua": {
            "saya": "sa", "kamu": "ko", "baik": "mantap", "terima kasih": "tenkiu", "sukses": "seng ada lawan"
        },
        "indonesia": { "saya": "saya", "kamu": "kamu", "baik": "baik", "terima kasih": "terima kasih", "sukses": "sukses" },
        "gaul": {
            "saya": "gue", "kamu": "lu", "baik": "asik", "terima kasih": "makasih", "sukses": "cuan"
        }
};

// Fungsi deteksi bahasa otomatis berdasarkan kata-kata input user
function detectLanguage(text) {
    for (const [language, words] of Object.entries(translations)) {
        for (const word of Object.keys(words)) {
            if (text.toLowerCase().includes(words[word])) {
                return language;
            }
        }
    }
    return "indonesia"; // Default ke bahasa Indonesia jika tidak terdeteksi
}

// Fungsi terjemahan otomatis
function translateToRegional(text, region) {
    let translatedText = text;
    if (translations[region]) {
        for (const [key, value] of Object.entries(translations[region])) {
            translatedText = translatedText.replace(new RegExp(`\\b${key}\\b`, "gi"), value);
        }
    }
    return translatedText;
}

// Endpoint GET untuk generate teks dengan pilihan bahasa daerah
app.get("/apiurl", async (req, res) => {
    try {
        const prompt = req.query.text;
        const max_length = parseInt(req.query.max_length) || 100;

        if (!prompt) {
            return res.status(400).json({ error: "Masukkan teks sebagai prompt" });
        }
        
        // Deteksi bahasa berdasarkan input
        const detectedLanguage = detectLanguage(prompt);
        console.log(`📡 Bahasa terdeteksi: ${detectedLanguage}`);
        
        const result = await elangGPT(prompt, { max_length });
        let generatedText = result[0].generated_text;

        // Terjemahkan ke bahasa daerah yang dipilih
        generatedText = translateToRegional(generatedText, detectedLanguage);

        res.json({ region: detectedLanguage, generated_text: generatedText });
    } catch (error) {
        console.error("❌ Error saat generate teks:", error);
        res.status(500).json({ error: "Terjadi kesalahan dalam pemrosesan" });
    }
});

module.exports = app;