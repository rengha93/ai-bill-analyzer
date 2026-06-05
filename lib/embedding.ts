import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });

export async function embedText(text: string): Promise<number[]> {
  const response = await ai.models.embedContent({
    // Changed from "text-embedding-004" to the updated model ID
    model: "gemini-embedding-2", 
    contents: text,
  });

  const values = response.embeddings?.[0]?.values;

  if (!values) {
    throw new Error("Failed to generate embedding values from the API response.");
  }
  
  return values;
}