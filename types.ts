
export enum ToolType {
  MERGE = 'merge',
  SPLIT = 'split',
  ROTATE = 'rotate',
  AI_SUMMARY = 'ai-summary',
  IMAGE_TO_PDF = 'img-to-pdf',
  PDF_TO_IMG = 'pdf-to-img',
  COMPRESS = 'compress',
  IMG_COMPRESS = 'img-compress',
  JPG_TO_PNG = 'jpg-to-png',
  PNG_TO_JPG = 'png-to-jpg'
}

export interface ToolMetadata {
  id: ToolType;
  title: string;
  description: string;
  icon: string;
  color: string;
  category: 'organize' | 'convert' | 'optimize' | 'ai';
}

export interface FileData {
  id: string;
  file: File;
  previewUrl?: string;
  pages?: number;
  status: 'idle' | 'processing' | 'done' | 'error';
  pageSelection?: string;
}
