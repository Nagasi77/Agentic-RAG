"use client"
import { useEffect, useState } from "react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Link from 'next/link'
import { Activity, MessageSquare, Zap, Info, AlertCircle } from 'lucide-react'

export default function Home() {
  const [results, setResults] = useState<any[]>([])
  const [activeId, setActiveId] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/results.json")
      .then((res) => res.json())
      .then((data) => {
        setResults(data)
        if (data.length > 0) setActiveId(data.length - 1) // Otomatis ke data terbaru
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="h-screen bg-[#0F172A] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Activity className="animate-spin text-blue-500" size={40} />
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Initializing Core</span>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 font-sans p-4 md:p-8">
      <nav className="max-w-7xl mx-auto flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40">
            <Zap size={24} className="text-white fill-current" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase">Dual Engine Arena</h1>
            <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Model Evaluator v2.0</p>
          </div>
        </div>
        <Link href="/chat" className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-2xl text-sm font-bold transition border border-slate-700 shadow-xl">
          <MessageSquare size={18} />
          Buka Chat Assistant
        </Link>
      </nav>

      <main className="max-w-7xl mx-auto">
        {results.length === 0 ? (
          <div className="bg-[#1E293B] border border-slate-800 rounded-[2.5rem] p-20 text-center flex flex-col items-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent" />
            <Activity size={60} className="text-slate-700 mb-6" />
            <h2 className="text-2xl font-black text-white mb-2">SISTEM ANALITIK KOSONG</h2>
            <p className="text-slate-400 max-w-md mb-8 text-sm">Silakan lakukan pengujian pertama Anda di ruang chat.</p>
            <Link href="/chat" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition">
              Eksekusi Pengujian
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-8">

            {/* PANEL KIRI: GRAFIK & NAVIGASI */}
            <section className="col-span-12 lg:col-span-5 flex flex-col gap-6">
              <div className="bg-[#1E293B] border border-slate-800 p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
                <header className="mb-8">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Performance Metrics</h3>
                  <p className="text-3xl font-black text-white italic tracking-tighter">Latency <span className="text-blue-500">ms</span></p>
                </header>

                <div className="h-64 mb-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={results.map(r => ({
                      name: `${r.id}`,
                      Gemini: parseFloat(r.gemini?.latency) || 0,
                      Llama: parseFloat(r.llama?.latency) || 0
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 9, fontWeight: 800 }}
                        interval={results.length > 15 ? 4 : 0} // Mencegah label tumpuk
                      />
                      <YAxis hide />
                      <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: '1px solid #334155', fontSize: '12px' }}
                      />
                      <Bar dataKey="Gemini" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={results.length > 20 ? 8 : 15} />
                      <Bar dataKey="Llama" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={results.length > 20 ? 8 : 15} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Navigasi ID yang bisa di-scroll jika banyak */}
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  {results.map((r, i) => (
                    <button
                      key={r.id}
                      onClick={() => setActiveId(i)}
                      className={`min-w-[40px] h-10 rounded-lg font-black text-[10px] transition-all shrink-0 ${activeId === i ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
                    >
                      ID {r.id}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-blue-600/5 border border-blue-500/10 p-5 rounded-2xl flex gap-4 items-center">
                <Info className="text-blue-500 shrink-0" size={20} />
                <p className="text-[10px] leading-relaxed text-blue-300 uppercase tracking-tight font-medium">
                  Infrastruktur sinkron: Groq Cloud & Google Gemini API. Metrik real-time.
                </p>
              </div>
            </section>

            {/* PANEL KANAN: PERBANDINGAN JAWABAN */}
            <section className="col-span-12 lg:col-span-7 flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[75vh]">

                {/* Kolom Gemini */}
                <div className="bg-[#1E293B] border border-slate-800 rounded-[2rem] flex flex-col overflow-hidden shadow-2xl">
                  <header className="p-5 border-b border-slate-800 flex justify-between items-center bg-blue-900/10">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Gemini Flash</span>
                    <span className="bg-blue-600 px-3 py-1 rounded-lg text-[10px] font-black">{results[activeId].gemini?.score || 0}</span>
                  </header>
                  <div className="p-6 overflow-y-auto custom-scrollbar flex-1 text-slate-300 text-sm">
                    {results[activeId].gemini?.answer.startsWith("Error pada engine") ? (
                      <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <AlertCircle size={14} />
                          <span className="text-[10px] font-black uppercase">System Failure</span>
                        </div>
                        <p className="text-[11px] font-mono leading-tight opacity-80 break-words">
                          {results[activeId].gemini.answer}
                        </p>
                      </div>
                    ) : (
                      <article className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{results[activeId].gemini?.answer}</ReactMarkdown>
                      </article>
                    )}
                  </div>
                </div>

                {/* Kolom Llama */}
                <div className="bg-[#1E293B] border border-slate-800 rounded-[2rem] flex flex-col overflow-hidden shadow-2xl">
                  <header className="p-5 border-b border-slate-800 flex justify-between items-center bg-indigo-900/10">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Llama 3.1 8B</span>
                    <span className="bg-indigo-600 px-3 py-1 rounded-lg text-[10px] font-black">{results[activeId].llama?.score || 0}</span>
                  </header>
                  <div className="p-6 overflow-y-auto custom-scrollbar flex-1 text-slate-300 text-sm">
                    <article className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{results[activeId].llama?.answer}</ReactMarkdown>
                    </article>
                  </div>
                </div>

              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}