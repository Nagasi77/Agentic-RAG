import shutil
import os
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag_engine import agentic_rag, proses_pdf
import time
import json

app = FastAPI()

# Pengaturan CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

if not os.path.exists("uploads"):
    os.makedirs("uploads")

class QueryRequest(BaseModel):
    question: str
    model: str = "llama-3.1-8b-instant"

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    # Gunakan folder uploads agar konsisten
    file_location = f"uploads/{file.filename}"
    
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    proses_pdf(file_location, file.filename)
    
    return {"filename": file.filename, "status": "berhasil diproses"}

@app.get("/")
async def root():
    return {"status": "Server is running"}

def simpan_hasil_benchmark(gemini_data, llama_data):
    file_path = "../frontend/public/results.json"
    
    # Baca data lama
    try:
        with open(file_path, "r") as f:
            data = json.load(f)
    except:
        data = []

    # Buat entri baru
    new_id = len(data) + 1
    new_entry = {
        "id": new_id,
        "gemini": gemini_data,
        "llama": llama_data
    }
    
    data.append(new_entry)
    
    # Simpan kembali
    with open(file_path, "w") as f:
        json.dump(data, f, indent=2)

@app.post("/ask")
async def ask(query: QueryRequest):
    start_time = time.time()
    
    answer = agentic_rag(query.question, query.model)
    
    latency = round((time.time() - start_time) * 1000, 2)

    res_data = {"latency": latency, "score": 85, "answer": answer}
    
    if "gemini" in query.model.lower():
        simpan_hasil_benchmark(res_data, {"latency": 0, "score": 0, "answer": ""})
    else:
        simpan_hasil_benchmark({"latency": 0, "score": 0, "answer": ""}, res_data)
    
    return {"answer": answer}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)