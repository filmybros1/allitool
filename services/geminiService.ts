
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private static ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  static async analyzeDocument(file: File): Promise<string> {
    const model = 'gemini-3-flash-preview';
    
    // For large documents, we might want to convert first few pages to images
    // For this simple implementation, we'll extract text if possible or just use description
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    try {
      const response = await this.ai.models.generateContent({
        model,
        contents: [
          {
            parts: [
              { text: "Please provide a detailed summary of this PDF document. Identify the main topics, key points, and any action items mentioned." },
              { inlineData: { mimeType: 'application/pdf', data: base64 } }
            ]
          }
        ],
        config: {
          temperature: 0.7,
          topP: 0.95,
        }
      });

      return response.text || "I'm sorry, I couldn't generate a summary for this document.";
    } catch (error) {
      console.error("Gemini AI error:", error);
      return "An error occurred while analyzing the document with AI.";
    }
  }

  static async chatWithDocument(file: File, query: string): Promise<string> {
    const model = 'gemini-3-flash-preview';
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    try {
      const response = await this.ai.models.generateContent({
        model,
        contents: [
          {
            parts: [
              { text: `Based on the provided PDF document, answer the following question: ${query}` },
              { inlineData: { mimeType: 'application/pdf', data: base64 } }
            ]
          }
        ]
      });

      return response.text || "I don't have enough information to answer that.";
    } catch (error) {
      return "AI failed to process your query.";
    }
  }
}
