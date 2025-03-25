from transformers import pipeline

# Load model bahasa Indonesia
model = pipeline("text-generation", model="cahya/gpt2-small-indonesian")

# Kamus kata gaul kekinian
gaul_dict = {
    "saya": "gue",
    "aku": "gue",
    "anda": "lu",
    "kamu": "elo",
    "makan": "nyemil",
    "teman": "bestie",
    "bercanda": "ngegass",
    "marah": "bete",
    "santai": "chill",
    "pulang": "cabut",
    "tidak tahu": "gak ngeh",
    "oke": "santuy",
    "ya sudah": "yasudah gaskeun",
    "bertemu": "ketemuan", 
    "mantap": "gaspol",
    "sedih": "galau",
    "sibuk": "riweuh",
    "jalan-jalan": "healing",
    "bosan": "gabut",
    "kenapa": "knp",
    "ngobrol": "cengkrama",
    "teman dekat": "circle",
    "malas": "mager",
    "menunggu": "nungguin",
    "segera": "cepetan",
    "terserah": "gimana dah",
    "berlebihan": "lebay",
    "paham": "ngerti",
    "gila": "goks",
    "senang": "happy",
    "susah": "pusing"
}

def translate_to_gaul(text):
    for formal, gaul in gaul_dict.items():
        text = text.replace(formal, gaul)
    return text

def generate_response(prompt):
    result = model(prompt, max_length=100, do_sample=True, top_k=50, top_p=0.95)
    response = result[0]["generated_text"]
    
    # Konversi ke bahasa gaul
    return translate_to_gaul(response)

if __name__ == "__main__":
    import sys
    prompt = sys.argv[1]
    print(generate_response(prompt))