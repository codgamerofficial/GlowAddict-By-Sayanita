/**
 * AI Product Detection Utilities
 * Glow Addict By Sayanita — AI-powered beauty ecommerce
 */

/** Category keyword mapping for auto-categorization */
export const CATEGORY_MAP: Record<string, string> = {
  // Lip products
  lipstick: "Lipsticks", "lip gloss": "Lipsticks", "lip tint": "Lipsticks",
  "lip balm": "Lip Care", "lip scrub": "Lip Care", lip: "Lip Care",
  // Serums & treatments
  serum: "Serums", essence: "Serums", ampoule: "Serums", retinol: "Serums",
  "vitamin c": "Serums", niacinamide: "Serums",
  // Sun care
  sunscreen: "SPF Care", spf: "SPF Care", "sun cream": "SPF Care", "uv protection": "SPF Care",
  // Hydration
  moisturizer: "Hydration", cream: "Hydration", lotion: "Hydration",
  "sleeping mask": "Hydration", "night cream": "Hydration",
  // Cleansers
  cleanser: "Cleansers", facewash: "Cleansers", "face wash": "Cleansers",
  "micellar water": "Cleansers", "oil cleanser": "Cleansers",
  // Toners
  toner: "Toners", mist: "Toners", "face mist": "Toners",
  // Masks
  mask: "Face Masks", "sheet mask": "Face Masks", "face mask": "Face Masks",
  "peel off": "Face Masks", "clay mask": "Face Masks",
  // Makeup
  foundation: "Makeup", concealer: "Makeup", primer: "Makeup",
  blush: "Makeup", highlighter: "Makeup", compact: "Makeup", "bb cream": "Makeup",
  contour: "Makeup", bronzer: "Makeup", "setting spray": "Makeup",
  // Beauty tools
  puff: "Beauty Accessories", sponge: "Beauty Accessories", brush: "Beauty Accessories",
  roller: "Beauty Accessories", "gua sha": "Beauty Accessories",
  // Combos
  combo: "Combos & Kits", kit: "Combos & Kits", set: "Combos & Kits",
  // Hair
  shampoo: "Hair Care", conditioner: "Hair Care", "hair serum": "Hair Care",
  "hair oil": "Hair Care", "hair mask": "Hair Care",
  // Eye
  eye: "Eye Care", kajal: "Eye Care", mascara: "Eye Care",
  eyeliner: "Eye Care", "eye shadow": "Eye Care", eyeshadow: "Eye Care",
  // Nail
  nail: "Nail Care", "nail polish": "Nail Care", "nail art": "Nail Care",
  // Fragrance & body
  perfume: "Fragrances", fragrance: "Fragrances", "body mist": "Fragrances",
  body: "Body Care", "body lotion": "Body Care", "body wash": "Body Care",
  // Exfoliation
  scrub: "Exfoliants", exfoliant: "Exfoliants", "face scrub": "Exfoliants",
  aha: "Exfoliants", bha: "Exfoliants",
};

/** Generate a URL-safe slug from a product title */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

