
declare const PDFLib: any;

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

    // Default to all pages if selection resulted in nothing valid
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

  static async splitPDF(file: File, ranges: { start: number, end: number }[]): Promise<Uint8Array[]> {
    const { PDFDocument } = PDFLib;
    const arrayBuffer = await file.arrayBuffer();
    const sourcePdf = await PDFDocument.load(arrayBuffer);
    const results: Uint8Array[] = [];

    for (const range of ranges) {
      const newPdf = await PDFDocument.create();
      const indices = [];
      for (let i = range.start - 1; i < range.end; i++) {
        indices.push(i);
      }
      const copiedPages = await newPdf.copyPages(sourcePdf, indices);
      copiedPages.forEach((page: any) => newPdf.addPage(page));
      results.push(await newPdf.save());
    }

    return results;
  }

  static downloadBlob(data: Uint8Array, filename: string, mimeType: string = 'application/pdf') {
    const blob = new Blob([data.buffer], { type: mimeType });
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
