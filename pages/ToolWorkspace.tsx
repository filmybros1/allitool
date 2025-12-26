
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
          finalBlob = await processImage(files[0].file, files[0].file.type === 'image/png' ? 'png' : 'jpeg', 0.5);
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
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <button 
            onClick={() => processedBlobUrl ? setProcessedBlobUrl(null) : navigate('/')} 
            className="group mb-6 flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:-translate-x-1 transition-transform">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
            </div>
            {processedBlobUrl ? 'Return to Edit' : 'Back to Home'}
          </button>
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 ${tool.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={tool.icon} />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900">
                {processedBlobUrl ? 'Preview Result' : tool.title}
              </h1>
              <p className="text-slate-500 font-medium">
                {processedBlobUrl ? 'Review your output before downloading.' : tool.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        <div className={`flex-grow p-10 flex flex-col ${files.length > 0 ? 'bg-slate-50/50' : ''}`}>
          
          {processedBlobUrl ? (
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex-grow bg-slate-200 rounded-3xl overflow-hidden mb-8 border border-slate-200 relative group min-h-[400px] flex items-center justify-center">
                {processedMimeType === 'application/pdf' ? (
                  <iframe 
                    src={`${processedBlobUrl}#toolbar=0`} 
                    className="w-full h-full border-none"
                    title="PDF Preview"
                  />
                ) : (
                  <img src={processedBlobUrl} className="max-w-full max-h-full object-contain p-4" alt="Processed preview" />
                )}
                <div className="absolute inset-0 pointer-events-none border-4 border-transparent group-hover:border-indigo-500/20 transition-all rounded-3xl"></div>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setProcessedBlobUrl(null)}
                  className="flex-grow py-6 rounded-3xl font-black text-xl text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all active:scale-[0.98]"
                >
                  Edit Files
                </button>
                <button 
                  onClick={handleDownload}
                  className={`flex-grow py-6 rounded-3xl font-black text-xl text-white shadow-2xl transition-all active:scale-[0.98] ${tool.color} hover:shadow-indigo-500/25`}
                >
                  Download Result
                </button>
              </div>
            </div>
          ) : files.length === 0 ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="flex-grow border-[3px] border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group bg-white"
            >
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-8 group-hover:scale-110 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all duration-500">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3">Drop your files here</h3>
              <p className="text-slate-500 font-medium">Click to browse {isImageTool ? 'images' : 'PDFs'}</p>
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
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-xl font-black text-slate-900">{files.length} {files.length === 1 ? 'File' : 'Files'} Ready</h3>
                  {(tool.id === ToolType.MERGE || tool.id === ToolType.IMAGE_TO_PDF) && <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Drag and drop to rearrange order</p>}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white px-4 py-2 rounded-xl text-slate-900 text-sm font-bold shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Add More
                </button>
                <input type="file" multiple accept={acceptedTypes} className="hidden" ref={fileInputRef} onChange={handleFileChange} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {files.map((f, index) => (
                  <div 
                    key={f.id} 
                    draggable={[ToolType.MERGE, ToolType.IMAGE_TO_PDF].includes(tool.id as ToolType)}
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={() => handleDrop(index)}
                    className={`relative group bg-white rounded-3xl p-6 shadow-sm border ${draggedItemIndex === index ? 'opacity-50 border-dashed border-indigo-400' : 'border-slate-200'} flex flex-col gap-4 hover:shadow-md transition-all ${[ToolType.MERGE, ToolType.IMAGE_TO_PDF].includes(tool.id as ToolType) ? 'cursor-grab active:cursor-grabbing' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      {[ToolType.MERGE, ToolType.IMAGE_TO_PDF].includes(tool.id as ToolType) && (
                        <div className="text-slate-300 group-hover:text-slate-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16"/></svg>
                        </div>
                      )}
                      <div className={`w-12 h-12 ${f.file.type.includes('image') ? 'bg-indigo-50 text-indigo-500' : 'bg-rose-50 text-rose-500'} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                        {f.file.type.includes('image') ? (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        ) : (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M7 2a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V8l-6-6H7zm7 1.5L18.5 9H14V3.5z"/></svg>
                        )}
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
                </div>
              )}

              <div className="mt-auto pt-10 border-t border-slate-100">
                <button 
                  disabled={processing}
                  onClick={processFiles}
                  className={`w-full py-6 rounded-[2rem] font-black text-xl text-white shadow-2xl transition-all active:scale-[0.98] ${
                    processing ? 'bg-slate-300 cursor-not-allowed animate-pulse' : `${tool.color} hover:shadow-indigo-500/25`
                  }`}
                >
                  {processing ? 'PROCESSING...' : 'PROCESS & PREVIEW'}
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
