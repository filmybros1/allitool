
import React from 'react';
import { ToolMetadata, ToolType } from './types';

export const TOOLS: ToolMetadata[] = [
  {
    id: ToolType.MERGE,
    title: 'Merge PDF',
    description: 'Combine multiple PDF files into one seamless document.',
    icon: 'M12 4v16m8-8H4',
    color: 'bg-indigo-600',
    category: 'organize'
  },
  {
    id: ToolType.SPLIT,
    title: 'Split PDF',
    description: 'Extract pages from your PDF or separate into individual files.',
    icon: 'M8 7v10m8-10v10M4 12h16',
    color: 'bg-rose-500',
    category: 'organize'
  },
  {
    id: ToolType.AI_SUMMARY,
    title: 'AI Smart Summary',
    description: 'Use Gemini AI to instantly summarize and analyze PDF contents.',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    color: 'bg-purple-600',
    category: 'ai'
  },
  {
    id: ToolType.ROTATE,
    title: 'Rotate PDF',
    description: 'Fix the orientation of your PDF pages in seconds.',
    icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    color: 'bg-amber-500',
    category: 'organize'
  },
  {
    id: ToolType.IMAGE_TO_PDF,
    title: 'Image to PDF',
    description: 'Convert JPG, PNG, and TIFF images into a professional PDF.',
    icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    color: 'bg-emerald-500',
    category: 'convert'
  },
  {
    id: ToolType.PDF_TO_IMG,
    title: 'PDF to Image',
    description: 'Extract pages from your PDF as high-quality image files.',
    icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
    color: 'bg-sky-500',
    category: 'convert'
  },
  {
    id: ToolType.COMPRESS,
    title: 'Compress PDF',
    description: 'Reduce file size while maintaining the highest quality.',
    icon: 'M19 14l-7 7m0 0l-7-7m7 7V3',
    color: 'bg-orange-500',
    category: 'optimize'
  }
];