/** Calculate discount percentage from MRP and selling price */
export function calculateDiscount(mrp: number, price: number): number {
  if (!mrp || !price || price >= mrp) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

/** Auto-categorize product based on title and description keywords */
export function autoCategorize(title: string, description?: string): string {
  const text = `${title} ${description || ""}`.toLowerCase();
  const sortedKeys = Object.keys(CATEGORY_MAP).sort((a, b) => b.length - a.length);
  for (const keyword of sortedKeys) {
    if (text.includes(keyword)) return CATEGORY_MAP[keyword];
  }
  return "Skincare";
}

/** Generate SEO metadata from product details */
export function generateSeoMetadata(product: {
  title: string; brand: string; category: string; description: string;
}): { seo_title: string; seo_description: string; seo_keywords: string[]; slug: string } {
  const slug = generateSlug(product.title);
  const seo_title = `${product.title} | ${product.brand} — Glow Addict by Sayanita`.slice(0, 60);
  const descBase = product.description || `${product.title} by ${product.brand}`;
  const seo_description = `Shop ${product.title} by ${product.brand}. ${descBase}`.slice(0, 160);
  const keywords = new Set<string>();
  keywords.add(product.brand.toLowerCase());
  keywords.add(product.category.toLowerCase());
  product.title.toLowerCase().split(/\s+/).filter((w) => w.length > 2).forEach((w) => keywords.add(w));
  keywords.add("skincare"); keywords.add("beauty"); keywords.add("glow addict");
  return { seo_title, seo_description, seo_keywords: Array.from(keywords).slice(0, 12), slug };
}

/** Calculate AI extraction confidence score (0-100) */
export function calculateAiConfidence(fields: Record<string, unknown>): number {
  const keyFields = ["title", "brand", "category", "price", "mrp", "description", "shades", "ingredients"];
  let score = 0;
  const perField = 100 / keyFields.length;
  for (const field of keyFields) {
    const val = fields[field];
    if (val === undefined || val === null || val === "") continue;
    if (Array.isArray(val) && val.length === 0) continue;
    if (typeof val === "number" && val <= 0) continue;
    if (typeof val === "string" && ["Unknown Brand", "New Product", "New Product (fallback)"].includes(val)) continue;
    score += perField;
  }
  return Math.round(Math.min(100, score));
}

/** Get human-readable confidence label with color info */
export function getConfidenceLabel(score: number): {
  label: string; color: string; bgColor: string; borderColor: string; level: "high" | "medium" | "needs_review";
} {
  if (score >= 75) return {
    label: "High Confidence", color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10", borderColor: "border-emerald-500/25", level: "high",
  };
  if (score >= 45) return {
    label: "Review Recommended", color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-500/10", borderColor: "border-amber-500/25", level: "medium",
  };
  return {
    label: "Manual Edit Required", color: "text-red-500 dark:text-red-400",
    bgColor: "bg-red-500/10", borderColor: "border-red-500/25", level: "needs_review",
  };
}

/** Clean extracted price string — handles ₹299, MRP 299, 299/-, Rs.299 */
export function cleanExtractedPrice(raw: string | number | undefined): number {
  if (typeof raw === "number") return raw > 0 ? raw : 0;
  if (!raw) return 0;
  const cleaned = String(raw).replace(/[₹,Rs\.\/\-\s]/gi, "").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) || num < 0 ? 0 : Math.round(num);
}

/** Parse Indian price patterns from OCR text: "MRP ₹299 Offer ₹249" → {mrp: 299, price: 249} */
export function parseIndianPrice(text: string): { price: number; mrp: number } {
  let mrp = 0, price = 0;
  const mrpMatch = text.match(/(?:MRP|M\.?R\.?P\.?)\s*[₹:Rs\.]*\s*(\d[\d,]*\.?\d*)/i);
  if (mrpMatch) mrp = cleanExtractedPrice(mrpMatch[1]);
  const offerMatch = text.match(/(?:offer|sale|our\s*price|price|selling)\s*[₹:Rs\.]*\s*(\d[\d,]*\.?\d*)/i);
  if (offerMatch) price = cleanExtractedPrice(offerMatch[1]);
  if (!mrp && !price) {
    const allPrices = [...text.matchAll(/₹\s*(\d[\d,]*\.?\d*)/g)].map((m) => cleanExtractedPrice(m[1])).filter(Boolean);
    if (allPrices.length >= 2) { mrp = Math.max(...allPrices); price = Math.min(...allPrices); }
    else if (allPrices.length === 1) { price = allPrices[0]; }
  }
  if (mrp && !price) price = mrp;
  if (price && !mrp) mrp = price;
  return { price, mrp };
}

/** Format relative time: "2 days ago", "just now", etc. */
export function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
