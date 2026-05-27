import { generateSlug, autoCategorize } from "./ai-utils";

export interface CatalogProduct {
  id: string;
  slug: string;
  sku: string;
  brand: string;
  product_name: string;
  short_name: string;
  category: string;
  subcategory: string;
  product_type: string;
  skin_type: string[];
  ingredients: string[];
  benefits: string[];
  claims: string[];
  usage_instructions: string;
  shade: string;
  quantity: string;
  mrp: number | null;
  selling_price: number | null;
  discount_percent: number | null;
  currency: "INR";
  stock: number;
  seo_title: string;
  seo_description: string;
  tags: string[];
  image_url: string;
  ocr_text: string;
  ai_confidence: number;
  field_confidence: Record<string, number>;
  extraction_source: string;
  verified: boolean;
  status: "active" | "draft" | "archived";
  manual_review_required?: boolean;
  manual_review_reasons?: string[];
}

/**
 * List of banned hallucination terms, mock prices, and placeholders.
 */
const BANNED_PLACEHOLDERS = new Set([
  "untitled product",
  "untitled",
  "unknown brand",
  "unknown",
  "generic product",
  "cosmetic product",
  "premium skincare product",
  "premium skincare",
  "skincare product",
  "beauty product",
  "cosmetics",
  "cosmetic",
  "skincare",
  "null",
  "undefined",
  "rs 999",
  "rs.999",
  "999",
  "1099",
  "rs 1099",
  "ai extraction completed",
  "detected from packaging",
]);

/**
 * Allowed strict high-contrast beauty categories.
 */
export const ALLOWED_CATEGORIES = [
  "Lip Care",
  "Lipstick",
  "Serum",
  "Toner",
  "Cleanser",
  "Sunscreen",
  "Moisturizer",
  "Hair Care",
  "Beauty Tools",
  "Cooling Therapy",
  "Face Mask",
  "Acne Treatment",
  "Barrier Repair",
  "Hydration",
  "Makeup",
  "Cosmetics",
  "Skincare Device",
];

/**
 * Validates whether an extracted string value is a hallucination or placeholder.
 */
export function isHallucinatedOrPlaceholder(field: string, value: any): boolean {
  if (value === undefined || value === null) return false;
  const str = String(value).trim().toLowerCase();
  
  if (!str) return false;

  // Exact banned placeholders that are never valid anywhere
  const exactBanned = new Set([
    "untitled product",
    "untitled",
    "unknown brand",
    "unknown",
    "generic product",
    "cosmetic product",
    "premium skincare product",
    "premium skincare",
    "skincare product",
    "beauty product",
    "null",
    "undefined",
    "rs 999",
    "rs.999",
    "999",
    "1099",
    "rs 1099",
    "ai extraction completed",
    "detected from packaging"
  ]);

  if (exactBanned.has(str)) return true;

  // Restrict generic cosmetics keywords to title and brand fields
  if (field === "product_name" || field === "brand") {
    if (str === "skincare" || str === "beauty" || str === "cosmetics" || str === "cosmetic" || str === "product") {
      return true;
    }
  }

  // Specific field validations
  if (field === "mrp" || field === "selling_price") {
    const num = Number(str.replace(/[^0-9.]/g, ""));
    if (isNaN(num) || num <= 0 || num === 999 || num === 1099) return true;
  }

  return false;
}

/**
 * Safe parser for number values.
 */
function cleanNumber(val: any): number | null {
  if (typeof val === "number") return val > 0 ? val : null;
  if (!val) return null;
  const cleaned = String(val).replace(/[^0-9.]/g, "").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) || num <= 0 ? null : Math.round(num);
}

/**
 * Generate a strict SKU code.
 */
export function generateSku(brand: string, name: string, category: string): string {
  const brandCode = (brand || "GEN").slice(0, 3).toUpperCase().replace(/[^A-Z]/g, "X");
  const catCode = (category || "SKN").slice(0, 3).toUpperCase().replace(/[^A-Z]/g, "X");
  const rand = Math.floor(100 + Math.random() * 900);
  return `${catCode}-${brandCode}-${rand}`;
}

/**
 * Helper to check if the AI suggestion is actually worse/degraded compared to a rich existing original field.
 */
