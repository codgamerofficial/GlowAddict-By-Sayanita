"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Upload, Sparkles, RefreshCw, Image as ImageIcon, Link2, CheckCircle2, AlertTriangle, ShieldAlert, Loader2 } from "lucide-react";
import { getConfidenceLabel } from "@/lib/ai-utils";

export interface ExtractedProduct {
  title: string; brand: string; category: string; description: string;
  price: number; mrp: number; skuHint: string; shades: string[];
  extractedText: string; ingredients: string; benefits: string;
  skinType: string; productType: string; variant: string; weight: string;
  tags: string[]; slug: string; discount_percent: number;
  seo_title: string; seo_description: string; seo_keywords: string[];
  ai_confidence: number;
}

type ExtractionStatus = "full" | "partial" | "fallback";
type UploadStep = "idle" | "uploading" | "analyzing" | "structuring" | "done" | "error";

interface AIUploadZoneProps {
  onExtracted: (data: ExtractedProduct, imageUrl: string, status: ExtractionStatus) => void;
  adminApiKey: string;
}

const STEP_LABELS: Record<UploadStep, string> = {
  idle: "", uploading: "Uploading image…", analyzing: "Running Gemini Visual Analysis…",
  structuring: "Structuring product data…",
  done: "Extraction complete", error: "Extraction failed",
};


