
declare const PDFLib: any;

export class PDFService {
  static async mergePDFs(files: File[]): Promise<Uint8Array> {
    const { PDFDocument } = PDFLib;
    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const donorPdf = await PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(donorPdf, donorPdf.getPageIndices());
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
    // Use the underlying ArrayBuffer as BlobPart to avoid Uint8Array vs BlobPart type issues
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
