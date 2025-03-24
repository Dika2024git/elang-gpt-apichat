import sys
from transformers import pipeline

# Ambil teks dari argumen
input_text = sys.argv[1] if len(sys.argv) > 1 else "Hello, AI!"

# Load model NLP
nlp_model = pipeline("text-generation", model="gpt2")

# Hasil prediksi
result = nlp_model(input_text, max_length=100)

# Cetak hasil agar bisa diambil oleh PHP atau Node.js
print(result[0]['generated_text'])
