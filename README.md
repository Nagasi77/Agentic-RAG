# Dual-Engine-Arena

Dual Engine Arena is a high performance RAG system. It serves as an advanced AI assistant and automated evaluation platform. You can perform precise document based querying while analyzing model performance. The system benchmarks model accuracy and response latency for deep technical insights.

## Key Features

* **Dual Model Analysis**. Compare Llama and Gemini responses side by side.
* **Automated Benchmarking**. Track latency and accuracy scores in real time.
* **Advanced Document Retrieval**. Use high precision vector search for accurate answers.
* **Data Visualization**. Monitor performance metrics through interactive charts.
* **Hallucination Prevention**. Integrated Agentic Guardrails ensure factual reliability.

---

## Tech Stack

### Frontend

* **Framework**. Next.js.
* **Styling**. Tailwind CSS.
* **Animations**. Framer Motion.
* **Icons**. Lucide React.

### Backend

* **Core**. Python and FastAPI.
* **AI Engines**. Groq (Llama 3.1) and Google GenAI (Gemini 2.5).
* **Vector Database**. ChromaDB.
* **Big Data Processing**. Apache Spark.

---

## Installation

### Prerequisites

* Python 3.10 or higher.
* Node.js 18 or higher.
* Groq and Google AI Studio API Keys.

### Backend Setup

1. Clone the repository.
2. Install dependencies. Use `pip install -r requirements.txt`.
3. Configure your `.env` file with your API keys.
4. Start the server. Use `python main.py`.

### Frontend Setup

1. Navigate to the frontend folder.
2. Install packages. Use `npm install`.
3. Run the development server. Use `npm run dev`.

---

## System Architecture

1. **Upload**. You upload a PDF document.
2. **Process**. Apache Spark and ChromaDB index the text.
3. **Query**. You send a question through the interface.
4. **Retrieve**. The system fetches relevant context from the vector database.
5. **Evaluate**. Llama and Gemini generate answers. The system logs latency and data.
6. **Visualize**. You view the results on the dashboard.
