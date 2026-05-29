"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useShop, Product } from "@/context/ShopContext";
import { Header } from "@/components/Header";
import { 
  ArrowLeft, Upload, Sparkles, RefreshCcw, Check, CheckCircle2, 
  AlertTriangle, ShieldAlert, Loader2, Play, Plus, Trash2, 
  Layers, Copy, Save, Edit, Database, Tag, Search, ArrowRight, Grid, Eye, X, BookOpen, BarChart3,
  Lock
} from "lucide-react";
import "@/app/admin/admin-inventory.css";

interface QueueItem {
  id: string;
  file: File;
  previewUrl: string;
  status: "queued" | "uploading" | "analyzing" | "structuring" | "done" | "error";
  progress: number;
  error?: string;
  extracted?: any;
}

export default function BulkImportPage() {
  const router = useRouter();
  const { products, adminAddProduct } = useShop();

  const [secretKey, setSecretKey] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [keyError, setKeyError] = useState("");
  const [mounted, setMounted] = useState(false);

  // Queue state
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState<QueueItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkPriceChange, setBulkPriceChange] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Authenticate and mount
  useEffect(() => {
    setMounted(true);
    const storedKey = sessionStorage.getItem("glow_admin_secret_key") || "";
    if (storedKey) setSecretKey(storedKey);
  }, []);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyInput === "0909" || keyInput.trim() === "sayanitapayra-1@okicici") {
      sessionStorage.setItem("glow_admin_secret_key", keyInput);
      setSecretKey(keyInput);
      setKeyError("");
    } else {
      setKeyError("Invalid administrative secret credentials.");
    }
  };

  // Drag & drop handlers
  const [dragOver, setDragOver] = useState(false);
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    addFilesToQueue(files);
  };

  const addFilesToQueue = (files: File[]) => {
    const validImages = files.filter(f => f.type.startsWith("image/"));
    if (validImages.length === 0) return;

    const newItems: QueueItem[] = validImages.map(file => ({
      id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      status: "queued",
      progress: 0
    }));

    setQueue(prev => [...prev, ...newItems]);
  };

  const clearQueue = () => {
    queue.forEach(item => URL.revokeObjectURL(item.previewUrl));
    setQueue([]);
    setSelectedIds([]);
  };

  const removeQueueItem = (id: string) => {
    const item = queue.find(q => q.id === id);
    if (item) URL.revokeObjectURL(item.previewUrl);
    setQueue(prev => prev.filter(q => q.id !== id));
    setSelectedIds(prev => prev.filter(x => x !== id));
  };

  // Pipeline execution
  const startExtractionPipeline = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    // Process items in parallel batches (max 3 concurrent)
    const itemsToProcess = queue.filter(q => q.status === "queued" || q.status === "error");
    const batchSize = 3;

    for (let i = 0; i < itemsToProcess.length; i += batchSize) {
      const batch = itemsToProcess.slice(i, i + batchSize);
      await Promise.all(batch.map(item => processSingleItem(item.id)));
    }

    setIsProcessing(false);
  };

  const processSingleItem = async (itemId: string) => {
    const updateStatus = (status: QueueItem["status"], progress: number, extra: Partial<QueueItem> = {}) => {
      setQueue(prev => prev.map(q => q.id === itemId ? { ...q, status, progress, ...extra } : q));
    };

    updateStatus("uploading", 20);
    const item = queue.find(q => q.id === itemId);
    if (!item) return;

    try {
      const formData = new FormData();
      formData.append("file", item.file);

      await new Promise(r => setTimeout(r, 400));
      updateStatus("analyzing", 50);

      const res = await fetch("/api/ai/extract-product", {
        method: "POST",
        headers: {
          "x-admin-key": secretKey
        },
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      updateStatus("structuring", 80);
      await new Promise(r => setTimeout(r, 350));

      const data = await res.json();
      
      // Auto-SKU & category post-processing
      const extracted = data.extracted;
      const brand = (extracted.brand || "UNKNOWN").toUpperCase().replace(/[^A-Z0-9]/g, "");
      const cat = (extracted.category || "GEN").substring(0, 3).toUpperCase();
      const num = Math.floor(Math.random() * 900) + 100;
      extracted.sku = `${brand}-${cat}-${num}`;

      updateStatus("done", 100, { extracted });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Extraction failed";
      updateStatus("error", 0, { error: msg });
    }
  };

  // Bulk operations
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    const doneIds = queue.filter(q => q.status === "done").map(q => q.id);
    if (selectedIds.length === doneIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(doneIds);
    }
  };

  const applyBulkCategory = () => {
    if (!bulkCategory) return;
    setQueue(prev => prev.map(q => {
      if (selectedIds.includes(q.id) && q.extracted) {
        return {
          ...q,
          extracted: { ...q.extracted, category: bulkCategory }
        };
      }
      return q;
    }));
    setBulkCategory("");
  };

  const applyBulkPriceChange = () => {
    const percent = parseFloat(bulkPriceChange);
    if (isNaN(percent)) return;

    setQueue(prev => prev.map(q => {
      if (selectedIds.includes(q.id) && q.extracted) {
        const currentPrice = q.extracted.price;
        const newPrice = Math.round(currentPrice * (1 + percent / 100));
        const mrp = q.extracted.mrp;
        const discount = Math.max(0, Math.round(((mrp - newPrice) / mrp) * 100));
        return {
          ...q,
          extracted: { ...q.extracted, price: newPrice, discount_percent: discount }
        };
      }
      return q;
    }));
    setBulkPriceChange("");
  };

  // Sync approved items to database (ShopContext local state)
  const syncApprovedToDatabase = () => {
    const approvedItems = queue.filter(q => selectedIds.includes(q.id) && q.status === "done" && q.extracted);
    if (approvedItems.length === 0) return;

    approvedItems.forEach(item => {
      const ext = item.extracted;
      const cleanProduct: Product = {
        id: `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        sku: ext.sku,
        title: ext.title,
        brand: ext.brand,
        category: ext.category,
        price: ext.price || 999,
        mrp: ext.mrp || 1299,
        stock: 50, // default stock
        image: item.extracted.ai_extraction?.parsed_entities?.imageUrl || item.previewUrl,
        shades: ext.shades?.length > 0 ? ext.shades : undefined,
        authenticity_flag: true,
        description: ext.description,
        extracted_text: ext.extractedText,
        slug: ext.slug,
        ingredients: ext.ingredients,
        benefits: ext.benefits,
        skin_type: ext.skinType,
        product_type: ext.productType,
        variant: ext.variant,
        weight: ext.weight,
        tags: ext.tags,
        seo_title: ext.seo_title,
        seo_description: ext.seo_description,
        seo_keywords: ext.seo_keywords,
        discount_percent: ext.discount_percent,
        status: "active",
        created_at: new Date().toISOString()
      };
      adminAddProduct(cleanProduct);
    });

    // Remove synced items from queue
    setQueue(prev => prev.filter(q => !selectedIds.includes(q.id)));
    setSelectedIds([]);
    alert(`Successfully synced ${approvedItems.length} products to database catalog!`);
  };

  // duplicate scanning helpers
  const duplicateScanner = useMemo(() => {
    const matches: Record<string, { type: string; details: string }> = {};
    queue.forEach(q => {
      if (q.extracted) {
        const title = q.extracted.title.toLowerCase().trim();
        const sku = q.extracted.sku.toLowerCase().trim();

        // Check against active catalog
        const matchCat = products.find(p => p.title.toLowerCase().trim() === title || p.sku.toLowerCase().trim() === sku);
        if (matchCat) {
          matches[q.id] = {
            type: matchCat.sku.toLowerCase().trim() === sku ? "SKU Collision" : "Title Match",
            details: `Existing catalog item: ${matchCat.title} (${matchCat.sku})`
          };
        }
      }
    });
    return matches;
  }, [queue, products]);

  // Filtering search query
  const filteredQueue = useMemo(() => {
    if (!searchQuery) return queue;
    const query = searchQuery.toLowerCase();
    return queue.filter(q => 
      q.file.name.toLowerCase().includes(query) || 
      (q.extracted?.title && q.extracted.title.toLowerCase().includes(query)) ||
      (q.extracted?.brand && q.extracted.brand.toLowerCase().includes(query))
    );
  }, [queue, searchQuery]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = queue.length;
    const completed = queue.filter(q => q.status === "done").length;
    const failed = queue.filter(q => q.status === "error").length;
    const processing = queue.filter(q => ["uploading", "analyzing", "structuring"].includes(q.status)).length;
    const queued = queue.filter(q => q.status === "queued").length;
    const duplicateCount = Object.keys(duplicateScanner).length;

    const confidences = queue.filter(q => q.status === "done" && q.extracted).map(q => q.extracted.ai_confidence);
    const avgConfidence = confidences.length > 0 
      ? Math.round(confidences.reduce((a, b) => a + b, 0) / confidences.length)
      : 0;

    return { total, completed, failed, processing, queued, duplicateCount, avgConfidence };
  }, [queue, duplicateScanner]);

  if (!mounted) return null;

  // Secret key protection page lock
  if (secretKey !== "0909" && secretKey !== "sayanitapayra-1@okicici") {
    return (
      <div className="min-h-screen bg-[#080012] text-white flex flex-col justify-between select-none">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <form onSubmit={handleAuthSubmit} className="bg-[#140A1F] border border-[#C77DFF]/20 rounded-3xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl backdrop-blur-md">
            <div className="mx-auto w-12 h-12 rounded-full bg-brand-magenta/15 border border-brand-rose flex items-center justify-center animate-pulse">
              <Lock size={20} className="text-brand-magenta" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold font-elegant text-white">Security Credentials Verification</h2>
              <p className="text-[10px] text-orchid-text-muted leading-relaxed">
                Redesigning administrative nodes. Enter secret PIM unlock code to open Sayanita's command vaults.
              </p>
            </div>
            <div className="space-y-3.5">
              <input
                type="password"
                placeholder="Enter administrative credentials…"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                className="admin-glass-input text-center text-xs tracking-widest placeholder:tracking-normal"
              />
              {keyError && <p className="text-[9.5px] font-bold text-red-400">{keyError}</p>}
            </div>
            <button
              type="submit"
              className="w-full h-10 rounded-xl bg-brand-gradient hover:scale-[1.02] transition-transform text-white text-[11px] font-bold uppercase tracking-widest cursor-pointer"
            >
              Verify Credentials
            </button>
          </form>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080012] text-white flex flex-col justify-between select-none pb-20">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 select-none">
        
        {/* Navigation Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-[#C77DFF] hover:text-white transition-colors"
          >
            <ArrowLeft size={12} />
            Back to Dashboard Center
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[9.5px] font-bold uppercase tracking-widest bg-brand-magenta/15 border border-brand-magenta/35 text-brand-magenta px-3 py-1 rounded-lg">
              ✨ Shopify Plus AI Factory Mode
            </span>
          </div>
        </div>

        {/* Story Banner */}
        <section className="bg-gradient-to-br from-[#1F0F30]/40 via-[#140A1F]/70 to-[#080012] border border-[#C77DFF]/15 rounded-[32px] p-6 sm:p-8 shadow-xl text-center space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-44 h-44 bg-brand-magenta/5 rounded-full blur-3xl pointer-events-none" />
          <h1 className="text-2xl sm:text-4xl font-black font-elegant text-white tracking-wide">
            AI Catalog Factory
          </h1>
          <p className="text-[10px] sm:text-xs text-orchid-text-muted max-w-xl mx-auto leading-relaxed font-sans">
            Upload hundreds of beauty product photos, packaging scans, or folder directories in one click. Sayanita's Gemini-Groq Vision OCR pipeline automatically parses brands, MRPs, ingredients, claims, and generates luxury descriptions.
          </p>
        </section>

        {/* Processing Queue Stats Grid */}
        <section className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-[#140A1F] border border-[#C77DFF]/10 rounded-2xl p-4 text-center">
            <span className="text-[8px] font-bold text-orchid-text-muted uppercase tracking-widest block">Total Images</span>
            <span className="text-xl font-black font-mono mt-1 block">{stats.total}</span>
          </div>
          <div className="bg-[#140A1F] border border-[#C77DFF]/10 rounded-2xl p-4 text-center">
            <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest block">Completed</span>
            <span className="text-xl font-black font-mono mt-1 block text-emerald-400">{stats.completed}</span>
          </div>
          <div className="bg-[#140A1F] border border-[#C77DFF]/10 rounded-2xl p-4 text-center">
            <span className="text-[8px] font-bold text-[#FC2779] uppercase tracking-widest block">Processing</span>
            <span className="text-xl font-black font-mono mt-1 block text-brand-magenta">{stats.processing}</span>
          </div>
          <div className="bg-[#140A1F] border border-[#C77DFF]/10 rounded-2xl p-4 text-center">
            <span className="text-[8px] font-bold text-amber-400 uppercase tracking-widest block">Queued</span>
            <span className="text-xl font-black font-mono mt-1 block text-amber-400">{stats.queued}</span>
          </div>
          <div className="bg-[#140A1F] border border-[#C77DFF]/10 rounded-2xl p-4 text-center">
            <span className="text-[8px] font-bold text-red-400 uppercase tracking-widest block">Failed</span>
            <span className="text-xl font-black font-mono mt-1 block text-red-400">{stats.failed}</span>
          </div>
          <div className="bg-[#140A1F] border border-[#C77DFF]/10 rounded-2xl p-4 text-center">
            <span className="text-[8px] font-bold text-purple-400 uppercase tracking-widest block">Avg Confidence</span>
            <span className="text-xl font-black font-mono mt-1 block text-[#C77DFF]">
              {stats.avgConfidence}%
            </span>
          </div>
        </section>

        {/* Upload Dropzone */}
        <section
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`bg-[#140A1F]/50 border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col items-center justify-center space-y-4 ${
            dragOver ? "border-brand-magenta bg-brand-magenta/5 scale-[1.002]" : "border-[#C77DFF]/15 hover:border-brand-magenta/40"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              addFilesToQueue(files);
            }}
          />
          <input
            ref={folderInputRef}
            type="file"
            accept="image/*"
            {...{ webkitdirectory: "", directory: "" }}
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              addFilesToQueue(files);
            }}
          />
          <div className="w-16 h-16 rounded-full bg-[#1C0F2B] border border-[#C77DFF]/15 flex items-center justify-center">
            <Upload size={24} className="text-[#C77DFF]" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-extrabold text-white">Drag & drop product images, or select from local storage</p>
            <p className="text-[10px] text-orchid-text-muted">
              Supports bulk multiselect • Complete Folder uploads • JPG, PNG, WebP up to 10MB each
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl bg-[#1C0F2B] border border-[#C77DFF]/10 text-white cursor-pointer hover:bg-[#25143A] transition-colors"
            >
              Select Images
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); folderInputRef.current?.click(); }}
              className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl bg-[#1C0F2B] border border-[#C77DFF]/10 text-white cursor-pointer hover:bg-[#25143A] transition-colors"
            >
              Upload Complete Folder
            </button>
          </div>
        </section>

        {/* Processing Control Hub */}
        {queue.length > 0 && (
          <section className="bg-[#140A1F] border border-[#C77DFF]/10 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-left w-full md:w-auto">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">PIM Queue Control Hub</h3>
              <p className="text-[10px] text-orchid-text-muted mt-0.5">
                Staged images: <strong>{queue.length}</strong> • Completed: <strong>{stats.completed}</strong> • Selected for Sync: <strong>{selectedIds.length}</strong>
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto flex-wrap sm:flex-nowrap">
              <button
                onClick={startExtractionPipeline}
                disabled={isProcessing || stats.queued === 0}
                className="flex-1 sm:flex-none h-10 px-5 rounded-xl bg-brand-gradient text-white text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <Play size={12} className="animate-pulse" />
                {isProcessing ? "Batch Processing…" : "Start Vision AI Pipeline"}
              </button>
              <button
                onClick={clearQueue}
                disabled={isProcessing}
                className="flex-1 sm:flex-none h-10 px-5 rounded-xl border border-[#C77DFF]/10 text-orchid-text-muted hover:text-white text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <Trash2 size={12} />
                Clear Queue
              </button>
            </div>
          </section>
        )}

        {/* Main Work Grid: List and Review */}
        {queue.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT: Queue Table */}
            <section className="lg:col-span-8 bg-[#140A1F] border border-[#C77DFF]/10 rounded-3xl overflow-hidden shadow-xl">
              
              <div className="p-5 border-b border-[#C77DFF]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:max-w-xs">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orchid-text-muted" />
                  <input
                    type="text"
                    placeholder="Search file name or brand..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="admin-glass-input pl-9"
                  />
                </div>
                {stats.completed > 0 && (
                  <button
                    onClick={toggleSelectAll}
                    className="text-[9.5px] font-bold uppercase tracking-widest text-brand-magenta hover:underline"
                  >
                    {selectedIds.length === queue.filter(q => q.status === "done").length ? "Deselect All Done" : "Select All Done"}
                  </button>
                )}
              </div>

              {/* Live Queue Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#C77DFF]/8 text-[8px] font-extrabold uppercase tracking-widest text-orchid-text-muted bg-[#080012]/40">
                      <th className="py-4.5 px-5 w-8"></th>
                      <th className="py-4.5 px-4 w-12">Preview</th>
                      <th className="py-4.5 px-4">File Information</th>
                      <th className="py-4.5 px-4 w-44">AI Extraction Status</th>
                      <th className="py-4.5 px-5 text-right w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C77DFF]/6 text-xs select-none">
                    {filteredQueue.map(item => {
                      const isSelected = selectedIds.includes(item.id);
                      const isDone = item.status === "done";
                      const isDup = !!duplicateScanner[item.id];

                      return (
                        <tr 
                          key={item.id} 
                          className={`hover:bg-[#1C0F2B]/20 transition-colors ${isSelected ? "bg-brand-magenta/[0.03]" : ""}`}
                        >
                          <td className="py-3 px-5">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={!isDone}
                              onChange={() => toggleSelect(item.id)}
                              className="rounded border-[#C77DFF]/20 text-brand-magenta focus:ring-brand-magenta w-3.5 h-3.5 cursor-pointer disabled:opacity-30"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-[#C77DFF]/15 bg-[#080012]">
                              <Image src={item.previewUrl} alt="Thumbnail" fill className="object-cover" unoptimized />
                            </div>
                          </td>
                          <td className="py-3 px-4 text-left">
                            <span className="font-extrabold text-white block max-w-[200px] truncate" title={item.file.name}>
                              {item.file.name}
                            </span>
                            <span className="text-[9px] text-orchid-text-muted block mt-0.5">
                              {(item.file.size / 1024).toFixed(0)} KB • {item.file.type.split("/")[1].toUpperCase()}
                            </span>
                            {item.extracted && (
                              <span className="text-[9.5px] font-bold text-orchid-accent block mt-1">
                                {item.extracted.brand || "Unknown Brand"} • {item.extracted.title}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-[9px]">
                                <span className={`font-semibold capitalize ${
                                  item.status === "done" ? "text-emerald-400" :
                                  item.status === "error" ? "text-red-400" :
                                  item.status === "queued" ? "text-amber-400" : "text-brand-magenta"
                                }`}>
                                  {item.status === "done" ? "Structured" : item.status}
                                </span>
                                {item.extracted && (
                                  <span className="text-orchid-text-muted font-bold">{item.extracted.ai_confidence}%</span>
                                )}
                              </div>
                              
                              {/* progress bar */}
                              <div className="h-1.5 w-full bg-[#080012] rounded-full overflow-hidden border border-[#C77DFF]/8">
                                <div 
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    item.status === "done" ? "bg-emerald-500" :
                                    item.status === "error" ? "bg-red-500" : "bg-brand-gradient"
                                  }`} 
                                  style={{ width: `${item.progress}%` }} 
                                />
                              </div>

                              {isDup && (
                                <span className="inline-flex items-center gap-1 text-[8.5px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 mt-1">
                                  <AlertTriangle size={8} /> Duplicate SKU Detected
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-5 text-right">
                            <div className="flex justify-end gap-1.5">
                              {isDone && (
                                <button
                                  onClick={() => setEditingItem(item)}
                                  className="p-2 rounded-lg bg-[#1C0F2B] border border-[#C77DFF]/10 text-[#C77DFF] hover:bg-[#25143A] transition-colors cursor-pointer"
                                  title="Edit extracted product fields"
                                >
                                  <Edit size={11} />
                                </button>
                              )}
                              <button
                                onClick={() => removeQueueItem(item.id)}
                                className="p-2 rounded-lg bg-[#1C0F2B] border border-[#C77DFF]/10 text-orchid-text-muted hover:text-red-400 transition-colors cursor-pointer"
                                title="Remove file"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </section>

            {/* RIGHT: Bulk Action & database sync control */}
            <section className="lg:col-span-4 space-y-6">
              
              {/* Sync controls */}
              <div className="bg-[#140A1F] border border-[#C77DFF]/10 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl text-left">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Database size={13} className="text-[#C77DFF]" />
                  Database Sync Manager
                </h3>
                <p className="text-[10px] text-orchid-text-muted leading-relaxed">
                  Select processed items to save and publish to your live beauty catalog database.
                </p>

                <div className="space-y-2 pt-2 border-t border-[#C77DFF]/6">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span>Approved PIM Items:</span>
                    <span className="font-bold text-white">{selectedIds.length}</span>
                  </div>
                </div>

                <button
                  onClick={syncApprovedToDatabase}
                  disabled={selectedIds.length === 0}
                  className="w-full h-11 rounded-xl bg-brand-gradient text-white text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 transition-all hover:scale-[1.01]"
                >
                  <Save size={13} />
                  Bulk Save to Database
                </button>
              </div>

              {/* Bulk Editor utilities */}
              {selectedIds.length > 0 && (
                <div className="bg-[#140A1F] border border-[#C77DFF]/10 rounded-3xl p-5 sm:p-6 space-y-4.5 shadow-xl text-left animate-slide-in">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                    <Layers size={13} className="text-brand-magenta" />
                    PIM Bulk Editor
                  </h3>
                  <p className="text-[10px] text-orchid-text-muted">
                    Quick modifications across the <strong>{selectedIds.length}</strong> selected queue items.
                  </p>

                  <div className="space-y-3.5 pt-2 border-t border-[#C77DFF]/6">
                    {/* Category */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-orchid-text-muted uppercase block">Bulk Category</label>
                      <div className="flex gap-2">
                        <select
                          value={bulkCategory}
                          onChange={(e) => setBulkCategory(e.target.value)}
                          className="flex-1 admin-glass-input text-[11px]"
                        >
                          <option value="">Select category...</option>
                          <option value="Serums">Serums</option>
                          <option value="Lipsticks">Lipsticks</option>
                          <option value="Lip Care">Lip Care</option>
                          <option value="SPF Care">SPF Care</option>
                          <option value="Hydration">Hydration</option>
                        </select>
                        <button 
                          onClick={applyBulkCategory}
                          className="px-3 rounded-lg border border-[#C77DFF]/15 text-xs text-white hover:bg-white/5 cursor-pointer"
                        >
                          Apply
                        </button>
                      </div>
                    </div>

                    {/* Price adjustment */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-orchid-text-muted uppercase block">Bulk Price Adjustment (%)</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="e.g. -10 for 10% discount..."
                          value={bulkPriceChange}
                          onChange={(e) => setBulkPriceChange(e.target.value)}
                          className="flex-1 admin-glass-input text-[11px]"
                        />
                        <button
                          onClick={applyBulkPriceChange}
                          className="px-3 rounded-lg border border-[#C77DFF]/15 text-xs text-white hover:bg-white/5 cursor-pointer"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </section>
          </div>
        )}

        {/* Empty State */}
        {queue.length === 0 && (
          <section className="bg-[#140A1F] border border-[#C77DFF]/10 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-[#1C0F2B] border border-[#C77DFF]/15 flex items-center justify-center text-brand-magenta">
              <Sparkles size={18} className="animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Queue is Currently Empty</h3>
              <p className="text-[10px] text-[#C77DFF]/80 leading-relaxed">
                Drag product packaging shots into the zone above, or select an entire directory folder of files to initiate Sayanita's AI Beauty Commerce operating pipeline!
              </p>
            </div>
          </section>
        )}

      </main>

      {/* Editing overlay modal */}
      {editingItem && editingItem.extracted && (
        <div className="fixed inset-0 z-50 bg-[#080012]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#140A1F] border border-[#C77DFF]/20 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-5 text-left">
            <div className="flex justify-between items-center border-b border-[#C77DFF]/10 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Edit Extracted PIM Fields</span>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-lg hover:bg-white/5 text-orchid-text-muted cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="max-h-[350px] overflow-y-auto space-y-4 pr-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-orchid-text-muted uppercase block">SKU Code</label>
                  <input
                    type="text"
                    value={editingItem.extracted.sku || ""}
                    onChange={(e) => {
                      const updated = { ...editingItem.extracted, sku: e.target.value };
                      setQueue(prev => prev.map(q => q.id === editingItem.id ? { ...q, extracted: updated } : q));
                      setEditingItem({ ...editingItem, extracted: updated });
                    }}
                    className="admin-glass-input text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-orchid-text-muted uppercase block">Brand</label>
                  <input
                    type="text"
                    value={editingItem.extracted.brand || ""}
                    onChange={(e) => {
                      const updated = { ...editingItem.extracted, brand: e.target.value };
                      setQueue(prev => prev.map(q => q.id === editingItem.id ? { ...q, extracted: updated } : q));
                      setEditingItem({ ...editingItem, extracted: updated });
                    }}
                    className="admin-glass-input text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-orchid-text-muted uppercase block">Product Title</label>
                <input
                  type="text"
                  value={editingItem.extracted.title || ""}
                  onChange={(e) => {
                    const updated = { ...editingItem.extracted, title: e.target.value };
                    setQueue(prev => prev.map(q => q.id === editingItem.id ? { ...q, extracted: updated } : q));
                    setEditingItem({ ...editingItem, extracted: updated });
                  }}
                  className="admin-glass-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-orchid-text-muted uppercase block">Curated Price</label>
                  <input
                    type="number"
                    value={editingItem.extracted.price || 0}
                    onChange={(e) => {
                      const price = parseInt(e.target.value) || 0;
                      const mrp = editingItem.extracted.mrp || 0;
                      const discount = calculateDiscount(mrp, price);
                      const updated = { ...editingItem.extracted, price, discount_percent: discount };
                      setQueue(prev => prev.map(q => q.id === editingItem.id ? { ...q, extracted: updated } : q));
                      setEditingItem({ ...editingItem, extracted: updated });
                    }}
                    className="admin-glass-input text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-orchid-text-muted uppercase block">MRP</label>
                  <input
                    type="number"
                    value={editingItem.extracted.mrp || 0}
                    onChange={(e) => {
                      const mrp = parseInt(e.target.value) || 0;
                      const price = editingItem.extracted.price || 0;
                      const discount = calculateDiscount(mrp, price);
                      const updated = { ...editingItem.extracted, mrp, discount_percent: discount };
                      setQueue(prev => prev.map(q => q.id === editingItem.id ? { ...q, extracted: updated } : q));
                      setEditingItem({ ...editingItem, extracted: updated });
                    }}
                    className="admin-glass-input text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-orchid-text-muted uppercase block">Skincare Description</label>
                <textarea
                  rows={3}
                  value={editingItem.extracted.description || ""}
                  onChange={(e) => {
                    const updated = { ...editingItem.extracted, description: e.target.value };
                    setQueue(prev => prev.map(q => q.id === editingItem.id ? { ...q, extracted: updated } : q));
                    setEditingItem({ ...editingItem, extracted: updated });
                  }}
                  className="admin-glass-input text-xs py-2 w-full resize-none"
                />
              </div>
            </div>

            <button
              onClick={() => setEditingItem(null)}
              className="w-full h-10 rounded-xl bg-brand-gradient text-white text-[11px] font-bold uppercase tracking-widest cursor-pointer"
            >
              Done Overrides
            </button>
          </div>
        </div>
      )}

      {/* Floating admin mobile dock override */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#120018]/90 backdrop-blur-md border-t border-[#C77DFF]/15 px-3 py-2 flex items-center justify-around select-none">
        <Link href="/admin" className="flex flex-col items-center gap-0.5 text-orchid-text-muted hover:text-white transition-colors">
          <BarChart3 size={16} />
          <span className="text-[7.5px] uppercase font-bold tracking-wider">Dashboard</span>
        </Link>
        <Link href="/admin/bulk-import" className="flex flex-col items-center gap-0.5 text-brand-magenta hover:text-brand-magenta transition-colors">
          <Upload size={16} />
          <span className="text-[7.5px] uppercase font-bold tracking-wider">AI Factory</span>
        </Link>
        <Link href="/admin/ai-center" className="flex flex-col items-center gap-0.5 text-orchid-text-muted hover:text-white transition-colors">
          <Sparkles size={16} />
          <span className="text-[7.5px] uppercase font-bold tracking-wider">AI Center</span>
        </Link>
        <Link href="/shop" className="flex flex-col items-center gap-0.5 text-orchid-text-muted hover:text-white transition-colors">
          <BookOpen size={16} />
          <span className="text-[7.5px] uppercase font-bold tracking-wider">Shop View</span>
        </Link>
      </nav>

    </div>
  );
}

function calculateDiscount(mrp: number, price: number): number {
  if (mrp <= 0 || price <= 0 || price >= mrp) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}
