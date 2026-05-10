import os
from google import genai as google_genai # Pakai SDK terbaru
from dotenv import load_dotenv
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from groq import Groq
from pypdf import PdfReader

load_dotenv()

# 1. Inisialisasi Groq
client_groq = Groq(api_key=os.getenv("GROQ_API_KEY"))

# 2. Inisialisasi Gemini (New SDK)
# Kita paksa pakai api_version='v1' supaya tidak kena 404 v1beta
client_gemini = google_genai.Client(
    api_key=os.getenv("GOOGLE_API_KEY"),
    http_options={'api_version': 'v1'}
)

# Inisialisasi Database
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
vector_db = Chroma(persist_directory="./chroma_db", embedding_function=embeddings)

def get_context(query):
    docs = vector_db.similarity_search(query, k=3)
    if not docs:
        return "Tidak ada konteks ditemukan."
    return "\n".join([doc.page_content for doc in docs])

def proses_pdf(lokasi_file, nama_file):
    pembaca = PdfReader(lokasi_file)
    teks = ""
    for halaman in pembaca.pages:
        teks += halaman.extract_text() or ""
    
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    chunks = text_splitter.split_text(teks)

    vector_db.add_texts(
        texts=chunks,
        metadatas=[{"sumber": nama_file}] * len(chunks)
    )
    return "Berhasil"

def agentic_rag(query, model_name="llama-3.1-8b-instant"):
    context = get_context(query)
    prompt = f"Gunakan konteks ini untuk menjawab.\n\nKONTEKS: {context}\n\nPERTANYAAN: {query}"

    try:
        if "gemini" in model_name.lower():
            response = client_gemini.models.generate_content(
                model='gemini-2.5-flash', 
                contents=prompt
            )
            return response.text
        
        else:
            response = client_groq.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=model_name,
            )
            return response.choices[0].message.content

    except Exception as e:
        print(f"DEBUG ERROR: {str(e)}")
        return f"Error pada engine {model_name}: {str(e)}"