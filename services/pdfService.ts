
declare const PDFLib: any;
declare const pdfjsLib: any;

// Initialize PDF.js worker
if (typeof window !== 'undefined' && 'pdfjsLib' in window) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
}

export class PDFService {
  private static parsePageRange(rangeStr: string, maxPages: number): number[] {
    if (!rangeStr || rangeStr.trim().toLowerCase() === 'all' || rangeStr.trim() === '') {
      return Array.from({ length: maxPages }, (_, i) => i);
    }

    const pages = new Set<number>();
    const parts = rangeStr.split(',');

    for (let part of parts) {
      part = part.trim();
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-');
        const start = parseInt(startStr.trim());
        const end = parseInt(endStr.trim());
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.max(1, start); i <= Math.min(maxPages, end); i++) {
            pages.add(i - 1);
          }
        }
      } else {
        const p = parseInt(part);
        if (!isNaN(p) && p >= 1 && p <= maxPages) {
          pages.add(p - 1);
        }
      }
    }

    return pages.size > 0 
      ? Array.from(pages).sort((a, b) => a - b)
      : Array.from({ length: maxPages }, (_, i) => i);
  }

  static async mergePDFs(files: { file: File, selection?: string }[]): Promise<Uint8Array> {
    const { PDFDocument } = PDFLib;
    const mergedPdf = await PDFDocument.create();

    for (const { file, selection } of files) {
      const arrayBuffer = await file.arrayBuffer();
      const donorPdf = await PDFDocument.load(arrayBuffer);
      const pageCount = donorPdf.getPageCount();
      
      const indicesToCopy = this.parsePageRange(selection || '', pageCount);
      const copiedPages = await mergedPdf.copyPages(donorPdf, indicesToCopy);
      copiedPages.forEach((page: any) => mergedPdf.addPage(page));
    }

    return await mergedPdf.save();
  }

  static async imagesToPDF(files: File[]): Promise<Uint8Array> {
    const { PDFDocument } = PDFLib;
    const pdfDoc = await PDFDocument.create();

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const isPng = file.type === 'image/png';
      const image = isPng 
        ? await pdfDoc.embedPng(arrayBuffer)
        : await pdfDoc.embedJpg(arrayBuffer);

      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });
    }

    return await pdfDoc.save();
  }

  static async rotatePDF(file: File, degrees: number): Promise<Uint8Array> {
    const { PDFDocument, degrees: pdfDegrees } = PDFLib;
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    
    pages.forEach((page: any) => {
      const rotation = page.getRotation().angle;
      page.setRotation(pdfDegrees(rotation + degrees));
    });

    return await pdfDoc.save();
  }

  static async splitPDF(file: File, selection: string): Promise<Uint8Array> {
    const { PDFDocument } = PDFLib;
    const arrayBuffer = await file.arrayBuffer();
    const sourcePdf = await PDFDocument.load(arrayBuffer);
    const pageCount = sourcePdf.getPageCount();
    
    const indicesToCopy = this.parsePageRange(selection, pageCount);
    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(sourcePdf, indicesToCopy);
    copiedPages.forEach((page: any) => newPdf.addPage(page));
    
    return await newPdf.save();
  }

  static async compressPDF(file: File): Promise<Uint8Array> {
    const { PDFDocument } = PDFLib;
    const arrayBuffer = await file.arrayBuffer();
    // Simply loading and re-saving with pdf-lib often reduces file size by optimizing the object structure and removing redundant metadata
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    return await pdfDoc.save({ useObjectStreams: true });
  }

  static async pdfToImages(file: File): Promise<Blob[]> {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const images: Blob[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      if (context) {
        await page.render({ canvasContext: context, viewport }).promise;
        const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.9));
        images.push(blob);
      }
    }
    return images;
  }

  static downloadBlob(data: Uint8Array | Blob, filename: string, mimeType: string = 'application/pdf') {
    const blob = data instanceof Blob ? data : new Blob([data.buffer], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
