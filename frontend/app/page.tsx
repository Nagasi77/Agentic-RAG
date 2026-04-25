"use client"
import { useEffect, useState } from "react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import Link from 'next/link'

export default function Home() {
  const [results, setResults] = useState<any[]>([])
  const [activeId, setActiveId] = useState(0)

  useEffect(() => {
  fetch("/results.json")
    .then((res) => {
      if (!res.ok) throw new Error("File results.json tidak ditemukan!");
      return res.json();
    })
    .then((data) => {
      setResults(data);
      if (data.length > 0) setActiveId(0);
    })
    .catch((err) => {
      console.error("Detail Error:", err);
    });
}, []);

  if (results.length === 0) return <div className="p-10 text-center">Memuat data benchmark</div>

  const activeData = results[activeId]
  const chartData = results.map((item: any) => ({
    name: `Test ${item.id}`,
    Gemini: parseFloat(item.gemini?.latency) || 0,
    Llama: parseFloat(item.llama?.latency) || 0
  }))

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <header className="bg-white border-b p-4 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold">LLM Benchmark</h1>
        <div className="flex gap-4">
          <Link href="/chat" className="text-blue-600 font-bold">Buka Chat RAG</Link>
          <div className="flex gap-2">
            {results.map((item: any, index: number) => (
              <button key={item.id} onClick={() => setActiveId(index)} className={`px-3 py-1 rounded text-sm ${activeId === index ? 'bg-black text-white' : 'bg-gray-200'}`}>
                TC {item.id}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="h-40 bg-white p-2 border-b">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Gemini" fill="#3b82f6" />
            <Bar dataKey="Llama" fill="#a855f7" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 border-r flex flex-col bg-white">
          <div className="p-3 bg-blue-50 border-b flex justify-between">
            <span className="font-bold">Gemini Flash</span>
            <span className="text-xs">Skor: {activeData.gemini?.score}</span>
          </div>
          <div className="p-4 overflow-y-auto prose prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{String(activeData.gemini?.answer)}</ReactMarkdown>
          </div>
        </div>
        <div className="w-1/2 flex flex-col bg-white">
          <div className="p-3 bg-purple-50 border-b flex justify-between">
            <span className="font-bold">Llama 3.1</span>
            <span className="text-xs">Skor: {activeData.llama?.score}</span>
          </div>
          <div className="p-4 overflow-y-auto prose prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{String(activeData.llama?.answer)}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
}