
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TOOLS } from '../constants';
import { ToolType, FileData } from '../types';
import { PDFService } from '../services/pdfService';
import { GeminiService } from '../services/geminiService';

const ToolWorkspace: React.FC = () => {
  const { toolId } = useParams();
  const navigate = useNavigate();
  const [files, setFiles] = useState<FileData[]>([]);
  const [processing, setProcessing] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tool = TOOLS.find(t => t.id === toolId);

  useEffect(() => {
    if (!tool) navigate('/');
    window.scrollTo(0, 0);
  }, [tool, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        status: 'idle' as const,
        pageSelection: ''
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const updatePageSelection = (id: string, selection: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, pageSelection: selection } : f));
  };

  const processFiles = async () => {
    if (files.length === 0) return;
    setProcessing(true);

    try {
      switch (toolId) {
        case ToolType.MERGE:
          const mergedData = await PDFService.mergePDFs(
            files.map(f => ({ file: f.file, selection: f.pageSelection }))
          );
          PDFService.downloadBlob(mergedData, 'merged_allitool.pdf');
          break;
        case ToolType.ROTATE:
          for (const f of files) {
            const rotated = await PDFService.rotatePDF(f.file, 90);
            PDFService.downloadBlob(rotated, `rotated_${f.file.name}`);
          }
          break;
        case ToolType.AI_SUMMARY:
          const summary = await GeminiService.analyzeDocument(files[0].file);
          setAiResult(summary);
          break;
        default:
          alert("Tool logic coming soon!");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during processing.");
    } finally {
      setProcessing(false);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim() || files.length === 0) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    
    setProcessing(true);
    const response = await GeminiService.chatWithDocument(files[0].file, userMsg);
    setChatHistory(prev => [...prev, { role: 'ai', text: response }]);
    setProcessing(false);
  };

  if (!tool) return null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <button 
            onClick={() => navigate('/')} 
            className="group mb-6 flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:-translate-x-1 transition-transform">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
            </div>
            Back to Tools
          </button>
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 ${tool.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={tool.icon} />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900">{tool.title}</h1>
              <p className="text-slate-500 font-medium">{tool.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        <div className={`flex-grow p-10 flex flex-col ${files.length > 0 ? 'bg-slate-50/50' : ''}`}>
          {files.length === 0 ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="flex-grow border-[3px] border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group bg-white"
            >
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-8 group-hover:scale-110 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all duration-500">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3">Drop your PDF here</h3>
              <p className="text-slate-500 font-medium">Or click to browse your computer</p>
              <input 
                type="file" 
                multiple={tool.id === ToolType.MERGE}
                accept=".pdf" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl font-black text-slate-900">{files.length} Files Ready</h3>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white px-4 py-2 rounded-xl text-slate-900 text-sm font-bold shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Add Files
                </button>
                <input type="file" multiple accept=".pdf" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {files.map((f) => (
                  <div key={f.id} className="relative group bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col gap-4 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M7 2a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V8l-6-6H7zm7 1.5L18.5 9H14V3.5z"/></svg>
                      </div>
                      <div className="overflow-hidden flex-grow">
                        <p className="text-sm font-bold text-slate-900 truncate mb-0.5">{f.file.name}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">{(f.file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}
                        className="bg-slate-900 text-white rounded-xl p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    </div>

                    {tool.id === ToolType.MERGE && (
                      <div className="pt-4 border-t border-slate-50">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                          Include Pages (e.g. 1-3, 5)
                        </label>
                        <input 
                          type="text"
                          value={f.pageSelection}
                          onChange={(e) => updatePageSelection(f.id, e.target.value)}
                          placeholder="All pages"
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:bg-white focus:border-indigo-400 transition-all outline-none"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {tool.id === ToolType.AI_SUMMARY && aiResult && (
                <div className="mb-12 p-8 bg-white rounded-[2rem] border border-indigo-100 shadow-xl shadow-indigo-500/5">
                  <div className="flex items-center gap-3 mb-6 text-indigo-600 font-black uppercase tracking-widest text-xs">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                       <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    </div>
                    AI Executive Summary
                  </div>
                  <div className="text-slate-700 leading-relaxed font-medium mb-10 text-lg">
                    {aiResult}
                  </div>
                  
                  <div className="pt-10 border-t border-slate-100">
                    <h4 className="font-black text-slate-900 mb-6 text-xl">Ask about this document</h4>
                    <div className="space-y-4 max-h-80 overflow-y-auto mb-8 p-4 bg-slate-50 rounded-[1.5rem]">
                      {chatHistory.length === 0 && (
                        <p className="text-slate-400 text-center py-8 font-medium">No messages yet. Ask things like "What is the budget?" or "Summarize the risks."</p>
                      )}
                      {chatHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] rounded-[1.25rem] px-6 py-3 text-sm font-medium ${
                            msg.role === 'user' 
                            ? 'bg-slate-900 text-white' 
                            : 'bg-white text-slate-800 border border-slate-200'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                        placeholder="Type your question..."
                        className="flex-grow px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-500 transition-all outline-none font-medium"
                      />
                      <button 
                        onClick={handleChat}
                        disabled={processing}
                        className="bg-indigo-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/20"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-auto pt-10 border-t border-slate-100">
                <button 
                  disabled={processing}
                  onClick={processFiles}
                  className={`w-full py-6 rounded-[2rem] font-black text-xl text-white shadow-2xl transition-all active:scale-[0.98] ${
                    processing ? 'bg-slate-300 cursor-not-allowed' : `${tool.color} hover:shadow-indigo-500/25`
                  }`}
                >
                  {processing ? 'ENGINEERING YOUR PDF...' : (tool.id === ToolType.AI_SUMMARY ? 'START AI ANALYSIS' : 'PROCESS & DOWNLOAD')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToolWorkspace;
