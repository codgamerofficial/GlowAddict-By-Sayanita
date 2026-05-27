import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdminApiKey } from "@/lib/adminAuth";
import fs from "fs";
import path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const PRODUCTS_JSON_PATH = path.join(process.cwd(), "public", "products.json");

function getSupabaseServerClient() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment keys.");
  }
  return createClient(supabaseUrl, supabaseKey);
}

function hasSupabaseConfig() {
  return !!(supabaseUrl && supabaseKey);
}

function readLocalProducts(): any[] {
  if (!fs.existsSync(PRODUCTS_JSON_PATH)) return [];
  try {
    return JSON.parse(fs.readFileSync(PRODUCTS_JSON_PATH, "utf-8"));
  } catch (err) {
    console.error("[Products Route] Failed to read products.json fallback:", err);
    return [];
  }
}

function writeLocalProducts(products: any[]) {
  try {
    fs.writeFileSync(PRODUCTS_JSON_PATH, JSON.stringify(products, null, 2), "utf-8");
  } catch (err) {
    console.error("[Products Route] Failed to write products.json fallback:", err);
  }
}

function parseToArray(val: any): string[] {
  if (Array.isArray(val)) return val.map((v) => String(v).trim()).filter(Boolean);
  if (typeof val === "string") return val.split(/, |,\n|;/).map((v) => v.trim()).filter(Boolean);
  return [];
}

function toLiveProductPayload(payload: Record<string, unknown>) {
  const id = String(payload.id || payload.product_id || `prod-${Date.now()}`);
  const title =
    String(payload.title || payload.name || "Untitled Product").trim() || "Untitled Product";
  const brand =
    String(payload.brand || payload.brand_name || "Unknown Brand").trim() || "Unknown Brand";
  const category = String(payload.category || payload.category_name || "Skincare").trim() || "Skincare";
  const price = Number(payload.price || payload.sale_price || 0);
  const mrp = Number(payload.mrp || payload.price || payload.sale_price || price) || price;
  const stock = Number(payload.stock || payload.stock_quantity || 0);
  const description =
    String(payload.description || payload.short_desc || "").trim() || "No description available.";
  const image =
    String(
      payload.image ||
        payload.image_url ||
        (Array.isArray(payload.images) ? (payload.images[0] as string) : "") ||
        ""
    ).trim() ||
    "";

  const shades: string[] = Array.isArray(payload.shades) ? payload.shades.map((s) => String(s)) : [];

  const sku = String(payload.sku || `SKU-${Date.now()}`).trim();

  const livePayload: Record<string, unknown> = {
    id,
    title,
    sku,
    brand,
    category,
    price: Number.isFinite(price) ? price : 0,
    mrp: Number.isFinite(mrp) ? mrp : price,
    stock: Number.isFinite(stock) ? stock : 0,
    image: image || "https://via.placeholder.com/600",
    description,
    authenticity_flag: Boolean(payload.authenticity_flag) !== false ? true : false,
    shades,
  };

  if (payload.extracted_text !== undefined) {
    livePayload.extracted_text = payload.extracted_text;
  }
  if (payload.cloudinary_public_id !== undefined) {
    livePayload.cloudinary_public_id = payload.cloudinary_public_id;
  }
  if (payload.ai_extraction !== undefined) {
    livePayload.ai_extraction = payload.ai_extraction;
  }
  if (payload.slug !== undefined) {
    livePayload.slug = payload.slug;
  }
  if (payload.ingredients !== undefined) {
    livePayload.ingredients = parseToArray(payload.ingredients);
  }
  if (payload.benefits !== undefined) {
    livePayload.benefits = parseToArray(payload.benefits);
  }
  if (payload.skin_type !== undefined) {
    livePayload.skin_type = parseToArray(payload.skin_type);
  }
  if (payload.product_type !== undefined) {
    livePayload.product_type = payload.product_type;
  }
  if (payload.tags !== undefined) {
    livePayload.tags = parseToArray(payload.tags);
  }
  if (payload.seo_title !== undefined) {
    livePayload.seo_title = payload.seo_title;
  }
  if (payload.seo_description !== undefined) {
    livePayload.seo_description = payload.seo_description;
  }
  if (payload.seo_keywords !== undefined) {
    livePayload.seo_keywords = Array.isArray(payload.seo_keywords) ? payload.seo_keywords.map(k => String(k)) : [];
  }
  if (payload.discount_percent !== undefined) {
    livePayload.discount_percent = payload.discount_percent !== null ? Number(payload.discount_percent) : null;
  }
  if (payload.variant !== undefined) {
    livePayload.variant = payload.variant;
  }
  if (payload.weight !== undefined) {
    livePayload.weight = payload.weight;
  }
  if (payload.ai_confidence !== undefined) {
    livePayload.ai_confidence = payload.ai_confidence !== null ? Number(payload.ai_confidence) : null;
  }
  if (payload.status !== undefined) {
    livePayload.status = payload.status;
  }

  return livePayload;
}

