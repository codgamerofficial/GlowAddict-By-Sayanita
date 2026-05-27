import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey =
  process.env.GEMINI_API_KEY ||
  process.env.VITE_GEMINI_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
  "";

if (!apiKey) {
  console.warn("⚠️ Google Gemini API Key is missing. Please configure it in your .env file.");
}

export const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Primary high-trust vision model
export const geminiModel = genAI
  ? genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite",
    })
  : null;


