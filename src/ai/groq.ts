import Groq from "groq-sdk";

const apiKey =
  process.env.GROQ_API_KEY ||
  process.env.VITE_GROQ_API_KEY ||
  process.env.NEXT_PUBLIC_GROQ_API_KEY ||
  "";

if (!apiKey) {
  console.warn("⚠️ Groq API Key is missing. Copywriting enrichment will fall back to legacy pipelines.");
}

export const groq = apiKey
  ? new Groq({
      apiKey,
    })
  : null;