// ─── Component ────────────────────────────────────────────────────────────────
export default function AIUploadZone({ onExtracted, adminApiKey }: AIUploadZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [step, setStep] = useState<UploadStep>("idle");
  const [extracted, setExtracted] = useState<ExtractedProduct | null>(null);
  const [extractionStatus, setExtractionStatus] = useState<ExtractionStatus>("full");
  const [previewUrl, setPreviewUrl] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [error, setError] = useState("");
  const [engineUsed, setEngineUsed] = useState<"gemini" | "">("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastImageUrl = useRef("");

  const resetState = () => { setExtracted(null); setPreviewUrl(""); setError(""); setStep("idle"); setEngineUsed(""); };


  // ── Primary server-side extraction (Gemini only) ──
  const runExtraction = useCallback(async (body: FormData | string) => {
    setError("");
    setStep("uploading");
    setEngineUsed("gemini");

    try {
      await new Promise((r) => setTimeout(r, 300));
      setStep("analyzing");

      const isUrl = typeof body === "string";
      const res = await fetch("/api/ai/extract-product", {
        method: "POST",
        headers: {
          "x-admin-key": adminApiKey,
          ...(isUrl ? { "Content-Type": "application/json" } : {}),
        },
        body: isUrl ? JSON.stringify({ imageUrl: body }) : body,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `AI request failed (${res.status})`);
      }

      setStep("structuring");
      await new Promise((r) => setTimeout(r, 400));

      const data = await res.json();
      const status: ExtractionStatus = data.extractionStatus || "full";
      const imageUrl = data.imageUrl || (isUrl ? String(body) : "");

      lastImageUrl.current = imageUrl;
      setExtracted(data.extracted);
      setExtractionStatus(status);
      setStep("done");
      onExtracted(data.extracted, imageUrl, status);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "AI extraction failed.";
      setError(errMsg);
      setStep("error");
    }
  }, [adminApiKey, onExtracted]);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) { setError("Please upload an image file (JPG, PNG, WebP)"); return; }
    if (file.size > 10 * 1024 * 1024) { setError("File size must be under 10MB"); return; }
    resetState();
    setPreviewUrl(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append("file", file);
    await runExtraction(formData);
  }, [runExtraction]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleUrlExtract = async () => {
    if (!urlInput.trim()) return;
    resetState();
    setPreviewUrl(urlInput.trim());
    await runExtraction(urlInput.trim());
  };

  const handleRetry = () => {
    if (lastImageUrl.current) {
      const url = lastImageUrl.current;
      resetState();
      setPreviewUrl(url);
      setUrlInput(url);
      runExtraction(url);
    }
  };

  const isProcessing = step === "uploading" || step === "analyzing" || step === "structuring";
  const confidence = extracted ? getConfidenceLabel(extracted.ai_confidence) : null;

  const statusIcon = {
    full: <CheckCircle2 size={13} className="text-emerald-400" />,
    partial: <AlertTriangle size={13} className="text-amber-400" />,
    fallback: <ShieldAlert size={13} className="text-red-400" />,
  };
  const statusLabel = {
    full: "AI Extracted Successfully",
    partial: "Partial Extraction — Review Recommended",
    fallback: "Limited Extraction — Manual Edit Required",
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        role="button" tabIndex={0} aria-label="Upload product image for AI extraction"
        className={`admin-hero-dropzone p-6 sm:p-8 text-center cursor-pointer transition-all ${
          dragOver ? "drag-active border-brand-magenta shadow-[0_0_30px_rgba(252,39,121,0.25)] scale-[1.005]" : "border-brand-rose hover:border-brand-magenta"
        } relative overflow-hidden`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInputRef.current?.click(); } }}
      >
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" aria-hidden="true"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }} />

        {isProcessing && <div className="admin-scan-line" />}

        {isProcessing ? (
          <div className="space-y-4 py-4 relative z-10">
            <div className="mx-auto w-12 h-12 rounded-full bg-brand-magenta/10 border border-brand-rose flex items-center justify-center animate-bounce">
              <Loader2 size={20} className="text-brand-magenta animate-spin" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-extrabold text-amethyst tracking-tight">{STEP_LABELS[step]}</p>
              <div className="flex items-center justify-center gap-2 pt-1.5">
                {(["uploading", "analyzing", "structuring"] as const).map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      step === s ? "bg-brand-magenta scale-125 shadow-[0_0_8px_rgba(252,39,121,0.4)] animate-pulse" :
                      (["uploading","analyzing","structuring"].indexOf(step) > i) ? "bg-[#10B981]" : "bg-brand-rose"
                    }`} />
                    {i < 2 && <div className={`w-6 h-px ${
                      (["uploading","analyzing","structuring"].indexOf(step) > i) ? "bg-[#10B981]" : "bg-brand-rose"
                    }`} />}
                  </div>
                ))}
              </div>
            </div>
            <div className="max-w-sm mx-auto space-y-2 pt-2">
              <div className="admin-shimmer h-4 w-3/4 mx-auto" />
              <div className="admin-shimmer h-3 w-1/2 mx-auto" />
            </div>
          </div>
        ) : (
          <div className="space-y-3 py-2 relative z-10">
            <div className="mx-auto w-12 h-12 rounded-full bg-brand-cream border border-brand-rose flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload size={18} className="text-amethyst group-hover:text-brand-magenta" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-foreground tracking-tight">Drop product packaging image or click to browse</p>
              <p className="text-[10px] text-foreground/70 mt-1">
                Drag-and-drop labels, photos, or screenshots • JPG, PNG, WebP up to 10MB
              </p>
              <p className="text-[8px] text-amethyst mt-1.5 flex items-center justify-center gap-1">
                <Sparkles size={8} className="text-brand-magenta" />
                Gemini Vision Engine double-stage pipeline
              </p>
            </div>
          </div>
        )}
      </div>

      {/* URL Input Bar */}
      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        <div className="relative flex-1">
          <Link2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amethyst" />
          <input type="text" placeholder="Or paste remote image link to extract details…" value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleUrlExtract(); }}
            aria-label="Image URL for AI extraction"
            className="admin-glass-input pl-9" />
        </div>
        <button type="button" onClick={handleUrlExtract} disabled={!urlInput.trim() || isProcessing}
          aria-label="Extract product details from URL"
          className="px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-xl bg-brand-gradient hover:bg-brand-gradient-hover text-white flex items-center gap-1.5 shrink-0 border border-brand-rose transition-all">
          <Sparkles size={12} className="animate-pulse" />
          {isProcessing ? "Processing…" : "Analyze Product"}
        </button>
      </div>

      {/* Error with retry */}
      {error && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl px-4 py-3 text-left">
          <XCircleIcon />
          <div className="flex-1">
            <p className="font-extrabold text-[#EF4444]">Extraction failed — Verification Needed</p>
            <p className="text-[10px] text-[#EF4444]/80 mt-0.5">{error}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button type="button" onClick={handleRetry}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-wider rounded-lg border border-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444]/10 cursor-pointer transition-colors">
              <RefreshCw size={10} /> Retry Extraction
            </button>
          </div>
        </div>
      )}

      {/* Extracted Results Preview Card */}
      {extracted && previewUrl && (
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 bg-brand-cream dark:bg-[#2D0F21] border border-brand-rose dark:border-[#FFB7D2]/10 rounded-2xl p-4 transition-all duration-300">
          <div className="sm:col-span-3 relative aspect-square rounded-xl overflow-hidden bg-background border border-brand-rose shrink-0">
            <Image src={previewUrl} alt="Product preview" fill className="object-cover" unoptimized />
          </div>
          <div className="sm:col-span-9 space-y-3 text-left">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[9px] font-extrabold uppercase bg-background border-brand-rose">
                    {statusIcon[extractionStatus]}
                    <span className={confidence?.color}>{statusLabel[extractionStatus]}</span>
                  </div>
                  {engineUsed && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded-full border border-brand-rose text-brand-magenta">
                      <Sparkles size={8} className="animate-pulse" /> Gemini Visual Analysis Verified
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-extrabold text-foreground mt-2">{extracted.title}</h4>
                <p className="text-[10px] text-foreground/75">{extracted.brand || "Unknown Brand"} • {extracted.category}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button type="button" onClick={handleRetry} aria-label="Re-analyze image with Gemini Vision AI"
                  className="p-2 rounded-lg bg-brand-cream border border-brand-rose text-amethyst hover:bg-brand-rose transition-all cursor-pointer">
                  <RefreshCw size={12} />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {extracted.price > 0 && <span className="admin-tag-pill">₹{extracted.price}</span>}
              {extracted.mrp > extracted.price && (
                <span className="admin-tag-pill line-through opacity-40">₹{extracted.mrp}</span>
              )}
              {extracted.discount_percent > 0 && (
                <span className="admin-tag-pill !bg-[#10B981]/15 !text-[#10B981] !border-[#10B981]/25">
                  {extracted.discount_percent}% OFF
                </span>
              )}
              {extracted.shades.length > 0 && (
                <span className="admin-tag-pill">
                  <ImageIcon size={10} />{extracted.shades.length} shade{extracted.shades.length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Confidence progress health bar */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[9px]">
                <span className="text-foreground/70 font-semibold">Vision Extraction Confidence</span>
                <span className={`font-bold ${confidence?.color}`}>
                  {extracted.ai_confidence}% — {confidence?.label}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-background overflow-hidden border border-brand-rose">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000" style={{ width: `${extracted.ai_confidence}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function XCircleIcon() {
  return (
    <div className="w-8 h-8 rounded-full bg-[#EF4444]/15 flex items-center justify-center shrink-0 border border-[#EF4444]/25">
      <ShieldAlert size={14} className="text-[#EF4444]" />
    </div>
  );
}
