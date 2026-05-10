"use client"
import { useState, useRef, useEffect } from "react"
import Link from 'next/link'
import { Send, FileUp, Database, ArrowLeft, Bot, User, Loader2, Cpu } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown' // Pastikan sudah install: npm install react-markdown
import remarkGfm from 'remark-gfm' // Pastikan sudah install: npm install remark-gfm

interface ChatEntry {
  q: string;
  a: string;
  modelUsed: string;
}

export default function ChatRAG() {
  const [question, setQuestion] = useState("")
  const [selectedModel, setSelectedModel] = useState("llama-3.1-8b-instant")
  const [chatLog, setChatLog] = useState<ChatEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatLog, loading]) 

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    try {
      const res = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      })
      if (res.ok) {
        setFileName(file.name)
      }
    } catch (err) {
      alert("Gagal mengunggah dokumen")
    } finally {
      setUploading(false)
    }
  }

  const handleAsk = async () => {
    if (!question || loading) return
    setLoading(true)
    const currentQ = question
    const currentModel = selectedModel
    setQuestion("")

    try {
      const res = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          question: currentQ,
          model: currentModel 
        })
      })
      const data = await res.json()
      
      setChatLog(prev => [...prev, { 
        q: currentQ, 
        a: data.answer || "Maaf, model tidak memberikan jawaban.", 
        modelUsed: currentModel 
      }])
    } catch (err) {
      alert("Koneksi server terputus")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-[#09090B] text-zinc-200 overflow-hidden font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-80 bg-[#121214] border-r border-zinc-800 flex flex-col p-6">
        <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-white transition mb-10 group text-[10px] font-black uppercase tracking-[0.2em]">
          <ArrowLeft size={14} /> DASHBOARD
        </Link>
        
        <div className="flex-1 space-y-10">
          <div>
            <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-4">AI Engine</h2>
            <div className="grid gap-2">
              <button 
                onClick={() => setSelectedModel("llama-3.1-8b-instant")}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${selectedModel === "llama-3.1-8b-instant" ? 'bg-blue-600/10 border-blue-600 text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.1)]' : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
              >
                <Cpu size={14} /> <span className="text-xs font-bold tracking-tight">Llama 3.1 8B</span>
              </button>
              <button 
                onClick={() => setSelectedModel("Gemini-2.5-flash")}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${selectedModel === "Gemini-2.5-flash" ? 'bg-purple-600/10 border-purple-600 text-purple-400 shadow-[0_0_15px_rgba(79,70,229,0.1)]' : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
              >
                <Cpu size={14} /> <span className="text-xs font-bold tracking-tight">Gemini-2.5-flash</span>
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-4">Knowledge Base</h2>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full bg-zinc-100 hover:bg-white text-black p-4 rounded-xl flex items-center justify-center gap-3 transition shadow-lg mb-4 active:scale-95"
            >
              {uploading ? <Loader2 className="animate-spin text-zinc-900" size={18} /> : <FileUp size={18} />}
              <span className="font-black text-[10px] uppercase tracking-widest">{uploading ? "Learning..." : "Upload PDF"}</span>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept=".pdf" />
            
            {fileName && (
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-left-2">
                <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <Database size={14} className="text-blue-500" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-tighter">Active Index</span>
                  <span className="text-[11px] font-bold truncate text-zinc-200">{fileName}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* CHAT AREA */}
      <main className="flex-1 flex flex-col bg-[#09090B] relative">
        <div className="flex-1 overflow-y-auto px-6 py-10 md:px-12 space-y-10 custom-scrollbar">
          {chatLog.length === 0 && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20">
              <div className="p-6 bg-zinc-900 rounded-[2.5rem] border border-zinc-800">
                <Bot size={48} className="text-zinc-500" />
              </div>
              <p className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500">Neural Network Ready</p>
            </div>
          )}

          <AnimatePresence>
            {chatLog.map((chat, i) => (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className="max-w-4xl mx-auto space-y-6">
                {/* User Bubble */}
                <div className="flex justify-end">
                  <div className="bg-zinc-100 text-black px-6 py-3 rounded-[2rem] rounded-tr-none text-sm font-medium shadow-2xl shadow-black/20">
                    {chat.q}
                  </div>
                </div>

                {/* AI Bubble */}
                <div className="flex gap-4 md:gap-6 items-start group">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover:scale-110 ${
                    chat.modelUsed.includes('llama') ? 'bg-blue-600 shadow-blue-900/20' : 'bg-purple-600 shadow-purple-900/20'
                  }`}>
                    <Bot size={20} className="text-white" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${
                      chat.modelUsed.includes('llama') ? 'text-blue-500' : 'text-purple-500'
                    }`}>
                      {chat.modelUsed.includes('llama') ? 'Llama-3.1 Engine' : 'Gemini-2.5-flash'}
                    </span>
                    <div className="bg-[#121214] border border-zinc-800 px-6 py-4 rounded-[2rem] rounded-tl-none text-sm text-zinc-300 leading-relaxed shadow-sm min-h-[50px]">
                      <article className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{chat.a}</ReactMarkdown>
                      </article>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto flex gap-6 items-center">
                <div className="w-10 h-10 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center">
                  <Loader2 size={18} className="text-zinc-600 animate-spin" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700 animate-pulse">Processing Query...</span>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        {/* INPUT BAR */}
        <div className="p-8 bg-gradient-to-t from-[#09090B] via-[#09090B] to-transparent">
          <div className="max-w-3xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-[2.5rem] blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
            <input 
              className="relative w-full bg-[#121214] border border-zinc-800 p-5 pr-16 rounded-[2rem] outline-none focus:border-zinc-600 transition-all shadow-2xl placeholder:text-zinc-700 text-sm font-medium"
              placeholder="Tanyakan analisis dokumen teknis..." 
              value={question} 
              onChange={(e) => setQuestion(e.target.value)} 
              onKeyDown={(e) => e.key === "Enter" && handleAsk()} 
            />
            <button 
              onClick={handleAsk} 
              disabled={loading || !question}
              className="absolute right-3 top-3 bg-white hover:bg-zinc-200 disabled:bg-zinc-900 disabled:text-zinc-700 text-black p-3 rounded-2xl transition-all shadow-lg active:scale-95"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}