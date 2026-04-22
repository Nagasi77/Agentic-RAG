from pyspark.sql import SparkSession
from langchain_chroma import Chroma
from langchain_core import Document
from langchain_text_splitters import CharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
import os

spark = SparkSession.builder.appName("RAGProcessor").getOrCreate()

path = "data_input/*.txt"
df = spark.read.text(path)
raw_texts = [row.value for row in df.collect()]

# Sistem pembgian teks menjadi bagian-bagian kecil
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
docs = [Document(page_content=x) for x in raw_texts]
split_docs = text_splitter.split_documents(docs)

# Inisialisasi model embedding
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
\

# ChromaDB untuk menyimpan embedding
vector_db = Chroma.from_documents(
    documents=split_docs,
    embedding=embeddings,
    persist_directory="./chroma_db"
)

print("Ingesting data completed. Embeddings stored in ChromaDB.")
