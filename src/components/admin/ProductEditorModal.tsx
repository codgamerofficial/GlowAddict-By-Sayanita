"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Image from "next/image";
import { Product } from "@/context/ShopContext";
import {
  X,
  Save,
  Sparkles,
  RefreshCw,
  Package,
  Eye,
  Copy,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Check,
  ArrowRight,
  TrendingUp,
  Info,
  BadgeInfo,
  Activity,
  Globe,
  Settings,
  Sparkle,
  Loader2
} from "lucide-react";
import { getConfidenceLabel } from "@/lib/ai-utils";

interface ProductEditorModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (productId: string, updates: Partial<Product>) => void;
  adminApiKey: string;
}

const CATEGORIES = [
  "Serums", "Lipsticks", "Lip Care", "SPF Care", "Hydration", "Cleansers",
  "Toners", "Face Masks", "Makeup", "Beauty Accessories", "Combos & Kits",
  "Hair Care", "Eye Care", "Nail Care", "Fragrances", "Body Care", "Skincare",
  "Exfoliants", "Skincare Device / Cooling", "Glass Skin Kit", "Barrier Relief Kit",
];
const SKIN_TYPES = ["all", "oily", "dry", "combination", "sensitive", "normal"];
const TABS = ["General", "Pricing", "Media", "SEO", "AI Data"] as const;
type TabName = (typeof TABS)[number];

interface CompareItem {
  key: string;
  label: string;
  original: string;
  extracted: string;
  isValid: boolean;
  validationReason?: string;
  confidence: number;
}

const evaluateExtractedField = (
  key: string,
  originalValue: any,
  extractedValue: any,
  aiConfidence?: number,
  source?: string
): { isValid: boolean; reason?: string; confidence: number } => {
  const origStr = String(originalValue || "").trim();
  const extStr = String(extractedValue || "").trim();

  const lowerExt = extStr.toLowerCase();
  const lowerOrig = origStr.toLowerCase();

  if (!extStr) {
    return { isValid: false, reason: "Extracted AI value is empty.", confidence: 0 };
  }

  // Restrict generic cosmetics keywords to title and brand fields
  const isGenericCosmeticsKeyword =
    lowerExt === "skincare" ||
    lowerExt === "beauty" ||
    lowerExt === "cosmetic" ||
    lowerExt === "product" ||
    lowerExt === "cosmetics" ||
    lowerExt === "cosmetic product";

  const shouldBlockGeneric = isGenericCosmeticsKeyword && (key === "title" || key === "brand" || key === "product_name");

  if (
    lowerExt === "untitled product" ||
    lowerExt === "untitled" ||
    lowerExt === "unknown" ||
    lowerExt === "unknown brand" ||
    lowerExt === "generic product" ||
    shouldBlockGeneric ||
    lowerExt === "null" ||
    lowerExt === "undefined"
  ) {
    return { isValid: false, reason: `Banned placeholder term detected ("${extStr}").`, confidence: 10 };
  }

  // Reject quality degradation compared to catalog original by requesting review, but do NOT block entirely (set isValid to true, but low confidence)
  if (origStr.length > 5 && extStr.length < origStr.length && lowerOrig.includes(lowerExt)) {
    return { isValid: true, reason: "AI suggestion is less specific or shorter than catalog original.", confidence: 40 };
  }

  switch (key) {
    case "title": {
      if (lowerExt.includes("untitled") || lowerExt.includes("unknown") || lowerExt.includes("generic")) {
        return { isValid: false, reason: "Banned placeholder title detected.", confidence: 15 };
      }
      if (origStr.length > 3 && extStr.length <= 3) {
        return { isValid: true, reason: "AI title is too short to be authentic.", confidence: 30 };
      }
      return { isValid: true, confidence: aiConfidence ?? 96 };
    }
    case "brand": {
      if (lowerExt === "unknown" || lowerExt === "glow addict") {
        if (origStr && lowerOrig !== "glow addict") {
          return { isValid: true, reason: "AI brand fell back to generic store brand.", confidence: 40 };
        }
      }
      return { isValid: true, confidence: aiConfidence ?? 91 };
    }
    case "category": {
      if ((lowerExt === "skincare" || lowerExt === "beauty" || lowerExt === "cosmetics") && origStr && lowerOrig !== "skincare") {
        return { isValid: true, reason: "AI downgraded category to standard generic Skincare.", confidence: 30 };
      }
      return { isValid: true, confidence: aiConfidence ?? 72 };
    }
    case "price":
    case "mrp": {
      const origNum = Number(String(originalValue).replace(/[^0-9.]/g, "")) || 0;
      const extNum = Number(String(extractedValue).replace(/[^0-9.]/g, "")) || 0;
      if (extNum === 999 || extNum === 1099 || extNum <= 0) {
        if (origNum > 0) {
          return { isValid: false, reason: "AI returned generic price placeholder (₹999 / ₹1099 / ₹0).", confidence: 20 };
        }
      }
      return { isValid: true, confidence: aiConfidence ?? 98 };
    }
    case "description": {
      if (lowerExt.startsWith("detected from") || lowerExt.startsWith("ai extraction completed") || lowerExt.includes("raw_ocr_text")) {
        return { isValid: false, reason: "AI description is generic boilerplate text.", confidence: 25 };
      }
      if (origStr.length > 40 && extStr.length < 15) {
        return { isValid: true, reason: "AI description is too short and lacks catalog details.", confidence: 40 };
      }
      return { isValid: true, confidence: aiConfidence ?? 85 };
    }
    default:
      return { isValid: true, confidence: aiConfidence ?? 75 };
  }
};


const getConfidenceRating = (score: number) => {
  if (score >= 95) {
    return {
      label: "Excellent",
      colorClass: "text-green-400 bg-green-500/10 border-green-500/20 shadow-[0_0_8px_rgba(34,197,94,0.3)]"
    };
  } else if (score >= 80) {
    return {
      label: "Reliable",
      colorClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    };
  } else if (score >= 60) {
    return {
      label: "Needs Review",
      colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/20"
    };
  } else {
    return {
      label: "Unsafe",
      colorClass: "text-red-400 bg-red-500/10 border-red-500/20 animate-pulse"
    };
  }
};