function toLiveProductPatch(payload: Record<string, unknown>) {
  const patch: Record<string, unknown> = {};

  if (
    Object.prototype.hasOwnProperty.call(payload, "title") ||
    Object.prototype.hasOwnProperty.call(payload, "name")
  ) {
    const title = String(payload.title || payload.name || "").trim();
    if (title) patch.title = title;
  }

  if (
    Object.prototype.hasOwnProperty.call(payload, "brand") ||
    Object.prototype.hasOwnProperty.call(payload, "brand_name")
  ) {
    const brand = String(payload.brand || payload.brand_name || "").trim();
    if (brand) patch.brand = brand;
  }

  if (
    Object.prototype.hasOwnProperty.call(payload, "category") ||
    Object.prototype.hasOwnProperty.call(payload, "category_name")
  ) {
    const category = String(payload.category || payload.category_name || "").trim();
    if (category) patch.category = category;
  }

  if (
    Object.prototype.hasOwnProperty.call(payload, "price") ||
    Object.prototype.hasOwnProperty.call(payload, "sale_price")
  ) {
    const price = Number(payload.price || payload.sale_price || 0);
    if (Number.isFinite(price)) patch.price = price;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "mrp")) {
    const mrp = Number(payload.mrp);
    if (Number.isFinite(mrp)) patch.mrp = mrp;
  }

  if (
    Object.prototype.hasOwnProperty.call(payload, "image") ||
    Object.prototype.hasOwnProperty.call(payload, "image_url") ||
    Object.prototype.hasOwnProperty.call(payload, "images")
  ) {
    const image = String(
      payload.image || payload.image_url || (Array.isArray(payload.images) ? payload.images[0] : "") || ""
    ).trim();
    if (image) patch.image = image;
  }

  if (
    Object.prototype.hasOwnProperty.call(payload, "stock") ||
    Object.prototype.hasOwnProperty.call(payload, "stock_quantity")
  ) {
    const stock = Number(payload.stock || payload.stock_quantity || 0);
    if (Number.isFinite(stock)) patch.stock = stock;
  }

  if (
    Object.prototype.hasOwnProperty.call(payload, "description") ||
    Object.prototype.hasOwnProperty.call(payload, "short_desc")
  ) {
    const description = String(payload.description || payload.short_desc || "").trim();
    if (description) {
      patch.description = description;
    }
  }

  if (Object.prototype.hasOwnProperty.call(payload, "shades")) {
    patch.shades = Array.isArray(payload.shades) ? payload.shades.map((s) => String(s)) : [];
  }

  if (Object.prototype.hasOwnProperty.call(payload, "sku")) {
    patch.sku = String(payload.sku);
  }

  if (Object.prototype.hasOwnProperty.call(payload, "authenticity_flag")) {
    patch.authenticity_flag = Boolean(payload.authenticity_flag);
  }

  if (Object.prototype.hasOwnProperty.call(payload, "extracted_text")) {
    patch.extracted_text = payload.extracted_text;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "cloudinary_public_id")) {
    patch.cloudinary_public_id = payload.cloudinary_public_id;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "ai_extraction")) {
    patch.ai_extraction = payload.ai_extraction;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "slug")) {
    patch.slug = payload.slug;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "ingredients")) {
    patch.ingredients = parseToArray(payload.ingredients);
  }

  if (Object.prototype.hasOwnProperty.call(payload, "benefits")) {
    patch.benefits = parseToArray(payload.benefits);
  }

  if (Object.prototype.hasOwnProperty.call(payload, "skin_type")) {
    patch.skin_type = parseToArray(payload.skin_type);
  }

  if (Object.prototype.hasOwnProperty.call(payload, "product_type")) {
    patch.product_type = payload.product_type;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "tags")) {
    patch.tags = parseToArray(payload.tags);
  }

  if (Object.prototype.hasOwnProperty.call(payload, "seo_title")) {
    patch.seo_title = payload.seo_title;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "seo_description")) {
    patch.seo_description = payload.seo_description;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "seo_keywords")) {
    patch.seo_keywords = Array.isArray(payload.seo_keywords) ? payload.seo_keywords.map(k => String(k)) : [];
  }

  if (Object.prototype.hasOwnProperty.call(payload, "discount_percent")) {
    patch.discount_percent = payload.discount_percent !== null ? Number(payload.discount_percent) : null;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "variant")) {
    patch.variant = payload.variant;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "weight")) {
    patch.weight = payload.weight;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "ai_confidence")) {
    patch.ai_confidence = payload.ai_confidence !== null ? Number(payload.ai_confidence) : null;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "status")) {
    patch.status = payload.status;
  }

  return patch;
}

