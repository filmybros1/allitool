
import { GoogleGenAI } from "@google/genai";

declare var process: any;

export class GeminiService {
  /**
   * Efficiently converts a File object to a base64 string.
   */
  private static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64String = result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  static async analyzeDocument(file: File): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const modelName = 'gemini-3-flash-preview';
    
    try {
      const base64 = await this.fileToBase64(file);
      
      const response = await ai.models.generateContent({
        model: modelName,
        contents: {
          parts: [
            { text: "Analyze the following document and provide a comprehensive summary. Highlight the primary objective, secondary key points, and list any actionable items or conclusions found. If it's a short document, be concise but thorough. Use a professional and clear tone." },
            { 
              inlineData: { 
                mimeType: file.type || 'application/pdf', 
                data: base64 
              } 
            }
          ]
        },
        config: {
          temperature: 0.4, // Lower temperature for more focused summaries
          topP: 0.8,
        }
      });

      if (!response.text) {
        throw new Error("Empty response from Gemini");
      }

      return response.text;
    } catch (error: any) {
      console.error("Gemini AI Analysis Error:", error);
      if (error.message?.includes("API_KEY")) {
        return "Error: AI services are currently unavailable due to an invalid configuration. Please contact support.";
      }
      return "I encountered an error while trying to process this document. This usually happens with very large files or unsupported formats. Please try a smaller file.";
    }
  }

  static async chatWithDocument(file: File, query: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const modelName = 'gemini-3-flash-preview';

    try {
      const base64 = await this.fileToBase64(file);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: {
          parts: [
            { text: `CONTEXT: You are a professional document assistant. Answer the following user question based strictly on the provided document content. QUESTION: ${query}` },
            { 
              inlineData: { 
                mimeType: file.type || 'application/pdf', 
                data: base64 
              } 
            }
          ]
        }
      });

      return response.text || "I'm sorry, I couldn't find an answer to that in the document.";
    } catch (error) {
      console.error("Gemini AI Chat Error:", error);
      return "I failed to process your query against the document. Please try rephrasing your question.";
    }
  }
}