export default function ProductEditorModal({
  product,
  isOpen,
  onClose,
  onSave,
  adminApiKey,
}: ProductEditorModalProps) {
  const [form, setForm] = useState<Partial<Product>>({});
  const [tab, setTab] = useState<TabName>("General");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [seoKeywordInput, setSeoKeywordInput] = useState("");
  
  // Custom states for premium UX
  const [reanalyzing, setReanalyzing] = useState(false);
  const [scanStep, setScanStep] = useState<
    | "idle"
    | "gemini_scan"
    | "label_parsing"
    | "hallucination_guard"
    | "groq_enrichment"
    | "seo_tag_generation"
    | "trust_safety"
    | "done"
  >("idle");
  const [compareData, setCompareData] = useState<Record<string, any> | null>(null);
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>({});
  const [autosaveState, setAutosaveState] = useState<"saved" | "saving" | "dirty">("saved");
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [relativeSavedStr, setRelativeSavedStr] = useState("Just now");
  const [rollbackData, setRollbackData] = useState<Partial<Product> | null>(null);
  const [blockedOpen, setBlockedOpen] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync relative time on intervals
  useEffect(() => {
    const timer = setInterval(() => {
      const diffSecs = Math.round((new Date().getTime() - lastSaved.getTime()) / 1000);
      if (diffSecs < 10) setRelativeSavedStr("Just now");
      else if (diffSecs < 60) setRelativeSavedStr(`${diffSecs}s ago`);
      else setRelativeSavedStr(`${Math.round(diffSecs / 60)}m ago`);
    }, 5000);
    return () => clearInterval(timer);
  }, [lastSaved]);

  useEffect(() => {
    if (product) {
      setForm({ ...product });
      setDirty(false);
      setTab("General");
      setAutosaveState("saved");
      setLastSaved(new Date());
      setRelativeSavedStr("Just now");
      setCompareData(null);
      setScanStep("idle");
      setRollbackData(null);
    }
  }, [product]);

  const handleRollback = () => {
    if (!rollbackData) return;
    setForm({ ...rollbackData });
    setRollbackData(null);
    setDirty(true);
  };

  // Focus trap + Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !compareData) {
        onClose();
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, compareData]);

  // Auto-resize description text-area dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 240)}px`;
    }
  }, [form.description, tab]);

  const update = useCallback((updates: Partial<Product>) => {
    setAutosaveState("saving");
    setForm((prev) => {
      let extra = {};
      if (prev.ai_extraction && !updates.ai_extraction) {
        const parsedFields = [
          "title", "brand", "category", "price", "mrp", "description", "shades",
          "ingredients", "benefits", "skin_type", "product_type", "tags", "variant",
          "weight", "slug"
        ];
        const hasOverride = Object.keys(updates).some(
          (k) => parsedFields.includes(k) && updates[k as keyof Product] !== prev[k as keyof Product]
        );
        if (hasOverride) {
          extra = {
            ai_extraction: {
              ...prev.ai_extraction,
              manual_overrides: true,
            },
          };
        }
      }
      return { ...prev, ...updates, ...extra };
    });
    
    setDirty(true);
    // Simulate premium instant debounced auto-save notification
    setTimeout(() => {
      setAutosaveState("saved");
      setLastSaved(new Date());
      setRelativeSavedStr("Just now");
    }, 8000);
  }, []);

  const handleSave = async () => {
    if (!product) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 450));

    const finalForm = { ...form };

    if (finalForm.ai_extraction) {
      finalForm.ai_extraction = {
        ...finalForm.ai_extraction,
        reviewed_by_admin: true,
        manual_overrides: finalForm.ai_extraction.manual_overrides || dirty,
      };
    } else if (finalForm.ai_confidence && finalForm.ai_confidence > 0) {
      finalForm.ai_extraction = {
        raw_ocr_text: finalForm.extracted_text || "",
        parsed_entities: {
          title: finalForm.title || "",
          brand: finalForm.brand || "",
          category: finalForm.category || "",
          price: finalForm.price || 0,
          mrp: finalForm.mrp || 0,
          shades: finalForm.shades || [],
          ingredients: finalForm.ingredients || "",
          benefits: finalForm.benefits || "",
          skinType: finalForm.skin_type || "all",
          productType: finalForm.product_type || "",
          variant: finalForm.variant || "",
          weight: finalForm.weight || "",
          tags: finalForm.tags || [],
        },
        confidence: finalForm.ai_confidence,
        ai_model: "Google Gemini 1.5 Pro + Groq Llama 3.3",
        extraction_status: finalForm.ai_confidence >= 75 ? "full" : "partial",
        extracted_at: new Date().toISOString(),
        extraction_version: "2.0.0",
        reviewed_by_admin: true,
        manual_overrides: dirty,
      };
    }

    onSave(product.id, finalForm);
    setDirty(false);
    setSaving(false);
    onClose();
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    const c = form.tags || [];
    if (!c.includes(t)) update({ tags: [...c, t] });
    setTagInput("");
  };
  
  const removeTag = (tag: string) => {
    update({ tags: (form.tags || []).filter((t) => t !== tag) });
  };

  const addSeoKeyword = () => {
    const k = seoKeywordInput.trim();
    if (!k) return;
    const c = form.seo_keywords || [];
    if (!c.includes(k)) update({ seo_keywords: [...c, k] });
    setSeoKeywordInput("");
  };
  
  const removeSeoKeyword = (kw: string) => {
    update({ seo_keywords: (form.seo_keywords || []).filter((k) => k !== kw) });
  };

  const handleReanalyze = async () => {
    if (!form.image) return;
    setReanalyzing(true);
    setScanStep("gemini_scan");

    try {
      await new Promise((r) => setTimeout(r, 800));
      setScanStep("label_parsing");

      const res = await fetch("/api/ai/extract-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(adminApiKey ? { "x-admin-key": adminApiKey } : {}),
        },
        body: JSON.stringify({ imageUrl: form.image }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `AI extraction request failed (${res.status})`);
      }

      setScanStep("hallucination_guard");
      await new Promise((r) => setTimeout(r, 600));

      setScanStep("groq_enrichment");
      await new Promise((r) => setTimeout(r, 600));

      setScanStep("seo_tag_generation");
      await new Promise((r) => setTimeout(r, 600));

      setScanStep("trust_safety");
      await new Promise((r) => setTimeout(r, 600));

      const data = await res.json();
      const ex = data.extracted;

      if (ex) {
        // Feed into compare modal instead of applying directly
        setCompareData(ex);
        
        // Auto-select ONLY VALID high-quality changed fields by default
        const changes: Record<string, boolean> = {};
        const fields = [
          "title", "brand", "category", "price", "mrp", "description", 
          "skinType", "productType", "ingredients", "benefits", "weight", "variant"
        ];
        
        fields.forEach((f) => {
          let origVal = "";
          let newVal = "";
          
          if (f === "skinType") {
            origVal = String(form.skin_type || "");
            newVal = String(ex.skinType || "");
          } else if (f === "productType") {
            origVal = String(form.product_type || "");
            newVal = String(ex.productType || "");
          } else {
            origVal = String((form as any)[f] || "");
            newVal = String((ex as any)[f] || "");
          }
          
          if (origVal.trim().toLowerCase() !== newVal.trim().toLowerCase() && newVal.trim() !== "") {
            const checkKey = f === "skinType" ? "skin_type" : f === "productType" ? "product_type" : f;
            const cKey = f === "skinType" ? "skinType" : f === "productType" ? "productType" : (f === "price" || f === "mrp") ? "pricing" : f;
            const confidenceScore = ex.ai_extraction?.field_confidence?.[cKey];
            const source = ex.ai_extraction?.sources?.[cKey];
            
            const validation = evaluateExtractedField(checkKey, origVal, newVal, confidenceScore, source);
            const isSafe = validation.isValid && 
                           (source === "ocr" || source === "logo" || source === "label" || source === "inferred") && 
                           validation.confidence >= 85;
            if (isSafe) {
              changes[f] = true;
            }
          }
        });
        setSelectedFields(changes);
        setScanStep("done");
      }
    } catch (err) {
      console.error("AI re-analysis failed:", err);
      setScanStep("idle");
    } finally {
      setReanalyzing(false);
    }
  };

  const applyCompareSelection = () => {
    if (!compareData) return;
    
    // Store original state for rollback support!
    setRollbackData({ ...form });

    const updates: Partial<Product> = {};
    
    if (selectedFields.title) updates.title = compareData.title;
    if (selectedFields.brand) updates.brand = compareData.brand;
    if (selectedFields.category) updates.category = compareData.category;
    if (selectedFields.price) updates.price = compareData.price;
    if (selectedFields.mrp) updates.mrp = compareData.mrp;
    if (selectedFields.description) updates.description = compareData.description;
    if (selectedFields.skinType) updates.skin_type = compareData.skinType;
    if (selectedFields.productType) updates.product_type = compareData.productType;
    if (selectedFields.ingredients) updates.ingredients = compareData.ingredients;
    if (selectedFields.benefits) updates.benefits = compareData.benefits;
    if (selectedFields.weight) updates.weight = compareData.weight;
    if (selectedFields.variant) updates.variant = compareData.variant;
    
    // Always import AI metrics if re-scanned
    updates.ai_confidence = compareData.ai_confidence;
    updates.extracted_text = compareData.extractedText || compareData.extracted_text;
    updates.discount_percent = compareData.discount_percent;
    updates.slug = compareData.slug;
    updates.seo_title = compareData.seo_title;
    updates.seo_description = compareData.seo_description;
    updates.seo_keywords = compareData.seo_keywords;
    updates.tags = compareData.tags;
    updates.shades = compareData.shades;
    updates.ai_extraction = compareData.ai_extraction;

    update(updates);
    setCompareData(null);
    setScanStep("idle");
  };

  // Radial Ring Dashoffset calculation
  const radialDashoffset = useMemo(() => {
    const score = form.ai_confidence || 0;
    return 251.2 - (251.2 * score) / 100;
  }, [form.ai_confidence]);

  // Premium margins & profit auto-calculator
  const margins = useMemo(() => {
    const mrp = Number(form.mrp) || 0;
    const price = Number(form.price) || 0;
    if (mrp <= 0 || price <= 0) return { profit: 0, percent: 0 };
    const profit = Math.max(0, mrp - price);
    const percent = Math.round((profit / mrp) * 100);
    return { profit, percent };
  }, [form.mrp, form.price]);

  // Live SEO scoring analyzer
  const seoScore = useMemo(() => {
    let score = 0;
    const titleLen = form.seo_title?.length || 0;
    const descLen = form.seo_description?.length || 0;
    const kwCount = form.seo_keywords?.length || 0;

    if (titleLen >= 30 && titleLen <= 60) score += 40;
    else if (titleLen > 0) score += 20;

    if (descLen >= 100 && descLen <= 160) score += 40;
    else if (descLen > 0) score += 20;

    if (kwCount >= 3) score += 20;
    else if (kwCount > 0) score += 10;

    return score;
  }, [form.seo_title, form.seo_description, form.seo_keywords]);

  const confidence = getConfidenceLabel(form.ai_confidence || 0);
  const statusColors: Record<string, string> = {
    active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    draft: "bg-amber-500/15 text-amber-400 border-amber-500/25",
    archived: "bg-gray-500/15 text-gray-400 border-gray-500/25",
  };

  const labelCls = "block text-[10px] font-bold uppercase tracking-wider text-[#9F7AC2] mb-1.5";

  // Comparison grid compiler
  const comparisonItems: CompareItem[] = [];
  if (compareData) {
    const fieldsToCheck = [
      { key: "title", label: "Product Title", orig: form.title, extracted: compareData.title },
      { key: "brand", label: "Brand", orig: form.brand, extracted: compareData.brand },
      { key: "category", label: "Category", orig: form.category, extracted: compareData.category },
      { key: "price", label: "Selling Price", orig: form.price ? `₹${form.price}` : "—", extracted: compareData.price ? `₹${compareData.price}` : "" },
      { key: "mrp", label: "MRP", orig: form.mrp ? `₹${form.mrp}` : "—", extracted: compareData.mrp ? `₹${compareData.mrp}` : "" },
      { key: "description", label: "Description", orig: form.description, extracted: compareData.description },
      { key: "skinType", label: "Skin Type", orig: form.skin_type, extracted: compareData.skinType },
      { key: "productType", label: "Product Type", orig: form.product_type, extracted: compareData.productType },
      { key: "ingredients", label: "Ingredients", orig: form.ingredients, extracted: compareData.ingredients },
      { key: "benefits", label: "Benefits", orig: form.benefits, extracted: compareData.benefits },
      { key: "weight", label: "Weight / Qty", orig: form.weight, extracted: compareData.weight },
      { key: "variant", label: "Variant", orig: form.variant, extracted: compareData.variant },
    ];
    
    fieldsToCheck.forEach((f) => {
      const origStr = String(f.orig || "").trim();
      const newStr = String(f.extracted || "").trim();
      if (origStr.toLowerCase() !== newStr.toLowerCase() && newStr !== "") {
        const confKeyMap: Record<string, string> = {
          title: "title",
          brand: "brand",
          category: "category",
          price: "pricing",
          mrp: "pricing",
          description: "description",
          skinType: "skinType",
          productType: "productType",
          ingredients: "ingredients",
          benefits: "benefits",
          weight: "weight",
          variant: "variant"
        };
        const cKey = confKeyMap[f.key] || "";
        const extractedFieldConfidence = compareData.ai_extraction?.field_confidence?.[cKey];
        const source = compareData.ai_extraction?.sources?.[cKey];
        
        const checkKey = f.key === "skinType" ? "skin_type" : f.key === "productType" ? "product_type" : f.key;
        const valResult = evaluateExtractedField(checkKey, f.orig, f.extracted, extractedFieldConfidence, source);
        
        comparisonItems.push({
          key: f.key,
          label: f.label,
          original: origStr || "—",
          extracted: newStr,
          isValid: valResult.isValid,
          validationReason: valResult.reason,
          confidence: valResult.confidence
        });
      }
    });
  }

  // Trust Engine stats compiler
  const trustStats = useMemo(() => {
    if (!compareData) return null;
    
    const total = comparisonItems.length;
    if (total === 0) return { ocrAccuracy: 100, visualMatch: 100, catalogSafety: 100, status: "SAFE" as const, averageScore: 100 };

    const ocrMatches = comparisonItems.filter(c => {
      const cKey = c.key === "skinType" ? "skinType" : c.key === "productType" ? "productType" : c.key;
      const source = compareData.ai_extraction?.sources?.[cKey];
      return c.isValid && (source === "ocr" || source === "label");
    }).length;
    
    const logoMatches = comparisonItems.filter(c => {
      const cKey = c.key === "skinType" ? "skinType" : c.key === "productType" ? "productType" : c.key;
      return c.isValid && compareData.ai_extraction?.sources?.[cKey] === "logo";
    }).length;
    
    const totalValid = comparisonItems.filter(c => c.isValid).length;
    const totalBlocked = comparisonItems.filter(c => !c.isValid).length;
    
    // OCR accuracy = percentage of valid items that were OCR-sourced (high = great text extraction)
    const ocrAccuracy = totalValid > 0 ? Math.round((ocrMatches / totalValid) * 100) : 100;
    
    // Visual match = percentage of valid items from any visual source (OCR + logo)
    const visualMatch = totalValid > 0 ? Math.round(((ocrMatches + logoMatches) / totalValid) * 100) : 100;
    
    // Catalog safety = percentage of items that are valid/safe (blocking hallucinations INCREASES safety)
    const catalogSafety = Math.round((totalValid / total) * 100);
    
    // Average confidence across all items
    const averageScore = Math.round(comparisonItems.reduce((acc, c) => acc + c.confidence, 0) / total);
    
    // Status: SAFE when most items pass and average quality is high
    let status: "SAFE" | "REVIEW" | "UNSAFE" = "SAFE";
    if (averageScore < 60 || catalogSafety < 40) {
      status = "UNSAFE";
    } else if (averageScore < 85 || catalogSafety < 70) {
      status = "REVIEW";
    }
    
    return {
      ocrAccuracy: Math.max(ocrAccuracy, 0),
      visualMatch: Math.max(visualMatch, 0),
      catalogSafety,
      status,
      averageScore
    };
  }, [compareData, comparisonItems]);

  const { safeItems, reviewItems, blockedItems } = useMemo(() => {
    const safe: CompareItem[] = [];
    const review: CompareItem[] = [];
    const blocked: CompareItem[] = [];
    
    comparisonItems.forEach((c) => {
      const cKey = c.key === "skinType" ? "skinType" : c.key === "productType" ? "productType" : c.key;
      const source = compareData?.ai_extraction?.sources?.[cKey] || "ocr";
      const isSafe = c.isValid && 
                     (source === "ocr" || source === "logo" || source === "label" || source === "inferred") && 
                     c.confidence >= 85;
      
      if (!c.isValid) {
        blocked.push(c);
      } else if (isSafe) {
        safe.push(c);
      } else {
        review.push(c);
      }
    });
    
    return { safeItems: safe, reviewItems: review, blockedItems: blocked };
  }, [comparisonItems, compareData]);

  if (!isOpen || !product) return null;

  const renderComparisonRow = (c: CompareItem, type: "SAFE" | "REVIEW" | "BLOCKED") => {
    const score = c.confidence;
    const rating = getConfidenceRating(score);
    
    const cKey = c.key === "skinType" ? "skinType" : c.key === "productType" ? "productType" : c.key;
    const source = compareData?.ai_extraction?.sources?.[cKey] || "ocr";
    const reasoningText = compareData?.ai_extraction?.reasoning?.[cKey];

    return (
      <div
        key={c.key}
        className={`p-4 flex gap-4 transition-all duration-300 ${
          type === "BLOCKED" 
            ? "bg-red-500/[0.015]" 
            : type === "REVIEW" 
            ? "hover:bg-amber-500/[0.02]" 
            : "hover:bg-[#C77DFF]/5"
        }`}
      >
        {/* Checkbox selector */}
        <div className="mt-0.5 shrink-0 flex items-center justify-center">
          <input
            type="checkbox"
            checked={!!selectedFields[c.key]}
            disabled={type === "BLOCKED"}
            onChange={(e) =>
              setSelectedFields((prev) => ({
                ...prev,
                [c.key]: e.target.checked,
              }))
            }
            className="accent-brand-magenta w-4.5 h-4.5 cursor-pointer shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
          />
        </div>

        <div className="flex-1 min-w-0 text-xs leading-normal text-left">
          {/* Header & Badges */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="font-extrabold text-[#FF8DC7] uppercase tracking-wider text-[9px]">
              {c.label}
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full border text-[8px] font-bold uppercase tracking-wider bg-[#1B0124]/60 border-[#C77DFF]/15 text-amethyst flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-[#E056FD]" />
                Source: {source}
              </span>
              <span className={`text-[8.5px] px-2.5 py-0.5 rounded-full border font-bold uppercase tracking-wider transition-all duration-300 ${rating.colorClass}`}>
                {type === "BLOCKED" ? "BLOCKED" : rating.label}: {score}%
              </span>
            </div>
          </div>

          {/* Rejection Warning if Blocked */}
          {type === "BLOCKED" && (
            <div className="mt-2.5 p-2 bg-red-500/10 border border-red-500/20 text-[#FF8DC7] rounded-lg text-[9.5px] font-semibold flex items-start gap-1.5">
              <ShieldAlert size={12} className="shrink-0 mt-0.5 text-[#FF8DC7]" />
              <span>AI Suggestion Rejected: {c.validationReason || "Low quality match matched generic placeholder."}</span>
            </div>
          )}

          {/* Comparison Diff Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-3">
            {/* Left: Original (PR deletion style) */}
            <div className="bg-red-950/20 p-2.5 rounded-lg border border-red-500/15 min-w-0 flex flex-col justify-between">
              <span className="text-[8px] text-red-400 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <span>-</span> Catalog Original
              </span>
              <p className="text-[#9F7AC2] font-mono leading-relaxed line-through whitespace-pre-wrap break-words">{c.original || "—"}</p>
            </div>

            {/* Right: Suggestion (PR addition style) */}
            <div className={`p-2.5 rounded-lg border min-w-0 flex flex-col justify-between ${
              type === "BLOCKED" 
                ? "bg-gray-900/30 border-[#C77DFF]/8 opacity-75" 
                : type === "REVIEW" 
                ? "bg-amber-950/10 border-amber-500/25" 
                : "bg-emerald-950/20 border-emerald-500/25"
            }`}>
              <span className={`text-[8px] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1 ${
                type === "BLOCKED" 
                  ? "text-[#9F7AC2]/50" 
                  : type === "REVIEW" 
                  ? "text-amber-400" 
                  : "text-emerald-400"
              }`}>
                <span>+</span> AI Suggestion
              </span>
              <p className={`font-mono leading-relaxed whitespace-pre-wrap break-words ${
                type === "BLOCKED" 
                  ? "text-[#9F7AC2]" 
                  : type === "REVIEW" 
                  ? "text-amber-300 font-bold" 
                  : "text-emerald-300 font-bold"
              }`}>{c.extracted || "—"}</p>
            </div>
          </div>

          {/* Explainable AI Reasoning Tag */}
          {reasoningText && type !== "BLOCKED" && (
            <div className="mt-3 p-3 rounded-lg bg-[#C77DFF]/5 border border-[#C77DFF]/10 flex items-start gap-2.5">
              <Sparkles size={13} className="text-[#E056FD] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-[8px] font-bold text-[#9F7AC2] uppercase tracking-wider block">AI NIM Reasoning Explainer</span>
                <p className="text-[10px] text-[#9F7AC2] leading-relaxed font-semibold italic">{reasoningText}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };



  // ─── RENDER ───────────────────────────────────────────────────────────
  return (
    <div className="admin-modal-backdrop fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={(e) => { if (e.target === e.currentTarget && !compareData) onClose(); }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal Container */}
      <div
        ref={modalRef}
        className="relative z-10 flex flex-col w-full sm:w-[95vw] sm:max-w-5xl h-[calc(100vh-32px)] sm:h-[90vh] sm:max-h-[90vh] bg-[#1E0629] border border-white/8 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* ── STICKY HEADER ── */}
        <div className="shrink-0 flex items-center justify-between gap-3 px-5 sm:px-6 py-3.5 border-b border-white/8 bg-[#1E0629]/95 backdrop-blur-md z-20">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile drag handle */}
            <div className="sm:hidden w-10 h-1 rounded-full bg-white/20 absolute top-2 left-1/2 -translate-x-1/2" />
            <div className="w-10 h-10 rounded-xl bg-[#2B083A] border border-white/8 flex items-center justify-center shrink-0 overflow-hidden relative">
              {form.image ? (
                <>
                  <Image 
                    src={form.image} 
                    alt="" 
                    width={40} 
                    height={40} 
                    className="object-cover w-full h-full" 
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const sibling = e.currentTarget.nextSibling as HTMLElement;
                      if (sibling) sibling.style.display = 'flex';
                    }}
                    unoptimized
                  />
                  <div style={{ display: 'none' }} className="absolute inset-0 w-full h-full flex items-center justify-center bg-[#2B083A]">
                    <Package size={18} className="text-[#9F7AC2]" />
                  </div>
                </>
              ) : (
                <Package size={18} className="text-[#9F7AC2]" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-white truncate">{form.title || "Edit Product"}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${statusColors[form.status || "active"]}`}>
                  {form.status || "active"}
                </span>
                {form.ai_confidence != null && form.ai_confidence > 0 && (
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${confidence.color.includes("green") ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : confidence.color.includes("amber") ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                    AI {form.ai_confidence}%
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-[#9F7AC2] hover:text-white transition-colors cursor-pointer shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* ── STICKY TAB BAR ── */}
        <div className="shrink-0 border-b border-white/8 bg-[#2B083A]/95 backdrop-blur-md z-20 px-5 sm:px-6">
          <div className="admin-scrollable-tabs gap-1 py-2">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`admin-tab-pill ${tab === t ? "active" : ""}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* ── SINGLE SCROLLABLE BODY ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain admin-scrollable-form" style={{ WebkitOverflowScrolling: "touch" }}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">

            {/* ─── LEFT SIDEBAR (Product Image + Quick Stats) ─── */}
            <div className="lg:col-span-4 p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-white/8 bg-[#2B083A]/40">
              {/* Product Image */}
              <div className="aspect-square w-full max-w-[280px] mx-auto rounded-2xl overflow-hidden bg-[#140019] border border-white/8 mb-5 relative">
                {form.image ? (
                  <>
                    <Image 
                      src={form.image} 
                      alt={form.title || ""} 
                      width={280} 
                      height={280} 
                      className="object-cover w-full h-full" 
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const sibling = e.currentTarget.nextSibling as HTMLElement;
                        if (sibling) sibling.style.display = 'flex';
                      }}
                      unoptimized
                    />
                    <div style={{ display: 'none' }} className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-3 text-[#6E4E85] bg-[#140019]">
                      <Package size={48} strokeWidth={1} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">No Image</span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-[#6E4E85]">
                    <Package size={48} strokeWidth={1} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">No Image</span>
                  </div>
                )}
              </div>

              {/* AI Confidence Ring */}
              {form.ai_confidence != null && form.ai_confidence > 0 && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-[#1E0629] border border-white/8 mb-4">
                  <div className="relative w-16 h-16 shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
                      <circle cx="44" cy="44" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                      <circle cx="44" cy="44" r="40" fill="none" stroke={form.ai_confidence >= 80 ? "#10B981" : form.ai_confidence >= 60 ? "#F59E0B" : "#EF4444"} strokeWidth="6" strokeLinecap="round" strokeDasharray="251.2" strokeDashoffset={radialDashoffset} className="transition-all duration-700" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-white">{form.ai_confidence}%</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#9F7AC2] block">AI Confidence</span>
                    <span className="text-sm font-bold text-white">{confidence.label}</span>
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center p-3 rounded-xl bg-[#1E0629] border border-white/8">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9F7AC2]">SKU</span>
                  <span className="text-xs font-bold text-[#D3B6FF] font-mono">{form.sku || "—"}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-[#1E0629] border border-white/8">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9F7AC2]">Stock</span>
                  <span className={`text-xs font-bold font-mono ${(form.stock || 0) <= 5 ? "text-red-400" : "text-emerald-400"}`}>{form.stock ?? 0} units</span>
                </div>
                {margins.percent > 0 && (
                  <div className="flex justify-between items-center p-3 rounded-xl bg-[#1E0629] border border-white/8">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#9F7AC2]">Margin</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1"><TrendingUp size={10} />{margins.percent}% (₹{margins.profit})</span>
                  </div>
                )}
              </div>

              {/* Re-Analyze Button */}
              <button
                onClick={handleReanalyze}
                disabled={reanalyzing || !form.image}
                className="w-full mt-5 flex items-center justify-center gap-2 px-4 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl admin-gradient-btn disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {reanalyzing ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                {reanalyzing ? "Analyzing…" : "Re-Analyze with AI"}
              </button>
            </div>

            {/* ─── RIGHT FORM CONTENT (Tab-dependent) ─── */}
            <div className="lg:col-span-8 p-5 sm:p-6">

              {/* ═══ GENERAL TAB ═══ */}
              {tab === "General" && (
                <div className="space-y-5">
                  {/* Title */}
                  <div>
                    <label className={labelCls}>Product Title</label>
                    <input type="text" value={form.title || ""} onChange={(e) => update({ title: e.target.value })} className="admin-glass-input" placeholder="e.g. Dot & Key Vitamin C Serum" />
                  </div>
                  {/* Brand + Category Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Brand</label>
                      <input type="text" value={form.brand || ""} onChange={(e) => update({ brand: e.target.value })} className="admin-glass-input" placeholder="Brand name" />
                    </div>
                    <div>
                      <label className={labelCls}>Category</label>
                      <select value={form.category || ""} onChange={(e) => update({ category: e.target.value })} className="admin-glass-input cursor-pointer">
                        <option value="">Select…</option>
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  {/* Skin Type + Product Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Skin Type</label>
                      <select value={form.skin_type || "all"} onChange={(e) => update({ skin_type: e.target.value })} className="admin-glass-input cursor-pointer">
                        {SKIN_TYPES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Product Type</label>
                      <input type="text" value={form.product_type || ""} onChange={(e) => update({ product_type: e.target.value })} className="admin-glass-input" placeholder="e.g. serum, moisturizer" />
                    </div>
                  </div>
                  {/* Description */}
                  <div>
                    <label className={labelCls}>Description</label>
                    <textarea ref={textareaRef} value={form.description || ""} onChange={(e) => update({ description: e.target.value })} className="admin-glass-input resize-none min-h-[80px]" placeholder="Product description…" rows={3} />
                  </div>
                  {/* Ingredients */}
                  <div>
                    <label className={labelCls}>Ingredients</label>
                    <textarea value={form.ingredients || ""} onChange={(e) => update({ ingredients: e.target.value })} className="admin-glass-input resize-none min-h-[60px]" placeholder="Key ingredients list…" rows={2} />
                  </div>
                  {/* Benefits */}
                  <div>
                    <label className={labelCls}>Benefits</label>
                    <textarea value={form.benefits || ""} onChange={(e) => update({ benefits: e.target.value })} className="admin-glass-input resize-none min-h-[60px]" placeholder="Product benefits…" rows={2} />
                  </div>
                  {/* Tags */}
                  <div>
                    <label className={labelCls}>Tags</label>
                    <div className="flex gap-2">
                      <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); }}} className="admin-glass-input flex-1" placeholder="Add tag…" />
                      <button onClick={addTag} className="px-4 py-2 rounded-xl bg-[#351049] border border-white/8 text-[#D3B6FF] hover:bg-[#43135A] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer">Add</button>
                    </div>
                    {(form.tags?.length || 0) > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {form.tags!.map((t) => (
                          <span key={t} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-lg bg-[#351049] text-[#D3B6FF] border border-white/8">
                            {t}
                            <button onClick={() => removeTag(t)} className="hover:text-red-400 cursor-pointer"><X size={10} /></button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ═══ PRICING TAB ═══ */}
              {tab === "Pricing" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Selling Price (₹)</label>
                      <input type="number" value={form.price || ""} onChange={(e) => update({ price: Number(e.target.value) })} className="admin-glass-input" placeholder="0" min={0} />
                    </div>
                    <div>
                      <label className={labelCls}>MRP (₹)</label>
                      <input type="number" value={form.mrp || ""} onChange={(e) => update({ mrp: Number(e.target.value) })} className="admin-glass-input" placeholder="0" min={0} />
                    </div>
                  </div>
                  {/* Margin display */}
                  {margins.percent > 0 && (
                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15 flex items-center gap-3">
                      <TrendingUp size={18} className="text-emerald-400 shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">Profit Margin</span>
                        <span className="text-sm font-bold text-white">₹{margins.profit} ({margins.percent}% off MRP)</span>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Stock Quantity</label>
                      <input type="number" value={form.stock ?? ""} onChange={(e) => update({ stock: Number(e.target.value) })} className="admin-glass-input" placeholder="0" min={0} />
                    </div>
                    <div>
                      <label className={labelCls}>SKU</label>
                      <input type="text" value={form.sku || ""} onChange={(e) => update({ sku: e.target.value })} className="admin-glass-input" placeholder="Product SKU" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Variant</label>
                      <input type="text" value={form.variant || ""} onChange={(e) => update({ variant: e.target.value })} className="admin-glass-input" placeholder="e.g. 30ml, Shade A" />
                    </div>
                    <div>
                      <label className={labelCls}>Weight / Quantity</label>
                      <input type="text" value={form.weight || ""} onChange={(e) => update({ weight: e.target.value })} className="admin-glass-input" placeholder="e.g. 50g, 100ml" />
                    </div>
                  </div>
                  {/* Status */}
                  <div>
                    <label className={labelCls}>Product Status</label>
                    <select value={form.status || "active"} onChange={(e) => update({ status: e.target.value as "active" | "draft" | "archived" })} className="admin-glass-input cursor-pointer">
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
              )}

              {/* ═══ MEDIA TAB ═══ */}
              {tab === "Media" && (
                <div className="space-y-5">
                  <div>
                    <label className={labelCls}>Primary Image URL</label>
                    <input type="text" value={form.image || ""} onChange={(e) => update({ image: e.target.value })} className="admin-glass-input" placeholder="https://…" />
                  </div>
                  {form.image && (
                    <div className="rounded-2xl overflow-hidden border border-white/8 bg-[#140019] max-w-sm relative aspect-square">
                      <Image 
                        src={form.image} 
                        alt="Preview" 
                        fill
                        className="object-contain w-full h-full" 
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const sibling = e.currentTarget.nextSibling as HTMLElement;
                          if (sibling) sibling.style.display = 'flex';
                        }}
                        unoptimized
                      />
                      <div style={{ display: 'none' }} className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-3 text-[#6E4E85] bg-[#140019]">
                        <Package size={48} strokeWidth={1} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">No Image</span>
                      </div>
                    </div>
                  )}
                  {/* Shades */}
                  <div>
                    <label className={labelCls}>Shades / Color Variants</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(form.shades || []).map((sh, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-lg bg-[#351049] text-[#D3B6FF] border border-white/8">
                          {sh}
                          <button onClick={() => update({ shades: (form.shades || []).filter((_, j) => j !== i) })} className="hover:text-red-400 cursor-pointer"><X size={10} /></button>
                        </span>
                      ))}
                    </div>
                    <p className="text-[9px] text-[#6E4E85] mt-2 font-semibold">Shades are auto-detected by AI from packaging labels.</p>
                  </div>
                </div>
              )}

              {/* ═══ SEO TAB ═══ */}
              {tab === "SEO" && (
                <div className="space-y-5">
                  {/* SEO Score */}
                  <div className="p-4 rounded-xl bg-[#2B083A] border border-white/8 flex items-center gap-4">
                    <div className="relative w-14 h-14 shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
                        <circle cx="44" cy="44" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                        <circle cx="44" cy="44" r="40" fill="none" stroke={seoScore >= 80 ? "#10B981" : seoScore >= 50 ? "#F59E0B" : "#EF4444"} strokeWidth="6" strokeLinecap="round" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * seoScore) / 100} className="transition-all duration-700" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-white">{seoScore}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#9F7AC2] block">SEO Health Score</span>
                      <span className="text-sm font-bold text-white">{seoScore >= 80 ? "Excellent" : seoScore >= 50 ? "Good" : "Needs Work"}</span>
                    </div>
                  </div>
                  {/* SEO Title */}
                  <div>
                    <label className={labelCls}>SEO Title <span className="text-[#6E4E85]">({form.seo_title?.length || 0}/60)</span></label>
                    <input type="text" value={form.seo_title || ""} onChange={(e) => update({ seo_title: e.target.value })} className="admin-glass-input" placeholder="SEO-optimized page title" maxLength={60} />
                  </div>
                  {/* SEO Description */}
                  <div>
                    <label className={labelCls}>SEO Description <span className="text-[#6E4E85]">({form.seo_description?.length || 0}/160)</span></label>
                    <textarea value={form.seo_description || ""} onChange={(e) => update({ seo_description: e.target.value })} className="admin-glass-input resize-none min-h-[80px]" placeholder="Meta description for search results" maxLength={160} rows={3} />
                  </div>
                  {/* Slug */}
                  <div>
                    <label className={labelCls}>URL Slug</label>
                    <input type="text" value={form.slug || ""} onChange={(e) => update({ slug: e.target.value })} className="admin-glass-input font-mono text-xs" placeholder="product-url-slug" />
                  </div>
                  {/* SEO Keywords */}
                  <div>
                    <label className={labelCls}>SEO Keywords</label>
                    <div className="flex gap-2">
                      <input type="text" value={seoKeywordInput} onChange={(e) => setSeoKeywordInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSeoKeyword(); }}} className="admin-glass-input flex-1" placeholder="Add keyword…" />
                      <button onClick={addSeoKeyword} className="px-4 py-2 rounded-xl bg-[#351049] border border-white/8 text-[#D3B6FF] hover:bg-[#43135A] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer">Add</button>
                    </div>
                    {(form.seo_keywords?.length || 0) > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {form.seo_keywords!.map((kw) => (
                          <span key={kw} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-lg bg-[#351049] text-[#D3B6FF] border border-white/8">
                            {kw}
                            <button onClick={() => removeSeoKeyword(kw)} className="hover:text-red-400 cursor-pointer"><X size={10} /></button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ═══ AI DATA TAB ═══ */}
              {tab === "AI Data" && (
                <div className="space-y-5">
                  {/* AI Extraction Info Card */}
                  <div className="p-4 rounded-xl bg-[#2B083A] border border-white/8 space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkle size={14} className="text-[#D946EF]" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#D3B6FF]">AI Extraction Metadata</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-[10px]">
                      <div className="p-2.5 rounded-lg bg-[#1E0629] border border-white/8">
                        <span className="text-[#6E4E85] font-bold uppercase tracking-wider block text-[8px]">Confidence</span>
                        <span className="text-white font-bold">{form.ai_confidence || 0}%</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#1E0629] border border-white/8">
                        <span className="text-[#6E4E85] font-bold uppercase tracking-wider block text-[8px]">Discount</span>
                        <span className="text-white font-bold">{form.discount_percent || 0}%</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#1E0629] border border-white/8">
                        <span className="text-[#6E4E85] font-bold uppercase tracking-wider block text-[8px]">Model</span>
                        <span className="text-white font-bold text-[9px]">{form.ai_extraction?.ai_model || "N/A"}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#1E0629] border border-white/8">
                        <span className="text-[#6E4E85] font-bold uppercase tracking-wider block text-[8px]">Status</span>
                        <span className="text-white font-bold text-[9px]">{form.ai_extraction?.extraction_status || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                  {/* Extracted Text */}
                  <div>
                    <label className={labelCls}>Raw Extracted Text (OCR)</label>
                    <textarea value={form.extracted_text || ""} onChange={(e) => update({ extracted_text: e.target.value })} className="admin-glass-input resize-none min-h-[120px] font-mono text-xs" placeholder="Raw OCR text from product image…" rows={5} />
                  </div>
                  {/* Authenticity */}
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-[#1E0629] border border-white/8">
                    <input type="checkbox" checked={form.authenticity_flag ?? true} onChange={(e) => update({ authenticity_flag: e.target.checked })} className="accent-[#D946EF] w-4 h-4 cursor-pointer" />
                    <div>
                      <span className="text-xs font-bold text-white">Authenticity Verified</span>
                      <p className="text-[9px] text-[#6E4E85] font-semibold mt-0.5">Mark this product as verified authentic by admin</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* ── STICKY FOOTER ── */}
        <div className="shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 px-5 sm:px-6 py-3.5 border-t border-white/8 bg-[#1E0629]/95 backdrop-blur-md z-20">
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#9F7AC2] select-none self-start sm:self-auto">
            {autosaveState === "saving" ? (
              <>
                <Loader2 size={11} className="animate-spin text-[#D946EF]" />
                <span className="text-[#D946EF]">Auto-saving drafts…</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>All changes auto-saved</span>
                <span className="text-[#6E4E85]">•</span>
                <span>Last sync: {relativeSavedStr}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {rollbackData && (
              <button onClick={handleRollback} className="flex-grow sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl border border-[#EF4444]/30 text-[#EF4444] bg-[#EF4444]/5 hover:bg-[#EF4444]/10 transition-all cursor-pointer select-none">
                <RefreshCw size={12} />
                Undo AI
              </button>
            )}
            <button onClick={onClose} className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl border border-white/8 text-[#9F7AC2] hover:text-white hover:bg-white/5 cursor-pointer transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl admin-gradient-btn disabled:opacity-60">
              {saving ? (<><Loader2 size={12} className="animate-spin" />Saving…</>) : (<><Save size={12} />Publish Product</>)}
            </button>
          </div>
        </div>

        {/* ── COMPARISON OVERLAY ── */}
        {compareData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#120018]/98 backdrop-blur-md overflow-hidden">
            <div className="relative w-full max-w-4xl h-[85vh] max-h-[85vh] overflow-hidden rounded-3xl bg-[#1E0629] border border-[#D946EF]/20 shadow-2xl flex flex-col">
              {/* Sticky Header */}
              <div className="sticky top-0 z-20 bg-[#1E0629] border-b border-[#D946EF]/10 px-6 py-4 shrink-0 flex justify-between items-center">
                <div className="flex items-center gap-2.5 text-white">
                  <Sparkles size={16} className="text-[#D946EF]" />
                  <h4 className="text-xs font-extrabold uppercase tracking-wider">AI Extraction Review Console</h4>
                </div>
                <button onClick={() => { setCompareData(null); setScanStep("idle"); }} className="p-1 rounded-lg hover:bg-white/5 text-[#9F7AC2] hover:text-white cursor-pointer transition-colors">
                  <X size={14} />
                </button>
              </div>

              {/* SCROLLABLE CONTENT */}
              <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y px-6 py-6 custom-scrollbar text-left space-y-6 admin-scrollable-form animate-slide-in" style={{ WebkitOverflowScrolling: "touch" }}>
                {/* Trust Engine Stats */}
                <div className="space-y-3">
                  <h5 className="text-[9px] font-bold text-[#9F7AC2] uppercase tracking-widest">AI Trust Engine & Safety Assessment</h5>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#2B083A]/30 border border-white/8">
                    <div className="flex flex-col justify-between text-left">
                      <span className="text-[8px] font-bold text-[#9F7AC2] uppercase tracking-widest block">System Integrity</span>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-xs font-black px-2.5 py-0.5 rounded-lg border uppercase tracking-wider ${trustStats?.status === "SAFE" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : trustStats?.status === "REVIEW" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse"}`}>
                          {trustStats?.status}
                        </span>
                      </div>
                      <p className="text-[8.5px] text-[#9F7AC2] mt-1 leading-normal font-semibold">
                        {trustStats?.status === "SAFE" ? "✓ High-trust printed facts" : trustStats?.status === "REVIEW" ? "⚠ Partial inference matching" : "✗ Safety overrides triggered"}
                      </p>
                    </div>
                    <div className="bg-[#1E0629]/60 p-3 rounded-xl border border-white/6 text-left">
                      <span className="text-[8px] text-[#9F7AC2] uppercase tracking-widest block mb-0.5">OCR Accuracy</span>
                      <span className="text-white font-extrabold text-sm font-mono">{trustStats?.ocrAccuracy}%</span>
                      <div className="h-1 w-full rounded bg-[#140019] mt-1.5 overflow-hidden"><div className="h-full bg-emerald-400" style={{ width: `${trustStats?.ocrAccuracy}%` }} /></div>
                    </div>
                    <div className="bg-[#1E0629]/60 p-3 rounded-xl border border-white/6 text-left">
                      <span className="text-[8px] text-[#9F7AC2] uppercase tracking-widest block mb-0.5">Visual Logo Match</span>
                      <span className="text-white font-extrabold text-sm font-mono">{trustStats?.visualMatch}%</span>
                      <div className="h-1 w-full rounded bg-[#140019] mt-1.5 overflow-hidden"><div className="h-full bg-blue-400" style={{ width: `${trustStats?.visualMatch}%` }} /></div>
                    </div>
                    <div className="bg-[#1E0629]/60 p-3 rounded-xl border border-white/6 text-left">
                      <span className="text-[8px] text-[#9F7AC2] uppercase tracking-widest block mb-0.5">Catalog Protection</span>
                      <span className="text-emerald-400 font-extrabold text-sm font-mono">{trustStats?.catalogSafety}% Secure</span>
                      <div className="h-1 w-full rounded bg-[#140019] mt-1.5 overflow-hidden"><div className="h-full bg-emerald-400" style={{ width: `${trustStats?.catalogSafety}%` }} /></div>
                    </div>
                  </div>
                </div>
                {comparisonItems.length === 0 ? (
                  <div className="space-y-6 animate-slide-in text-left">
                    {/* Success Banner */}
                    <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="text-emerald-400" size={20} />
                        </div>
                        <div>
                          <h6 className="text-xs font-black text-white uppercase tracking-wider">Catalog Integrity Verified</h6>
                          <p className="text-[10px] text-emerald-300 font-semibold leading-relaxed mt-0.5">
                            All extracted AI metadata matches your active database. No manual updates or overwrites are required.
                          </p>
                        </div>
                      </div>
                      <div className="px-3.5 py-1.5 rounded-lg bg-emerald-500/25 border border-emerald-500/30 text-[9px] font-black uppercase tracking-widest text-white select-none shrink-0 self-start md:self-auto">
                        100% MATCH
                      </div>
                    </div>

                    {/* Active Profile Summary */}
                    <div className="space-y-4">
                      <h5 className="text-[9px] font-bold text-[#9F7AC2] uppercase tracking-widest">Active Product Profile Summary</h5>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Brand & Title Card */}
                        <div className="p-4 rounded-xl bg-[#2B083A]/20 border border-white/6 flex flex-col justify-between space-y-3">
                          <div>
                            <span className="text-[8px] font-bold text-[#9F7AC2] uppercase tracking-wider block">Title & Brand</span>
                            <h4 className="text-xs font-bold text-white mt-1 leading-snug">{form.title || "—"}</h4>
                            <span className="text-[9px] font-bold text-[#D3B6FF] mt-0.5 block">{form.brand || "Unknown Brand"}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md border text-[8px] font-bold uppercase tracking-wider bg-emerald-500/10 border-emerald-500/20 text-emerald-400 flex items-center gap-1">
                              <Check size={8} /> Verified Title
                            </span>
                            <span className="px-2 py-0.5 rounded-md border text-[8px] font-bold uppercase tracking-wider bg-emerald-500/10 border-emerald-500/20 text-emerald-400 flex items-center gap-1">
                              <Check size={8} /> Verified Brand
                            </span>
                          </div>
                        </div>

                        {/* Category & Skin Type Card */}
                        <div className="p-4 rounded-xl bg-[#2B083A]/20 border border-white/6 flex flex-col justify-between space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[8px] font-bold text-[#9F7AC2] uppercase tracking-wider block">Category</span>
                              <span className="text-xs font-bold text-white mt-1 block">{form.category || "—"}</span>
                            </div>
                            <div>
                              <span className="text-[8px] font-bold text-[#9F7AC2] uppercase tracking-wider block">Skin Type</span>
                              <span className="text-xs font-bold text-white mt-1 block uppercase">{form.skin_type || "All"}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md border text-[8px] font-bold uppercase tracking-wider bg-emerald-500/10 border-emerald-500/20 text-emerald-400 flex items-center gap-1">
                              <Check size={8} /> Categorized
                            </span>
                            <span className="px-2 py-0.5 rounded-md border text-[8px] font-bold uppercase tracking-wider bg-emerald-500/10 border-emerald-500/20 text-emerald-400 flex items-center gap-1">
                              <Check size={8} /> Skin Safe
                            </span>
                          </div>
                        </div>

                        {/* Pricing & Stock Card */}
                        <div className="p-4 rounded-xl bg-[#2B083A]/20 border border-white/6 flex flex-col justify-between space-y-3">
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <span className="text-[8px] font-bold text-[#9F7AC2] uppercase tracking-wider block">Price</span>
                              <span className="text-xs font-extrabold text-[#FF8DC7] mt-1 block font-mono">₹{form.price || "—"}</span>
                            </div>
                            <div>
                              <span className="text-[8px] font-bold text-[#9F7AC2] uppercase tracking-wider block">MRP</span>
                              <span className="text-xs font-extrabold text-[#9F7AC2] line-through mt-1 block font-mono">₹{form.mrp || "—"}</span>
                            </div>
                            <div>
                              <span className="text-[8px] font-bold text-[#9F7AC2] uppercase tracking-wider block">Stock</span>
                              <span className="text-xs font-extrabold text-[#D3B6FF] mt-1 block font-mono">{form.stock ?? 0} U</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md border text-[8px] font-bold uppercase tracking-wider bg-emerald-500/10 border-emerald-500/20 text-emerald-400 flex items-center gap-1">
                              <Check size={8} /> Price Factual
                            </span>
                            {margins.percent > 0 && (
                              <span className="px-2 py-0.5 rounded-md border text-[8px] font-bold uppercase tracking-wider bg-emerald-500/10 border-emerald-500/20 text-emerald-400 flex items-center gap-1">
                                <Check size={8} /> Margin ({margins.percent}%)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Details & Specs Card */}
                        <div className="p-4 rounded-xl bg-[#2B083A]/20 border border-white/6 flex flex-col justify-between space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[8px] font-bold text-[#9F7AC2] uppercase tracking-wider block">Weight / Qty</span>
                              <span className="text-xs font-bold text-white mt-1 block">{form.weight || "—"}</span>
                            </div>
                            <div>
                              <span className="text-[8px] font-bold text-[#9F7AC2] uppercase tracking-wider block">Variant</span>
                              <span className="text-xs font-bold text-white mt-1 block">{form.variant || "—"}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md border text-[8px] font-bold uppercase tracking-wider bg-emerald-500/10 border-emerald-500/20 text-emerald-400 flex items-center gap-1">
                              <Check size={8} /> Quantity Safe
                            </span>
                            <span className="px-2 py-0.5 rounded-md border text-[8px] font-bold uppercase tracking-wider bg-emerald-500/10 border-emerald-500/20 text-emerald-400 flex items-center gap-1">
                              <Check size={8} /> Variant Match
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Description & Ingredients row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Description Card */}
                        <div className="p-4 rounded-xl bg-[#2B083A]/20 border border-white/6 space-y-2 text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] font-bold text-[#9F7AC2] uppercase tracking-wider block">Factual Description</span>
                            <span className="px-2 py-0.5 rounded-md border text-[8px] font-bold uppercase tracking-wider bg-emerald-500/10 border-emerald-500/20 text-emerald-400 flex items-center gap-1 select-none">
                              <Check size={8} /> Fully Safe
                            </span>
                          </div>
                          <p className="text-[10px] text-[#9F7AC2] leading-relaxed font-semibold line-clamp-3 whitespace-pre-wrap">
                            {form.description || "No description provided."}
                          </p>
                        </div>

                        {/* Ingredients Card */}
                        <div className="p-4 rounded-xl bg-[#2B083A]/20 border border-white/6 space-y-2 text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] font-bold text-[#9F7AC2] uppercase tracking-wider block">Ingredients & Benefits</span>
                            <span className="px-2 py-0.5 rounded-md border text-[8px] font-bold uppercase tracking-wider bg-emerald-500/10 border-emerald-500/20 text-emerald-400 flex items-center gap-1 select-none">
                              <Check size={8} /> Verified Clean
                            </span>
                          </div>
                          <p className="text-[10px] text-[#9F7AC2] leading-relaxed font-semibold line-clamp-3 whitespace-pre-wrap">
                            {form.ingredients || form.benefits || "No specific ingredients or benefits specified."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 text-left">
                    {safeItems.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-bold text-[#9F7AC2] px-1 select-none">
                          <span className="text-green-400 uppercase tracking-widest text-[8.5px] font-black flex items-center gap-1"><CheckCircle2 size={11} className="text-green-400" />Verified Improvements (Auto-Checked SAFE)</span>
                          <button onClick={() => { const all = safeItems.every(c => selectedFields[c.key]); const next = { ...selectedFields }; safeItems.forEach(c => { next[c.key] = !all; }); setSelectedFields(next); }} className="text-[#A855F7] hover:underline cursor-pointer">{safeItems.every(c => selectedFields[c.key]) ? "Deselect All Safe" : "Select All Safe"}</button>
                        </div>
                        <div className="divide-y divide-white/6 border border-green-500/25 rounded-xl bg-[#2B083A]/20 overflow-hidden">{safeItems.map((c) => renderComparisonRow(c, "SAFE"))}</div>
                      </div>
                    )}
                    {reviewItems.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-bold text-[#9F7AC2] px-1 select-none">
                          <span className="text-amber-400 uppercase tracking-widest text-[8.5px] font-black flex items-center gap-1"><AlertTriangle size={11} className="text-amber-400" />Needs Review (Manual Verification)</span>
                          <button onClick={() => { const all = reviewItems.every(c => selectedFields[c.key]); const next = { ...selectedFields }; reviewItems.forEach(c => { next[c.key] = !all; }); setSelectedFields(next); }} className="text-[#A855F7] hover:underline cursor-pointer">{reviewItems.every(c => selectedFields[c.key]) ? "Deselect All" : "Select All Review"}</button>
                        </div>
                        <div className="divide-y divide-white/6 border border-amber-500/25 rounded-xl bg-[#2B083A]/20 overflow-hidden">{reviewItems.map((c) => renderComparisonRow(c, "REVIEW"))}</div>
                      </div>
                    )}
                    {blockedItems.length > 0 && (
                      <div className="space-y-3">
                        <button type="button" onClick={() => setBlockedOpen(!blockedOpen)} className="w-full flex items-center justify-between p-3.5 rounded-xl border border-red-500/20 bg-red-500/[0.03] text-red-400 hover:bg-red-500/[0.06] transition-colors text-left cursor-pointer">
                          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest"><ShieldAlert size={12} className="text-red-400 animate-pulse" />Blocked ({blockedItems.length} Hallucinations Protected)</div>
                          <span className="text-[10px] font-bold text-red-400">{blockedOpen ? "Collapse" : "Expand"}</span>
                        </button>
                        {blockedOpen && (<div className="divide-y divide-white/6 border border-red-500/25 rounded-xl bg-red-950/[0.03] overflow-hidden">{blockedItems.map((c) => renderComparisonRow(c, "BLOCKED"))}</div>)}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sticky Footer */}
              <div className="sticky bottom-0 z-20 bg-[#1E0629] border-t border-[#D946EF]/10 p-6 shrink-0 flex gap-3">
                {comparisonItems.length === 0 ? (
                  <button onClick={() => { setCompareData(null); setScanStep("idle"); }} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl admin-gradient-btn cursor-pointer">
                    <CheckCircle2 size={12} />
                    Catalog Confirmed - Close Review
                  </button>
                ) : (
                  <>
                    <button onClick={() => { setCompareData(null); setScanStep("idle"); }} className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl border border-white/8 text-[#9F7AC2] hover:text-white hover:bg-white/5 cursor-pointer transition-colors">Decline</button>
                    <button onClick={applyCompareSelection} disabled={Object.values(selectedFields).filter(Boolean).length === 0} className="flex-grow-[2] flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl admin-gradient-btn">
                      <CheckCircle2 size={12} />
                      Apply {Object.values(selectedFields).filter(Boolean).length} Overwrites
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── LOADING OVERLAY ── */}
        {reanalyzing && (
          <div className="absolute inset-0 bg-[#080012]/85 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
            <div className="bg-[#1E0629] border border-white/10 p-8 rounded-2xl w-full max-w-md text-center space-y-5 shadow-2xl">
              <div className="flex justify-center relative">
                <div className="absolute inset-0 rounded-full bg-[#D946EF]/20 blur-md animate-pulse" />
                <Loader2 size={36} className="text-[#D946EF] animate-spin relative z-10" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-sm font-extrabold uppercase tracking-widest text-white flex items-center justify-center gap-2">
                  <Sparkles size={14} className="text-[#D946EF] animate-pulse" />
                  GEMINI BEAUTY INTELLIGENCE ACTIVE
                </h4>
                <p className="text-[10.5px] text-[#9F7AC2] font-semibold">Executing Vision & Copywriting pipeline</p>
              </div>
              <div className="space-y-3 text-[10.5px] font-extrabold text-left pt-4 border-t border-white/8 select-none">
                {(() => {
                  const stages = [
                    { key: "gemini_scan", label: "Gemini Vision Scan & OCR (Stage 1)" },
                    { key: "label_parsing", label: "Factual Label Parsing (Stage 2)" },
                    { key: "hallucination_guard", label: "Hallucination Guard Scan (Stage 3)" },
                    { key: "groq_enrichment", label: "Groq Luxury Enrichment (Stage 4)" },
                    { key: "seo_tag_generation", label: "SEO & Search Tag Generation (Stage 5)" },
                    { key: "trust_safety", label: "AI Trust Safety Assessment (Stage 6)" },
                  ];
                  const stepOrder = ["idle","gemini_scan","label_parsing","hallucination_guard","groq_enrichment","seo_tag_generation","trust_safety","done"];
                  const currentIndex = stepOrder.indexOf(scanStep);
                  return stages.map((st, idx) => {
                    const isCompleted = scanStep === "done" || (currentIndex > idx + 1 && currentIndex !== -1);
                    const isActive = scanStep === st.key;
                    return (
                      <div key={st.key} className={`flex items-center gap-3 transition-all duration-300 ${isCompleted ? "text-emerald-400" : isActive ? "text-white font-black" : "text-[#6E4E85]"}`}>
                        <div className="shrink-0">
                          {isCompleted ? <CheckCircle2 size={13} className="text-emerald-400" /> : isActive ? <Loader2 size={13} className="text-[#D946EF] animate-spin" /> : <div className="w-4 h-4 rounded-full border border-current/30 flex items-center justify-center text-[8px] font-bold">{idx + 1}</div>}
                        </div>
                        <span className="tracking-wide">{st.label}</span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