export async function GET() {
  try {
    if (!hasSupabaseConfig()) {
      const localProducts = readLocalProducts();
      return NextResponse.json({ products: localProducts });
    }

    try {
      const supabase = getSupabaseServerClient();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("[Products Route] Supabase products query failed, falling back to local storage:", error.message);
        const localProducts = readLocalProducts();
        return NextResponse.json({ products: localProducts });
      }

      if (data && data.length > 0) {
        return NextResponse.json({ products: data });
      }
    } catch (dbErr) {
      console.warn("[Products Route] Supabase connection failed, falling back to local storage:", dbErr);
    }

    const localProducts = readLocalProducts();
    return NextResponse.json({ products: localProducts });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = requireAdminApiKey(request);
  if (authError) return authError;

  try {
    const payload = await request.json();
    const livePayload = toLiveProductPayload(payload);

    if (hasSupabaseConfig()) {
      try {
        const supabase = getSupabaseServerClient();
        const { data, error } = await supabase
          .from("products")
          .insert(livePayload)
          .select("*")
          .single();

        if (!error && data) {
          return NextResponse.json({ product: data });
        }
        console.warn("[Products Route] Supabase products insert failed, falling back to local storage:", error?.message);
      } catch (dbErr) {
        console.warn("[Products Route] Supabase connection failed during insert, falling back to local storage:", dbErr);
      }
    }

    const localProducts = readLocalProducts();
    localProducts.unshift(livePayload);
    writeLocalProducts(localProducts);
    return NextResponse.json({ product: livePayload });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const authError = requireAdminApiKey(request);
  if (authError) return authError;

  try {
    const payload = await request.json();
    const { id, ...updates } = payload;

    if (!id) {
      return NextResponse.json({ error: "Product id is required" }, { status: 400 });
    }

    const liveUpdates = toLiveProductPatch(updates);

    if (hasSupabaseConfig()) {
      try {
        const supabase = getSupabaseServerClient();
        const { data, error } = await supabase
          .from("products")
          .update(liveUpdates)
          .eq("id", id)
          .select("*")
          .single();

        if (!error && data) {
          return NextResponse.json({ product: data });
        }
        console.warn("[Products Route] Supabase products update failed, falling back to local storage:", error?.message);
      } catch (dbErr) {
        console.warn("[Products Route] Supabase connection failed during update, falling back to local storage:", dbErr);
      }
    }

    const localProducts = readLocalProducts();
    const idx = localProducts.findIndex((p) => p.id === id);
    if (idx === -1) {
      const newProduct = toLiveProductPayload({ id, ...updates });
      localProducts.unshift(newProduct);
      writeLocalProducts(localProducts);
      return NextResponse.json({ product: newProduct });
    }
    localProducts[idx] = { ...localProducts[idx], ...liveUpdates };
    writeLocalProducts(localProducts);
    return NextResponse.json({ product: localProducts[idx] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authError = requireAdminApiKey(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product id is required" }, { status: 400 });
    }

    if (hasSupabaseConfig()) {
      try {
        const supabase = getSupabaseServerClient();
        const { error } = await supabase
          .from("products")
          .delete()
          .eq("id", id);

        if (!error) {
          const localProducts = readLocalProducts();
          const updated = localProducts.filter((p) => p.id !== id);
          writeLocalProducts(updated);
          return NextResponse.json({ success: true });
        }
        console.warn("[Products Route] Supabase products delete failed, falling back to local storage:", error?.message);
      } catch (dbErr) {
        console.warn("[Products Route] Supabase connection failed during delete, falling back to local storage:", dbErr);
      }
    }

    const localProducts = readLocalProducts();
    const updated = localProducts.filter((p) => p.id !== id);
    writeLocalProducts(updated);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

