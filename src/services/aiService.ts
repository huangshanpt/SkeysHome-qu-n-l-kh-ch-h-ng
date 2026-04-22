import { GoogleGenAI, Type } from "@google/genai";
import { AIExtractionResult } from "../types";

// Always initialize with the environment variable as per AI Studio guidelines
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const aiService = {
  async extractCustomerInfoFromImage(base64Data: string, mimeType: string): Promise<AIExtractionResult> {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: "Trích xuất thông tin khách hàng từ tài liệu/ảnh này. Trả về định dạng JSON với các trường: name, email, phone, address, notes. Nếu không tìm thấy trường nào hãy để null." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            email: { type: Type.STRING },
            phone: { type: Type.STRING },
            address: { type: Type.STRING },
            notes: { type: Type.STRING }
          }
        }
      }
    });

    try {
      const text = response.text;
      return JSON.parse(text || "{}");
    } catch (e) {
      console.error("Failed to parse AI response", e);
      return {};
    }
  },

  async transcribeVoice(audioBase64: string): Promise<string> {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { inlineData: { data: audioBase64, mimeType: "audio/webm" } },
        { text: "Hãy chuyển văn bản từ giọng nói này sang tiếng Việt chính xác." }
      ]
    });
    return response.text || "";
  },

  async processVoiceCommand(text: string): Promise<AIExtractionResult> {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Phân tích câu lệnh giọng nói sau để trích xuất thông tin khách hàng: "${text}". Trả về JSON: { name, email, phone, address, notes }`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            email: { type: Type.STRING },
            phone: { type: Type.STRING },
            address: { type: Type.STRING },
            notes: { type: Type.STRING }
          }
        }
      }
    });
    try {
      const resText = response.text;
      return JSON.parse(resText || "{}");
    } catch (e) {
      return {};
    }
  }
};
