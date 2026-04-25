import os
from dotenv import load_dotenv
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from groq import Groq

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Inisialisasi model embedding
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
vector_db = Chroma(persist_directory="./chroma_db", embedding_function=embeddings)

def get_context(query):
    docs = vector_db.similarity_search(query, k=3)
    return "\n".join([doc.page_content for doc in docs])

def agentic_rag(query):
    context = get_context(query)
    
    prompt = f"""
    Kamu adalah AI Assistant yang jujur. Gunakan konteks berikut untuk menjawab pertanyaan.
    
    KONTEKS:
    {context}
    
    PERTANYAAN: {query}
    
    ATURAN:
    1. Jika jawaban tidak ada di dalam KONTEKS, katakan "Maaf, data tidak ditemukan di database". 
    2. Jangan mengarang informasi di luar konteks yang diberikan.
    3. Berikan jawaban yang singkat dan padat.
    """

    # Memanggil API Groq
    response = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.1-8b-instant",
    )
    
    # Perbaikan: Cek apakah response berupa tuple
    if isinstance(response, tuple):
        chat_completion = response[0]
    else:
        chat_completion = response

    return chat_completion.choices[0].message.content

if __name__ == "__main__":
    user_query = input("Tanya dokumen kamu: ")
    print("\nRespon AI:\n", agentic_rag(user_query))
