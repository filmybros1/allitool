
import { GoogleGenAI } from "@google/genai";

/**
 * GeminiService handles interactions with the Google GenAI API.
 * It uses gemini-3-flash-preview for document analysis and chat.
 */
export class GeminiService {
  // Guideline: API key is obtained directly from process.env.API_KEY.

  static async analyzeDocument(file: File): Promise<string> {
    // Fix: Create a new GoogleGenAI instance right before making an API call to ensure latest key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-flash-preview';
    
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    try {
      // Fix: Use correct content structure { parts: [...] }
      const response = await ai.models.generateContent({
        model,
        contents: {
          parts: [
            { text: "Please provide a detailed summary of this PDF document. Identify the main topics, key points, and any action items mentioned." },
            { inlineData: { mimeType: 'application/pdf', data: base64 } }
          ]
        },
        config: {
          temperature: 0.7,
          topP: 0.95,
        }
      });

      // Fix: response.text is a property, not a method
      return response.text || "I'm sorry, I couldn't generate a summary for this document.";
    } catch (error) {
      console.error("Gemini AI error:", error);
      return "An error occurred while analyzing the document with AI.";
    }
  }

  static async chatWithDocument(file: File, query: string): Promise<string> {
    // Fix: Create a new GoogleGenAI instance right before making an API call
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-flash-preview';
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    try {
      // Fix: Use correct content structure { parts: [...] }
      const response = await ai.models.generateContent({
        model,
        contents: {
          parts: [
            { text: `Based on the provided PDF document, answer the following question: ${query}` },
            { inlineData: { mimeType: 'application/pdf', data: base64 } }
          ]
        }
      });

      // Fix: response.text is a property, not a method
      return response.text || "I don't have enough information to answer that.";
    } catch (error) {
      console.error("Gemini AI chat error:", error);
      return "AI failed to process your query.";
    }
  }
}
