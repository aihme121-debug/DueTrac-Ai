import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const GeminiService = {
  /**
   * Parses natural language text into a structured Due object.
   */
  parseDueEntry: async (text: string) => {
    const model = 'gemini-2.5-flash';
    
    try {
      const response = await ai.models.generateContent({
        model,
        contents: `Extract the following information from this text: "${text}". 
        1. Customer Name (if vague, give a best guess). 
        2. Amount (number).
        3. Due Date (ISO string format YYYY-MM-DD). This is the "Next Payment Date". If not specified, assume today (${new Date().toISOString().split('T')[0]}).
        4. Title/Description of the debt.
        5. Short Note (any extra context or details).
        6. Last Agreed Date (if the text mentions they promised to pay on a specific past date but didn't).
        7. Phone Number (if mentioned in the text, format it properly; if not mentioned, leave empty).
        8. Address (if mentioned in the text, include the full address; if not mentioned, leave empty).
        
        Return JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              customerName: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              dueDate: { type: Type.STRING },
              title: { type: Type.STRING },
              shortNote: { type: Type.STRING },
              lastPaymentAgreedDate: { type: Type.STRING },
              phoneNumber: { type: Type.STRING },
              address: { type: Type.STRING }
            },
            required: ["customerName", "amount", "title"]
          }
        }
      });
      
      return response.text ? JSON.parse(response.text) : null;
    } catch (error) {
      console.error("Gemini Parse Error:", error);
      return null;
    }
  },

  /**
   * Generates a polite reminder message.
   */
  generateReminder: async (customerName: string, amount: number, dueDate: string, tone: 'polite' | 'firm' | 'urgent') => {
    const model = 'gemini-2.5-flash';
    
    const prompt = `Write a ${tone} payment reminder message for a customer named ${customerName}. 
    They owe $${amount}. The due date was/is ${new Date(dueDate).toDateString()}. 
    Keep it short, professional, and suitable for WhatsApp or SMS.`;

    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Reminder Error:", error);
      return "Could not generate reminder. Please try again.";
    }
  }
};