export function shouldProtectOriginalField(
  field: string,
  originalVal: any,
  incomingVal: any,
  incomingConfidence: number
): boolean {
  // If original doesn't exist, we don't need to protect it
  if (originalVal === undefined || originalVal === null) return false;
  if (Array.isArray(originalVal) && originalVal.length === 0) return false;
  if (typeof originalVal === "string" && !originalVal.trim()) return false;

  // Protect rich fields from being updated by low confidence AI scans
  if (incomingConfidence < 80) return true;

  // Specific field content-length protection
  if (field === "ingredients" || field === "benefits" || field === "claims" || field === "usage_instructions") {
    const origLen = Array.isArray(originalVal) ? originalVal.length : String(originalVal).length;
    const incomingLen = Array.isArray(incomingVal) ? incomingVal.length : String(incomingVal).length;
    
    // If the original has significantly more detail (e.g. detailed ingredients list), protect it from brief AI summaries
    if (origLen > 5 && incomingLen < origLen / 2) return true;
  }

  // Protect valid prices from being wiped out
  if ((field === "mrp" || field === "selling_price") && originalVal > 0) {
    if (!incomingVal || incomingVal <= 0) return true;
  }

  return false;
}

/**
 * Anti-Hallucination & Overwrite Protection Orchestration Engine.
 * Converts raw parsed NIM data into the strict 31-field CatalogProduct schema.
 */
