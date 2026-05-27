import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdminApiKey } from "@/lib/adminAuth";
import { calculateDiscount, autoCategorize, generateSeoMetadata, calculateAiConfidence, cleanExtractedPrice, parseIndianPrice } from "@/lib/ai-utils";
import { AiVisionService } from "@/lib/ai-vision-service";
import { geminiModel } from "@/ai/gemini";
import { groq } from "@/ai/groq";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getSupabaseServerClient() {
  if (!supabaseUrl || !supabaseKey) throw new Error("Missing Supabase environment keys.");
  return createClient(supabaseUrl, supabaseKey);
}

async function uploadToSupabase(file: File, origin: string) {
  const supabase = getSupabaseServerClient();
  const extension = file.name.split(".").pop() || "jpg";
  const fileName = `admin-${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  try {
    const { error } = await supabase.storage.from("product-images").upload(fileName, bytes, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });
    if (!error) {
      const { data: publicData } = supabase.storage.from("product-images").getPublicUrl(fileName);
      return publicData.publicUrl;
    }
  } catch (err) {
    console.warn("Supabase upload failed, falling back to local:", err);
  }

  // Local fallback
  try {
    const fs = await import("fs");
    const path = await import("path");
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.promises.mkdir(uploadsDir, { recursive: true });
    const localPath = path.join(uploadsDir, fileName);
    await fs.promises.writeFile(localPath, bytes);
    return `${origin}/uploads/${fileName}`;
  } catch (fsErr) {
    throw new Error("Both Supabase storage and local file fallback failed.");
  }
}

export async function POST(request: NextRequest) {
  const authError = requireAdminApiKey(request);
  if (authError) return authError;

  try {
    const contentType = request.headers.get("content-type") || "";
    let imageUrl = "";
    let uploadedFile: File | undefined = undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");
      if (!(file instanceof File)) return NextResponse.json({ error: "Image file is required." }, { status: 400 });
      const origin = new URL(request.url).origin;
      imageUrl = await uploadToSupabase(file, origin);
      uploadedFile = file;
    } else {
      const body = await request.json();
      imageUrl = String(body?.imageUrl || "").trim();
    }

    if (!imageUrl) return NextResponse.json({ error: "Image URL is required." }, { status: 400 });

    const service = new AiVisionService();

    let extractedData;
    let extractionStatus: "full" | "partial" | "fallback" = "full";
    const isGeminiGroqActive = !!geminiModel && !!groq;
    const aiModelUsed = "Google Gemini 1.5 Pro + Groq Llama 3.3";

    try {
      const result = await service.extractProductDetails(imageUrl, uploadedFile);
      extractedData = result.parsed;
      extractedData.extractedText = result.ocrText;
    } catch (nvErr) {
      console.error("[AI Pipeline] Upgraded visual-enrichment pipeline failed, triggering fallback:", nvErr);
      extractionStatus = "fallback";
      extractedData = {
        product_name: { value: null, source: "inferred", confidence: 0, reasoning: "AI extraction needs manual review - fallback triggered." },
        brand: { value: null, source: "inferred", confidence: 0, reasoning: "AI extraction needs manual review - fallback triggered." },
        category: { value: null, source: "inferred", confidence: 0, reasoning: "AI extraction needs manual review - fallback triggered." },
        product_type: { value: null, source: "inferred", confidence: 0, reasoning: "AI extraction needs manual review - fallback triggered." },
        mrp: { value: null, source: "inferred", confidence: 0, reasoning: "AI extraction needs manual review - fallback triggered." },
        offer_price: { value: null, source: "inferred", confidence: 0, reasoning: "AI extraction needs manual review - fallback triggered." },
        discount: { value: null, source: "inferred", confidence: 0, reasoning: "AI extraction needs manual review - fallback triggered." },
        benefits: { value: null, source: "inferred", confidence: 0, reasoning: "AI extraction needs manual review - fallback triggered." },
        ingredients: { value: null, source: "inferred", confidence: 0, reasoning: "AI extraction needs manual review - fallback triggered." },
        claims: { value: null, source: "inferred", confidence: 0, reasoning: "AI extraction needs manual review - fallback triggered." },
        description: { value: null, source: "inferred", confidence: 0, reasoning: "AI extraction needs manual review - fallback triggered." },
        skin_type: { value: null, source: "inferred", confidence: 0, reasoning: "AI extraction needs manual review - fallback triggered." },
        weight: { value: null, source: "inferred", confidence: 0, reasoning: "AI extraction needs manual review - fallback triggered." },
        variant: { value: null, source: "inferred", confidence: 0, reasoning: "AI extraction needs manual review - fallback triggered." },
        extractedText: ""
      };
    }

    const fieldConfidence = {
      title: extractedData.product_name?.confidence || 0,
      brand: extractedData.brand?.confidence || 0,
      category: extractedData.category?.confidence || 0,
      pricing: Math.max(extractedData.offer_price?.confidence || 0, extractedData.mrp?.confidence || 0),
      productType: extractedData.product_type?.confidence || 0,
      description: extractedData.description?.confidence || 0,
      ingredients: extractedData.ingredients?.confidence || 0,
      benefits: extractedData.benefits?.confidence || 0,
      weight: extractedData.weight?.confidence || 0,
      variant: extractedData.variant?.confidence || 0,
    };

    const confidenceKeys = [
      extractedData.product_name?.confidence || 0,
      extractedData.brand?.confidence || 0,
      extractedData.category?.confidence || 0,
      extractedData.product_type?.confidence || 0,
      extractedData.offer_price?.confidence || 0,
      extractedData.mrp?.confidence || 0,
      extractedData.description?.confidence || 0,
    ].filter((c) => c > 0);
    
    const averageConfidence = confidenceKeys.length > 0
      ? Math.round(confidenceKeys.reduce((acc, c) => acc + c, 0) / confidenceKeys.length)
      : 30;

    const price = Number(extractedData.offer_price?.value) > 0 ? Number(extractedData.offer_price.value) : 0;
    const mrp = Number(extractedData.mrp?.value) > 0 ? Number(extractedData.mrp.value) : 0;
    const discount_percent = calculateDiscount(mrp, price);

    const seo = generateSeoMetadata({
      title: extractedData.product_name?.value || "New Product",
      brand: extractedData.brand?.value || "Unknown Brand",
      category: extractedData.category?.value || "Skincare",
      description: extractedData.description?.value || "Premium beauty product curated by Glow Addict.",
    });

    const canonicalExtract = {
      title: String(extractedData.product_name?.value || ""),
      brand: String(extractedData.brand?.value || ""),
      category: autoCategorize(String(extractedData.product_name?.value || ""), String(extractedData.description?.value || "")),
      description: String(extractedData.description?.value || ""),
      price,
      mrp,
      skuHint: "",
      shades: [],
      extractedText: String(extractedData.extractedText || ""),
      ingredients: Array.isArray(extractedData.ingredients?.value) ? extractedData.ingredients.value.join(", ") : String(extractedData.ingredients?.value || ""),
      benefits: Array.isArray(extractedData.benefits?.value) ? extractedData.benefits.value.join(", ") : String(extractedData.benefits?.value || ""),
      skinType: Array.isArray(extractedData.skin_type?.value) ? extractedData.skin_type.value.join(", ") : String(extractedData.skin_type?.value || "all"),
      productType: String(extractedData.product_type?.value || ""),
      variant: String(extractedData.variant?.value || ""),
      weight: String(extractedData.weight?.value || ""),
      tags: [extractedData.brand?.value, extractedData.category?.value, extractedData.product_type?.value].filter(Boolean),
    };

    const reasoning = {
      title: extractedData.product_name?.reasoning || "",
      brand: extractedData.brand?.reasoning || "",
      category: extractedData.category?.reasoning || "",
      pricing: extractedData.offer_price?.reasoning || extractedData.mrp?.reasoning || "",
      productType: extractedData.product_type?.reasoning || "",
      description: extractedData.description?.reasoning || "",
      ingredients: extractedData.ingredients?.reasoning || "",
      benefits: extractedData.benefits?.reasoning || "",
      weight: extractedData.weight?.reasoning || "",
      variant: extractedData.variant?.reasoning || "",
    };

    const sources = {
      title: extractedData.product_name?.source || "ocr",
      brand: extractedData.brand?.source || "ocr",
      category: extractedData.category?.source || "ocr",
      pricing: extractedData.offer_price?.source || "ocr",
      productType: extractedData.product_type?.source || "ocr",
      description: extractedData.description?.source || "ocr",
      ingredients: extractedData.ingredients?.source || "ocr",
      benefits: extractedData.benefits?.source || "ocr",
      weight: extractedData.weight?.source || "ocr",
      variant: extractedData.variant?.source || "ocr",
    };

    const ai_extraction = {
      raw_ocr_text: canonicalExtract.extractedText,
      parsed_entities: { ...canonicalExtract },
      confidence: averageConfidence,
      field_confidence: fieldConfidence,
      reasoning,
      sources,
      ai_model: aiModelUsed,
      extraction_status: extractionStatus,
      extracted_at: new Date().toISOString(),
      extraction_version: "4.0.0",
      reviewed_by_admin: false,
      manual_overrides: false,
    };

    return NextResponse.json({
      imageUrl,
      extractionStatus,
      extracted: {
        ...canonicalExtract,
        discount_percent,
        ...seo,
        ai_confidence: averageConfidence,
        ai_extraction,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
