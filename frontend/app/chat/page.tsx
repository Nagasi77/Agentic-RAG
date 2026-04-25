"use client"
import { useState } from "react"
import Link from 'next/link'

export default function ChatRAG() {
  const [question, setQuestion] = useState("")
  const [chatLog, setChatLog] = useState<{q: string, a: string}[]>([])
  const [loading, setLoading] = useState(false)

  const handleAsk = async () => {
    if (!question) return
    setLoading(true)
    try {
      const res = await fetch("http://127.0.0.1:8000/ask", {
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
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <Link href="/" className="mb-4 text-sm text-blue-600 font-bold">Kembali ke Dashboard</Link>
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg h-[80vh] flex flex-col overflow-hidden">
        <header className="bg-blue-600 p-4 text-white font-bold text-center">Agentic RAG Assistant</header>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatLog.map((chat, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="self-end bg-blue-500 text-white p-2 rounded-lg text-sm">{chat.q}</div>
              <div className="self-start bg-gray-100 p-2 rounded-lg text-sm">{chat.a}</div>
            </div>
          ))}
          {loading && <div className="text-xs text-gray-400 animate-pulse">Berpikir...</div>}
        </div>
        <div className="p-4 border-t flex gap-2">
          <input className="flex-1 border rounded p-2 text-sm" placeholder="Tanya dokumen..." value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAsk()} />
          <button onClick={handleAsk} className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold">Kirim</button>
        </div>
      </div>
    </div>
  )
}