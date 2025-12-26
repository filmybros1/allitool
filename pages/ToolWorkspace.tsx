
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
  const [processedBlobUrl, setProcessedBlobUrl] = useState<string | null>(null);
  const [processedMimeType, setProcessedMimeType] = useState<string>('application/pdf');
  const [processedSize, setProcessedSize] = useState<number | null>(null);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const processImage = async (file: File, type: 'png' | 'jpeg', quality: number = 0.8): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => resolve(blob!), `image/${type}`, quality);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const processFiles = async () => {
    if (files.length === 0) return;
    setProcessing(true);

    try {
      let finalBlob: Blob | null = null;
      let mime = 'application/pdf';

      switch (toolId) {
        case ToolType.MERGE:
          const mergedData = await PDFService.mergePDFs(
            files.map(f => ({ file: f.file, selection: f.pageSelection }))
          );
          finalBlob = new Blob([mergedData.buffer], { type: 'application/pdf' });
          break;
        case ToolType.IMAGE_TO_PDF:
          const pdfData = await PDFService.imagesToPDF(files.map(f => f.file));
          finalBlob = new Blob([pdfData.buffer], { type: 'application/pdf' });
          break;
        case ToolType.ROTATE:
          const rotatedData = await PDFService.rotatePDF(files[0].file, 90);
          finalBlob = new Blob([rotatedData.buffer], { type: 'application/pdf' });
          break;
        case ToolType.IMG_COMPRESS:
          // Aggressive compression for demonstration
          finalBlob = await processImage(files[0].file, files[0].file.type === 'image/png' ? 'png' : 'jpeg', 0.4);
          mime = finalBlob.type;
          break;
        case ToolType.JPG_TO_PNG:
          finalBlob = await processImage(files[0].file, 'png');
          mime = 'image/png';
          break;
        case ToolType.PNG_TO_JPG:
          finalBlob = await processImage(files[0].file, 'jpeg');
          mime = 'image/jpeg';
          break;
        case ToolType.AI_SUMMARY:
          const summary = await GeminiService.analyzeDocument(files[0].file);
          setAiResult(summary);
          setProcessing(false);
          return;
        default:
          alert("Tool logic coming soon!");
      }

      if (finalBlob) {
        const url = URL.createObjectURL(finalBlob);
        setProcessedBlobUrl(url);
        setProcessedMimeType(mime);
        setProcessedSize(finalBlob.size);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during processing.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedBlobUrl) return;
    const extension = processedMimeType === 'application/pdf' ? 'pdf' : (processedMimeType.split('/')[1]);
    const link = document.createElement('a');
    link.href = processedBlobUrl;
    link.download = `allitool_${toolId}_${Date.now()}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Drag and Drop Logic
  const handleDragStart = (index: number) => {
    if (toolId !== ToolType.MERGE && toolId !== ToolType.IMAGE_TO_PDF) return;
    setDraggedItemIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (toolId !== ToolType.MERGE && toolId !== ToolType.IMAGE_TO_PDF) return;
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if ((toolId !== ToolType.MERGE && toolId !== ToolType.IMAGE_TO_PDF) || draggedItemIndex === null) return;
    const items = [...files];
    const item = items[draggedItemIndex];
    items.splice(draggedItemIndex, 1);
    items.splice(index, 0, item);
    setFiles(items);
    setDraggedItemIndex(null);
  };

  if (!tool) return null;

  const isImageTool = [ToolType.IMG_COMPRESS, ToolType.JPG_TO_PNG, ToolType.PNG_TO_JPG, ToolType.IMAGE_TO_PDF].includes(tool.id as ToolType);
  const acceptedTypes = isImageTool && tool.id !== ToolType.IMAGE_TO_PDF ? "image/jpeg,image/png" : (tool.id === ToolType.IMAGE_TO_PDF ? "image/jpeg,image/png,.pdf" : ".pdf");

  return (
    <div className="max-w-6xl mx-auto px-6 py-24">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <button 
            onClick={() => processedBlobUrl ? setProcessedBlobUrl(null) : navigate('/')} 
            className="group mb-8 flex items-center gap-3 text-slate-400 hover:text-slate-900 font-bold transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center group-hover:-translate-x-1 shadow-sm transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
            </div>
            {processedBlobUrl ? 'Return to Edit' : 'Back to Home'}
          </button>
          <div className="flex items-center gap-6">
            <div className={`w-20 h-20 ${tool.color} rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-500/20`}>
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={tool.icon} />
              </svg>
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tighter text-slate-900 leading-tight">
                {processedBlobUrl ? 'Perfectly Processed.' : tool.title}
              </h1>
              <p className="text-slate-500 font-medium text-lg">
                {processedBlobUrl ? 'Your file is ready for professional use.' : tool.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[4rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-slate-50 overflow-hidden flex flex-col md:flex-row min-h-[650px]">
        <div className={`flex-grow p-12 flex flex-col ${files.length > 0 ? 'bg-slate-50/30' : ''}`}>
          
          {processedBlobUrl ? (
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-8 duration-700">
              {toolId === ToolType.IMG_COMPRESS && processedSize && files[0] && (
                <div className="mb-8 p-6 bg-indigo-600 rounded-3xl text-white flex flex-wrap items-center justify-between gap-6 shadow-xl shadow-indigo-500/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest opacity-80">Compression Success</p>
                      <h4 className="text-2xl font-black">-{Math.round((1 - (processedSize / files[0].file.size)) * 100)}% Small</h4>
                    </div>
                  </div>
                  <div className="flex gap-8 border-l border-white/20 pl-8">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Before</p>
                      <p className="font-bold">{formatFileSize(files[0].file.size)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60">After</p>
                      <p className="font-bold text-white">{formatFileSize(processedSize)}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex-grow bg-slate-200 rounded-[3rem] overflow-hidden mb-10 border border-slate-100 relative group min-h-[450px] flex items-center justify-center shadow-inner">
                {processedMimeType === 'application/pdf' ? (
                  <iframe 
                    src={`${processedBlobUrl}#toolbar=0`} 
                    className="w-full h-full border-none"
                    title="PDF Preview"
                  />
                ) : (
                  <img src={processedBlobUrl} className="max-w-full max-h-full object-contain p-8 drop-shadow-2xl" alt="Processed preview" />
                )}
                <div className="absolute inset-0 pointer-events-none border-[12px] border-transparent group-hover:border-indigo-500/10 transition-all rounded-[3rem]"></div>
              </div>
              
              <div className="flex gap-6">
                <button 
                  onClick={() => setProcessedBlobUrl(null)}
                  className="px-10 py-7 rounded-3xl font-black text-xl text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-[0.98]"
                >
                  Start Over
                </button>
                <button 
                  onClick={handleDownload}
                  className={`flex-grow py-7 rounded-[2.5rem] font-black text-2xl text-white shadow-2xl transition-all active:scale-[0.98] ${tool.color} hover:shadow-indigo-500/30 hover:brightness-110 flex items-center justify-center gap-4`}
                >
                  Download {processedMimeType === 'application/pdf' ? 'PDF' : 'Image'}
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                </button>
              </div>
            </div>
          ) : files.length === 0 ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="flex-grow border-[4px] border-dashed border-slate-100 rounded-[4rem] flex flex-col items-center justify-center cursor-pointer hover:border-indigo-200 hover:bg-indigo-50/20 transition-all group bg-white shadow-sm"
            >
              <div className="w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center text-slate-300 mb-10 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-700 shadow-sm group-hover:shadow-2xl group-hover:shadow-indigo-500/40">
                <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-3xl font-[1000] text-slate-900 mb-4 tracking-tight">Select your files</h3>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Tap to browse or drop here</p>
              <input 
                type="file" 
                multiple={[ToolType.MERGE, ToolType.IMAGE_TO_PDF].includes(tool.id as ToolType)}
                accept={acceptedTypes}
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-12">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">{files.length} {files.length === 1 ? 'Item' : 'Items'} Queue</h3>
                  {(tool.id === ToolType.MERGE || tool.id === ToolType.IMAGE_TO_PDF) && <p className="text-xs text-slate-400 font-black uppercase tracking-widest mt-2">Arrange in processing order</p>}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-slate-900 px-6 py-3 rounded-2xl text-white text-sm font-black shadow-xl hover:bg-indigo-600 transition-all active:scale-95"
                >
                  Add Files
                </button>
                <input type="file" multiple accept={acceptedTypes} className="hidden" ref={fileInputRef} onChange={handleFileChange} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                {files.map((f, index) => (
                  <div 
                    key={f.id} 
                    draggable={[ToolType.MERGE, ToolType.IMAGE_TO_PDF].includes(tool.id as ToolType)}
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={() => handleDrop(index)}
                    className={`relative group bg-white rounded-[2rem] p-8 shadow-sm border ${draggedItemIndex === index ? 'opacity-40 border-dashed border-indigo-400' : 'border-slate-100'} flex flex-col gap-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all ${[ToolType.MERGE, ToolType.IMAGE_TO_PDF].includes(tool.id as ToolType) ? 'cursor-grab active:cursor-grabbing' : ''}`}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-16 h-16 ${f.file.type.includes('image') ? 'bg-indigo-50 text-indigo-500' : 'bg-rose-50 text-rose-500'} rounded-[1.5rem] flex items-center justify-center flex-shrink-0 shadow-sm`}>
                        {f.file.type.includes('image') ? (
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        ) : (
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M7 2a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V8l-6-6H7zm7 1.5L18.5 9H14V3.5z"/></svg>
                        )}
                      </div>
                      <div className="overflow-hidden flex-grow">
                        <p className="text-base font-black text-slate-900 truncate mb-1">{f.file.name}</p>
                        <p className="text-[11px] text-slate-400 font-black uppercase tracking-wider">{formatFileSize(f.file.size)}</p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}
                        className="bg-slate-900 text-white rounded-xl p-2 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 shadow-lg -translate-y-2 group-hover:translate-y-0"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    </div>

                    {tool.id === ToolType.MERGE && (
                      <div className="pt-6 border-t border-slate-50">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                          Page Selection
                        </label>
                        <input 
                          type="text"
                          value={f.pageSelection}
                          onChange={(e) => updatePageSelection(f.id, e.target.value)}
                          placeholder="All pages (e.g. 1, 3-5)"
                          className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-indigo-400 transition-all outline-none"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {tool.id === ToolType.AI_SUMMARY && aiResult && (
                <div className="mb-16 p-12 bg-white rounded-[3rem] border border-indigo-100 shadow-[0_30px_60px_-15px_rgba(79,70,229,0.1)]">
                  <div className="flex items-center gap-4 mb-8 text-indigo-600 font-black uppercase tracking-widest text-xs">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    </div>
                    Intelligence Report
                  </div>
                  <div className="text-slate-700 leading-relaxed font-medium mb-12 text-xl">
                    {aiResult}
                  </div>
                </div>
              )}

              <div className="mt-auto pt-12 border-t border-slate-100 flex justify-center">
                <button 
                  disabled={processing}
                  onClick={processFiles}
                  className={`w-full md:max-w-xl py-8 rounded-[3rem] font-black text-2xl text-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1)] transition-all active:scale-[0.98] flex items-center justify-center gap-4 ${
                    processing ? 'bg-slate-300 cursor-not-allowed animate-pulse' : `${tool.color} hover:shadow-indigo-500/30 hover:brightness-110`
                  }`}
                >
                  {processing ? (
                    <>
                      <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      WORKING...
                    </>
                  ) : 'PROCESS & REVEAL'}
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
