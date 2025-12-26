
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
  const [processedBlobUrl, setProcessedBlobUrl] = useState<string | null>(null);
  const [processedMimeType, setProcessedMimeType] = useState<string>('application/pdf');
  const [processedSize, setProcessedSize] = useState<number | null>(null);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [multiProcessedFiles, setMultiProcessedFiles] = useState<{url: string, name: string}[]>([]);
  const [targetKB, setTargetKB] = useState<string>('');
  const [isIterating, setIsIterating] = useState(false);
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

  // Iterative binary search to find best quality for target size
  const compressToTargetSize = async (file: File, targetSizeKB: number) => {
    setIsIterating(true);
    const targetBytes = targetSizeKB * 1024;
    let minQuality = 0.01;
    let maxQuality = 1.0;
    let bestBlob: Blob | null = null;
    let iterations = 0;
    const maxIterations = 8;
    const type = file.type === 'image/png' ? 'png' : 'jpeg';

    while (iterations < maxIterations) {
      const midQuality = (minQuality + maxQuality) / 2;
      const blob = await processImage(file, type, midQuality);
      
      if (blob.size <= targetBytes) {
        bestBlob = blob;
        minQuality = midQuality; // Try to increase quality but stay under target
      } else {
        maxQuality = midQuality; // Need to decrease quality
      }
      iterations++;
    }

    // Fallback if target is extremely small
    if (!bestBlob) {
      bestBlob = await processImage(file, type, 0.01);
    }

    const url = URL.createObjectURL(bestBlob);
    setProcessedBlobUrl(url);
    setProcessedSize(bestBlob.size);
    setIsIterating(false);
  };

  const processFiles = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setMultiProcessedFiles([]);

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
        case ToolType.SPLIT:
          const splitData = await PDFService.splitPDF(files[0].file, files[0].pageSelection || '');
          finalBlob = new Blob([splitData.buffer], { type: 'application/pdf' });
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
          // Initial "fidelity-first" compression
          finalBlob = await processImage(files[0].file, files[0].file.type === 'image/png' ? 'png' : 'jpeg', 0.7);
          mime = finalBlob.type;
          break;
        case ToolType.COMPRESS:
          const compressedData = await PDFService.compressPDF(files[0].file);
          finalBlob = new Blob([compressedData.buffer], { type: 'application/pdf' });
          break;
        case ToolType.PDF_TO_IMG:
          const imageBlobs = await PDFService.pdfToImages(files[0].file);
          if (imageBlobs.length > 0) {
            finalBlob = imageBlobs[0];
            mime = 'image/jpeg';
            setMultiProcessedFiles(imageBlobs.map((b, i) => ({
              url: URL.createObjectURL(b),
              name: `page_${i + 1}.jpg`
            })));
          }
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
          alert("Tool optimization in progress!");
          setProcessing(false);
          return;
      }

      if (finalBlob) {
        const url = URL.createObjectURL(finalBlob);
        setProcessedBlobUrl(url);
        setProcessedMimeType(mime);
        setProcessedSize(finalBlob.size);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during high-performance processing.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (multiProcessedFiles.length > 1) {
      multiProcessedFiles.forEach(file => {
        const link = document.createElement('a');
        link.href = file.url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
      return;
    }

    if (!processedBlobUrl) return;
    const extension = processedMimeType === 'application/pdf' ? 'pdf' : (processedMimeType.split('/')[1]);
    const link = document.createElement('a');
    link.href = processedBlobUrl;
    link.download = `allitool_${toolId}_${Date.now()}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        <div className="animate-fade-up">
          <button 
            onClick={() => processedBlobUrl || aiResult ? (setProcessedBlobUrl(null), setAiResult(null)) : navigate('/')} 
            className="group mb-8 flex items-center gap-3 text-slate-400 hover:text-slate-900 font-bold transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center group-hover:-translate-x-1 shadow-sm transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
            </div>
            {processedBlobUrl || aiResult ? 'Return to Workspace' : 'Back to Dashboard'}
          </button>
          <div className="flex items-center gap-6">
            <div className={`w-20 h-20 ${tool.color} rounded-[2.2rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-500/20 transform hover:scale-105 transition-transform`}>
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={tool.icon} />
              </svg>
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tighter text-slate-900 leading-tight">
                {processedBlobUrl || aiResult ? 'Preview & Refine.' : tool.title}
              </h1>
              <p className="text-slate-500 font-medium text-lg">
                {processedBlobUrl || aiResult ? 'Review the results and download your optimized file.' : tool.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[4rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)] border border-slate-50 overflow-hidden flex flex-col md:flex-row min-h-[650px] animate-fade-up">
        <div className={`flex-grow p-12 flex flex-col ${files.length > 0 ? 'bg-slate-50/20' : ''}`}>
          
          {processedBlobUrl || aiResult ? (
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8">
                  <div className="flex-grow bg-slate-100 rounded-[3.5rem] overflow-hidden mb-10 border border-slate-100 relative group min-h-[450px] flex items-center justify-center shadow-inner">
                    {processedMimeType === 'application/pdf' ? (
                      <iframe 
                        src={`${processedBlobUrl}#toolbar=0`} 
                        className="w-full h-full border-none"
                        title="PDF Preview"
                      />
                    ) : (
                      <div className="relative p-12">
                        {isIterating && (
                           <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-md rounded-[3.5rem]">
                              <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-indigo-600 font-black text-xs uppercase tracking-widest">Finding Best Quality...</p>
                              </div>
                           </div>
                        )}
                        <img src={processedBlobUrl!} className="max-w-full max-h-[500px] object-contain drop-shadow-2xl rounded-2xl transition-all duration-500" alt="Processed preview" />
                        {multiProcessedFiles.length > 1 && (
                          <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md text-white text-xs font-black px-4 py-2 rounded-full border border-white/20">
                            + {multiProcessedFiles.length - 1} More Pages
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-8">
                  {((toolId === ToolType.IMG_COMPRESS || toolId === ToolType.COMPRESS) && processedSize && files[0]) && (
                    <div className="p-8 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] text-white flex flex-col gap-8 shadow-2xl shadow-indigo-500/30">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10">
                          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Efficiency</p>
                          <h4 className="text-3xl font-[1000]">{Math.max(0, Math.round((1 - (processedSize / files[0].file.size)) * 100))}% Saved</h4>
                        </div>
                      </div>
                      <div className="flex justify-between border-t border-white/20 pt-6">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Before</p>
                          <p className="text-lg font-bold opacity-70 line-through">{formatFileSize(files[0].file.size)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Now</p>
                          <p className="text-2xl font-black text-white">{formatFileSize(processedSize)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {toolId === ToolType.IMG_COMPRESS && !aiResult && (
                    <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col gap-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
                        </div>
                        <h4 className="text-lg font-black text-slate-900">Custom Target</h4>
                      </div>
                      <p className="text-xs text-slate-500 font-bold leading-relaxed">
                        Need a specific file size? Enter your target in KB and we'll optimize it.
                      </p>
                      <div className="flex gap-2">
                        <div className="relative flex-grow">
                          <input 
                            type="number" 
                            value={targetKB}
                            onChange={(e) => setTargetKB(e.target.value)}
                            placeholder="e.g. 200"
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-base font-bold text-slate-900 focus:bg-white focus:border-indigo-400 focus:shadow-lg focus:shadow-indigo-500/5 transition-all outline-none"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">KB</span>
                        </div>
                        <button 
                          disabled={!targetKB || isIterating}
                          onClick={() => compressToTargetSize(files[0].file, parseInt(targetKB))}
                          className="bg-slate-900 text-white p-4 rounded-2xl hover:bg-indigo-600 disabled:opacity-30 disabled:hover:bg-slate-900 transition-all active:scale-95 shadow-lg"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                        </button>
                      </div>
                    </div>
                  )}

                  {aiResult && (
                    <div className="p-8 bg-purple-50 rounded-[2.5rem] border border-purple-100 flex flex-col gap-4">
                       <h4 className="text-purple-900 font-black">AI Analysis</h4>
                       <p className="text-sm text-purple-700 font-medium">This document was processed using Gemini 3 Intelligence.</p>
                    </div>
                  )}
                </div>
              </div>

              {aiResult && (
                 <div className="flex-grow bg-white rounded-[3.5rem] p-12 border border-slate-100 shadow-inner overflow-y-auto mb-10 prose prose-slate max-w-none">
                    <div className="flex items-center gap-4 mb-8">
                       <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-white">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                       </div>
                       <h3 className="text-2xl font-black text-slate-900">Intelligence Summary</h3>
                    </div>
                    <div className="text-lg font-medium text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {aiResult}
                    </div>
                 </div>
              )}
              
              <div className="flex gap-6 mt-6">
                <button 
                  onClick={() => {setProcessedBlobUrl(null); setAiResult(null); setTargetKB('');}}
                  className="px-12 py-7 rounded-[2.2rem] font-black text-xl text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-[0.98] shadow-sm"
                >
                  Discard & Reset
                </button>
                <button 
                  onClick={handleDownload}
                  className={`flex-grow py-7 rounded-[2.5rem] font-black text-2xl text-white shadow-2xl transition-all active:scale-[0.98] ${tool.color} hover:shadow-indigo-500/30 hover:brightness-110 flex items-center justify-center gap-4`}
                >
                  {aiResult ? 'Export Text' : `Download ${multiProcessedFiles.length > 1 ? 'Files' : (processedMimeType === 'application/pdf' ? 'PDF' : 'Image')}`}
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                </button>
              </div>
            </div>
          ) : files.length === 0 ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="flex-grow border-[4px] border-dashed border-slate-100 rounded-[4rem] flex flex-col items-center justify-center cursor-pointer hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group bg-white shadow-sm"
            >
              <div className="w-36 h-36 bg-slate-50 rounded-[3.5rem] flex items-center justify-center text-slate-300 mb-10 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-700 shadow-sm group-hover:shadow-2xl group-hover:shadow-indigo-500/40">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-4xl font-[1000] text-slate-900 mb-4 tracking-tight">Import your documents</h3>
              <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-sm">Drag and drop or click to browse</p>
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
            <div className="flex flex-col h-full animate-fade-up">
              <div className="flex justify-between items-center mb-12">
                <div>
                  <h3 className="text-3xl font-[1000] text-slate-900">{files.length} {files.length === 1 ? 'File' : 'Files'} Selected</h3>
                  {(tool.id === ToolType.MERGE || tool.id === ToolType.IMAGE_TO_PDF) && <p className="text-sm text-indigo-500 font-black uppercase tracking-widest mt-2">Sort items for processing</p>}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-slate-900 px-8 py-4 rounded-[1.5rem] text-white text-sm font-black shadow-xl hover:bg-indigo-600 transition-all active:scale-95"
                >
                  Add More
                </button>
                <input type="file" multiple accept={acceptedTypes} className="hidden" ref={fileInputRef} onChange={handleFileChange} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {files.map((f, index) => (
                  <div 
                    key={f.id} 
                    draggable={[ToolType.MERGE, ToolType.IMAGE_TO_PDF].includes(tool.id as ToolType)}
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={() => handleDrop(index)}
                    className={`relative group bg-white rounded-[2.5rem] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.02)] border ${draggedItemIndex === index ? 'opacity-40 border-dashed border-indigo-400' : 'border-slate-100'} flex flex-col gap-6 hover:shadow-2xl hover:shadow-slate-200/50 transition-all ${[ToolType.MERGE, ToolType.IMAGE_TO_PDF].includes(tool.id as ToolType) ? 'cursor-grab active:cursor-grabbing' : ''}`}
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-16 h-16 ${f.file.type.includes('image') ? 'bg-indigo-50 text-indigo-500' : 'bg-rose-50 text-rose-500'} rounded-[1.8rem] flex items-center justify-center flex-shrink-0 shadow-sm border border-white`}>
                        {f.file.type.includes('image') ? (
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        ) : (
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M7 2a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V8l-6-6H7zm7 1.5L18.5 9H14V3.5z"/></svg>
                        )}
                      </div>
                      <div className="overflow-hidden flex-grow">
                        <p className="text-lg font-black text-slate-900 truncate mb-1">{f.file.name}</p>
                        <p className="text-[11px] text-slate-400 font-[900] uppercase tracking-[0.15em]">{formatFileSize(f.file.size)}</p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}
                        className="bg-slate-900 text-white rounded-2xl p-2.5 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 shadow-xl -translate-y-2 group-hover:translate-y-0"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    </div>

                    {[ToolType.MERGE, ToolType.SPLIT].includes(tool.id as ToolType) && (
                      <div className="pt-6 border-t border-slate-50">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">
                          Page Selection
                        </label>
                        <input 
                          type="text"
                          value={f.pageSelection}
                          onChange={(e) => updatePageSelection(f.id, e.target.value)}
                          placeholder="All (e.g. 1, 3-5)"
                          className="w-full bg-slate-50/80 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-indigo-400 focus:shadow-lg focus:shadow-indigo-500/5 transition-all outline-none"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-12 border-t border-slate-100 flex justify-center">
                <button 
                  disabled={processing}
                  onClick={processFiles}
                  className={`w-full md:max-w-xl py-9 rounded-[3rem] font-black text-2xl text-white shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-5 ${
                    processing ? 'bg-slate-300 cursor-not-allowed animate-pulse' : `${tool.color} hover:shadow-indigo-500/40 hover:scale-[1.01] hover:brightness-110`
                  }`}
                >
                  {processing ? (
                    <>
                      <div className="w-7 h-7 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      {toolId === ToolType.AI_SUMMARY ? 'Generate Summary' : 'Process File(s)'}
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    </>
                  )}
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