export function processProductExtraction(
  id: string,
  imageUrl: string,
  ocr_text: string,
  incoming: any,
  original?: Partial<CatalogProduct>
): CatalogProduct {
  const manual_review_reasons: string[] = [];
  const field_confidence: Record<string, number> = {};

  // Extract raw incoming fields from Gemini Vision AI structure
  const rawBrand = incoming.brand?.value;
  const rawName = incoming.product_name?.value;
  const rawShortName = incoming.short_name?.value || rawName;
  const rawCategory = incoming.category?.value;
  const rawSubcategory = incoming.subcategory?.value;
  const rawProductType = incoming.product_type?.value;
  const rawSkinType = incoming.skin_type?.value;
  const rawIngredients = incoming.ingredients?.value;
  const rawBenefits = incoming.benefits?.value;
  const rawClaims = incoming.claims?.value;
  const rawUsage = incoming.usage_instructions?.value;
  const rawShade = incoming.shade?.value;
  const rawQuantity = incoming.quantity?.value;
  const rawMrp = cleanNumber(incoming.mrp?.value);
  const rawPrice = cleanNumber(incoming.selling_price?.value);
  const rawTags = incoming.tags?.value;

  // Field Confidence Scores (defaults to Gemini confidence, adjusted by rules)
  const getConfidence = (field: string, node: any, val: any): number => {
    let conf = node?.confidence || 0;
    if (isHallucinatedOrPlaceholder(field, val)) {
      conf = Math.min(conf, 20); // Slash confidence on placeholders
    }
    return conf;
  };

  field_confidence.brand = getConfidence("brand", incoming.brand, rawBrand);
  field_confidence.product_name = getConfidence("product_name", incoming.product_name, rawName);
  field_confidence.category = getConfidence("category", incoming.category, rawCategory);
  field_confidence.product_type = getConfidence("product_type", incoming.product_type, rawProductType);
  field_confidence.mrp = getConfidence("mrp", incoming.mrp, rawMrp);
  field_confidence.selling_price = getConfidence("selling_price", incoming.selling_price, rawPrice);

  // Core Overwrite Guard Checks
  const resolveField = (field: string, originalVal: any, incomingVal: any, conf: number, fallback: any): any => {
    const protect = shouldProtectOriginalField(field, originalVal, incomingVal, conf);
    if (protect) {
      manual_review_reasons.push(`Protected original field: [${field}] from lower-quality AI suggestion.`);
      return originalVal;
    }
    return !isHallucinatedOrPlaceholder(field, incomingVal) ? incomingVal : (originalVal !== undefined ? originalVal : fallback);
  };

  // ── 1. Brand ──
  const brand = resolveField("brand", original?.brand, rawBrand, field_confidence.brand, "Unknown Brand");
  if (brand === "Unknown Brand") {
    manual_review_reasons.push("Brand could not be extracted; defaulted to 'Unknown Brand'.");
  }

  // ── 2. Product Name & Short Name ──
  const product_name = resolveField("product_name", original?.product_name, rawName, field_confidence.product_name, "New Product");
  const short_name = resolveField("short_name", original?.short_name, rawShortName, field_confidence.product_name, product_name);
  if (product_name === "New Product") {
    manual_review_reasons.push("Product title could not be extracted; defaulted to 'New Product'.");
  }

  // ── 3. Category & Taxonomy ──
  let category = resolveField("category", original?.category, rawCategory, field_confidence.category, "Skincare");
  
  // Anti-downgrade taxonomy auto-categorizer check
  if (category === "Skincare" && (original?.category && original.category !== "Skincare")) {
    category = original.category; // Preserve original rich category
  } else if (category === "Skincare") {
    // If no original is set, try to infer using our rich title mapping before falling back to generic Skincare
    const mappedCat = autoCategorize(product_name, rawProductType || "");
    if (mappedCat && mappedCat !== "Skincare") {
      category = mappedCat;
    }
  }

  const subcategory = resolveField("subcategory", original?.subcategory, rawSubcategory, field_confidence.category, "");
  const product_type = resolveField("product_type", original?.product_type, rawProductType, field_confidence.product_type, "");

  // ── 4. Ingredients, Benefits, Claims (Arrays) ──
  const parseArray = (val: any): string[] => {
    if (Array.isArray(val)) return val.map((v) => String(v).trim()).filter(Boolean);
    if (typeof val === "string") return val.split(/, |,\n|;/).map((v) => v.trim()).filter(Boolean);
    return [];
  };

  const skin_type = parseArray(resolveField("skin_type", original?.skin_type, rawSkinType, 80, ["all"]));
  const ingredients = parseArray(resolveField("ingredients", original?.ingredients, parseArray(rawIngredients), 85, []));
  const benefits = parseArray(resolveField("benefits", original?.benefits, parseArray(rawBenefits), 85, []));
  const claims = parseArray(resolveField("claims", original?.claims, parseArray(rawClaims), 80, []));
  const usage_instructions = resolveField("usage_instructions", original?.usage_instructions, rawUsage, 80, "");

  // ── 5. Shades & Quantities ──
  const shade = resolveField("shade", original?.shade, rawShade, 90, "");
  const quantity = resolveField("quantity", original?.quantity, rawQuantity, 90, "");

  // ── 6. Pricing & Discounts ──
  const mrp = resolveField("mrp", original?.mrp, rawMrp, field_confidence.mrp, null);
  const selling_price = resolveField("selling_price", original?.selling_price, rawPrice, field_confidence.selling_price, null);

  // Auto-calculate discount percentage correctly
  let discount_percent: number | null = null;
  if (mrp && selling_price && selling_price < mrp) {
    discount_percent = Math.round(((mrp - selling_price) / mrp) * 100);
  }

  // ── 7. Stock, Slug, and SKU Generators ──
  const stock = original?.stock !== undefined ? original.stock : 20; // default seed stock
  const slug = generateSlug(product_name);
  const sku = original?.sku || generateSku(brand, product_name, category);

  // ── 8. SEO Metadata Generation ──
  const seo_title = original?.seo_title || `${product_name} | ${brand} — Glow Addict`.slice(0, 60);
  const seo_description = original?.seo_description || `Shop ${product_name} by ${brand}. High-quality authentic cosmetics verified by Sayanita.`.slice(0, 160);
  
  const parsedIncomingTags = parseArray(resolveField("tags", original?.tags, parseArray(rawTags), 80, []));
  const tagSet = new Set<string>();
  tagSet.add(brand.toLowerCase());
  tagSet.add(category.toLowerCase());
  if (product_type) tagSet.add(product_type.toLowerCase());
  parsedIncomingTags.forEach(t => tagSet.add(t.toLowerCase()));
  if (original?.tags) original.tags.forEach(t => tagSet.add(t.toLowerCase()));
  const tags = Array.from(tagSet).filter(Boolean);

  // ── 9. Overall AI Confidence Calculation ──
  const scoredFields = [brand, product_name, category, selling_price, mrp, ingredients.length > 0 ? "filled" : null].filter(Boolean);
  const baseConfidence = Math.round((scoredFields.length / 6) * 100);
  const ai_confidence = Math.round(
    (baseConfidence + (incoming.ai_confidence || 0) + (field_confidence.product_name || 0)) / 3
  );

  // Status mapping
  const status = original?.status || "draft";
  const verified = ai_confidence >= 85 && manual_review_reasons.length === 0;

  return {
    id: id || original?.id || `prod-catalog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    slug,
    sku,
    brand,
    product_name,
    short_name,
    category,
    subcategory,
    product_type,
    skin_type,
    ingredients,
    benefits,
    claims,
    usage_instructions,
    shade,
    quantity,
    mrp,
    selling_price,
    discount_percent,
    currency: "INR",
    stock,
    seo_title,
    seo_description,
    tags,
    image_url: imageUrl || original?.image_url || "",
    ocr_text,
    ai_confidence: verified ? Math.max(88, ai_confidence) : ai_confidence,
    field_confidence,
    extraction_source: "Google Gemini 1.5 Pro + Groq Llama 3.3",
    verified,
    status: status as any,
    manual_review_required: manual_review_reasons.length > 0 || ai_confidence < 80,
    manual_review_reasons: manual_review_reasons.length > 0 ? manual_review_reasons : undefined,
  };
}
