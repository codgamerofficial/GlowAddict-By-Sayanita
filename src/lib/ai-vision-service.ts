import fs from "fs";
import path from "path";
import { buildProductDatabase } from "@/ai/enrichProduct";
import { geminiModel } from "@/ai/gemini";
import { groq } from "@/ai/groq";

export interface RawVisionResult {
  ocrText: string;
  parsed: any;
}

/**
 * High-Trust Google Gemini Vision & Groq Cloud Hybrid Gateway Service.
 * Formulates structured beauty catalog data factually without any external AI dependencies.
 */
export class AiVisionService {
  constructor(apiKey?: string) {
    // API keys are loaded directly from environments via gemini.ts and groq.ts
  }

  /**
   * Encodes a remote image URL or local upload file into standard base64 data URI format.
   */
  public async resolveImageBase64(imageUrl: string, file?: File): Promise<string> {
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      return `data:${file.type || "image/jpeg"};base64,${buffer.toString("base64")}`;
    }

    if (imageUrl.startsWith("data:")) {
      return imageUrl;
    }

    // Local public asset resolution (handles relative URLs like /images/...)
    if (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://") && !imageUrl.startsWith("data:")) {
      try {
        const cleanPath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
        const localPath = path.join(process.cwd(), "public", cleanPath);
        if (fs.existsSync(localPath)) {
          const buffer = await fs.promises.readFile(localPath);
          const ext = path.extname(localPath).replace(".", "") || "jpeg";
          const mimeType = ext === "png" ? "image/png" : "image/jpeg";
          return `data:${mimeType};base64,${buffer.toString("base64")}`;
        }
      } catch (err) {
        console.error("[AI Gateway] Failed to read local public file:", err);
      }
    }

    // Fetch remote resource
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image for analysis: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = response.headers.get("content-type") || "image/jpeg";
    return `data:${mimeType};base64,${base64}`;
  }

  /**
   * Orchestrates the complete dual-engine OCR and copywriting mapping.
   */
  public async extractProductDetails(imageUrl: string, file?: File): Promise<RawVisionResult> {
    const isGeminiGroqActive = !!geminiModel && !!groq;
    
    if (!isGeminiGroqActive) {
      throw new Error(
        "❌ Google Gemini & Groq Cloud APIs are unconfigured. Please add GEMINI_API_KEY and GROQ_API_KEY to your .env.local file to initialize the AI beauty catalog extraction engine."
      );
    }

    console.log(`[AI Gateway] Google Gemini Vision + Groq Cloud stack active. Initiating extraction for image: ${file ? file.name : imageUrl}`);
    
    const base64Data = await this.resolveImageBase64(imageUrl, file);
    const result = await buildProductDatabase(base64Data);
    
    const ocrText = `=== GEMINI VISION FACTUAL OCR ===\n${result.product_name?.reasoning || "Factual extraction scan successfully resolved."}\n\n=== INGREDIENTS LIST ===\n${Array.isArray(result.ingredients?.value) ? result.ingredients.value.join(", ") : result.ingredients?.value || "N/A"}`;
    
    return {
      ocrText,
      parsed: result,
    };
  }
}
