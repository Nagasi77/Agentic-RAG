from fastapi import FastAPI
from pydantic import BaseModel
from rag_engine import agentic_rag
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    question: str

@app.get("/")
async def root():
    return {"status": "Server is running"}

@app.post("/ask")
async def ask(query: QueryRequest):
    answer = agentic_rag(query.question)
    return {"answer": answer}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)