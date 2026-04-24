"use client"
import { useState } from "react"

export default function ChatRAG() {
  const [question, setQuestion] = useState("")
  const [chatLog, setChatLog] = useState<{q: string, a: string}[]>([])
  const [loading, setLoading] = useState(false)

  const handleAsk = async () => {
    if (!question) return
    setLoading(true)
    
    try {
      const res = await fetch("http://localhost:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      })
      const data = await res.json()
      setChatLog([...chatLog, { q: question, a: data.answer }])
      setQuestion("")
    } catch (err) {
      alert("Gagal koneksi ke server Python")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <div className="w-full max-w-2xl flex flex-col h-[80vh] bg-white rounded-2xl shadow-xl overflow-hidden">
        
        <header className="bg-blue-600 p-4 text-white font-bold text-center">
          Agentic RAG Assistant
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {chatLog.map((chat, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-end">
                <div className="bg-blue-500 text-white p-3 rounded-lg max-w-[80%] text-sm">
                  {chat.q}
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-3 rounded-lg max-w-[80%] text-sm shadow-sm">
                  {chat.a}
                </div>
              </div>
            </div>
          ))}
          {loading && <div className="text-xs text-gray-400 animate-pulse">AI sedang berpikir...</div>}
        </div>

        <div className="p-4 border-t flex gap-2">
          <input 
            className="flex-1 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Tanyakan sesuatu tentang dokumen Anda..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
          />
          <button 
            disabled={loading}
            onClick={handleAsk}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400"
          >
            Kirim
          </button>
        </div>

      </div>
    </div>
  )
}