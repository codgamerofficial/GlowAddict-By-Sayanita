"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useShop, Product } from "@/context/ShopContext";
import { Package, TrendingUp, AlertTriangle, PackageX, Sparkles } from "lucide-react";
import AIUploadZone from "./AIUploadZone";
import type { ExtractedProduct } from "./AIUploadZone";
import ProductTable from "./ProductTable";
import ProductEditorModal from "./ProductEditorModal";
import { ToastProvider, useToast } from "./AdminToast";
import "@/app/admin/admin-inventory.css";

function AdminInventoryInner() {
  const {
    products,
    adminAddProduct,
    adminRemoveProduct,
    adminUpdateProduct,
    adminDuplicateProduct,
    adminArchiveProduct,
  } = useShop();

  const toast = useToast();
  const [adminApiKey, setAdminApiKey] = useState("");
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      let key = sessionStorage.getItem("glow_admin_api_key") || "";
      if (!key && process.env.NEXT_PUBLIC_ADMIN_API_KEY) {
        key = process.env.NEXT_PUBLIC_ADMIN_API_KEY;
        sessionStorage.setItem("glow_admin_api_key", key);
      }
      setAdminApiKey(key);
    }
  }, []);

  const persistApiKey = (key: string) => {
    setAdminApiKey(key);
    if (typeof window !== "undefined") sessionStorage.setItem("glow_admin_api_key", key);
  };

  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => (p.status || "active") !== "archived").length;
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
    const outOfStock = products.filter((p) => p.stock === 0).length;
    return { total, active, lowStock, outOfStock };
  }, [products]);

  const handleExtracted = useCallback((data: ExtractedProduct, imageUrl: string, status: string) => {
    const newId = `prod-ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newProduct: Product = {
      id: newId,
      sku: data.skuHint || `AI-${Date.now().toString(36).toUpperCase()}`,
      title: data.title,
      brand: data.brand,
      category: data.category,
      price: data.price,
      mrp: data.mrp,
      stock: 0,
      image: imageUrl,
      shades: data.shades,
      authenticity_flag: true,
      description: data.description,
      extracted_text: data.extractedText,
      slug: data.slug,
      ingredients: data.ingredients,
      benefits: data.benefits,
      skin_type: data.skinType,
      product_type: data.productType,
      variant: data.variant,
      weight: data.weight,
      tags: data.tags,
      seo_title: data.seo_title,
      seo_description: data.seo_description,
      seo_keywords: data.seo_keywords,
      discount_percent: data.discount_percent,
      ai_confidence: data.ai_confidence,
      ai_extraction: (data as any).ai_extraction,
      status: "draft",
      created_at: new Date().toISOString(),
    };

    setEditProduct(newProduct);
    setModalOpen(true);

    if (status === "fallback") {
      toast.warning("Limited AI extraction", "Please review and edit product details manually.");
    } else if (status === "partial") {
      toast.warning("Partial extraction", "Some fields may need review.");
    } else {
      toast.success("Product detected", `${data.title} extracted with ${data.ai_confidence}% confidence.`);
    }
  }, [toast]);

  const handleSave = useCallback((productId: string, updates: Partial<Product>) => {
    const existing = products.find((p) => p.id === productId);
    if (existing) {
      adminUpdateProduct(productId, updates);
      toast.success("Product updated", `${updates.title || existing.title} saved successfully.`);
    } else {
      const newProduct: Product = {
        id: productId, sku: "", title: "", brand: "", category: "Skincare",
        price: 0, mrp: 0, stock: 0, image: "", authenticity_flag: true, description: "",
        ...updates,
      };
      adminAddProduct(newProduct);
      toast.success("Product published", `${newProduct.title} added to catalog.`);
    }
  }, [products, adminUpdateProduct, adminAddProduct, toast]);

  const handleEdit = useCallback((product: Product) => {
    setEditProduct(product); setModalOpen(true);
  }, []);

  const handleDuplicate = useCallback((productId: string) => {
    const prod = products.find((p) => p.id === productId);
    adminDuplicateProduct(productId);
    toast.success("Product duplicated", `${prod?.title || "Product"} copied as draft.`);
  }, [products, adminDuplicateProduct, toast]);

  const handleArchive = useCallback((productId: string) => {
    const prod = products.find((p) => p.id === productId);
    adminArchiveProduct(productId);
    toast.warning("Product archived", `${prod?.title || "Product"} moved to archive.`);
  }, [products, adminArchiveProduct, toast]);

  const handleDelete = useCallback((productId: string) => {
    const prod = products.find((p) => p.id === productId);
    adminRemoveProduct(productId);
    toast.error("Product deleted", `${prod?.title || "Product"} removed from catalog.`);
  }, [products, adminRemoveProduct, toast]);

  const statCards = [
    { label: "Total Products", value: stats.total, icon: Package, glowClass: "admin-glow-purple", iconColor: "text-amethyst" },
    { label: "Active Products", value: stats.active, icon: TrendingUp, glowClass: "admin-glow-green", iconColor: "text-[#10B981]" },
    { label: "Low Stock", value: stats.lowStock, icon: AlertTriangle, glowClass: "admin-glow-amber", iconColor: "text-[#F59E0B]" },
    { label: "Out of Stock", value: stats.outOfStock, icon: PackageX, glowClass: "admin-glow-red", iconColor: "text-[#EF4444]" },
  ];

  return (
    <>
      <div className="space-y-6 animate-slide-in text-left">
        <h2 className="text-xs md:text-sm font-extrabold uppercase tracking-widest text-foreground flex items-center gap-2">
          <Sparkles size={16} className="text-amethyst" />
          AI-Powered Inventory Operating System
        </h2>

        {/* Admin API Key Surface */}
        <div className="bg-brand-cream border border-brand-rose rounded-2xl p-5 shadow-sm">
          <label className="block text-[9px] font-bold uppercase tracking-wider text-foreground/60 mb-1.5">
            Admin API Key Guard
          </label>
          <input type="password" value={adminApiKey} onChange={(e) => persistApiKey(e.target.value)}
            placeholder="Paste master API key to unlock Gemini Vision features…" aria-label="Admin API key"
            className="admin-glass-input" />
          <p className="text-[9px] text-foreground/50 mt-2">Stored securely in session storage. Enables multi-engine label translation.</p>
        </div>

        {/* AI Upload Zone — PRIMARY HERO SECTION */}
        <div className="bg-gradient-to-br from-brand-cream to-brand-peach border border-brand-rose rounded-3xl p-6 shadow-md relative overflow-hidden">
          {/* Subtle decorative glow bubble */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amethyst/5 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="space-y-4 relative z-10">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-rose border border-brand-rose text-amethyst text-[9px] font-extrabold uppercase tracking-widest mb-2.5 shadow-sm">
                <Sparkles size={10} className="animate-pulse" />
                Gemini Vision AI Processing Active
              </span>
              <h3 className="text-base md:text-lg font-extrabold text-foreground tracking-tight flex items-center gap-2">
                Automated Cataloging Hero Dropzone
              </h3>
              <p className="text-xs text-foreground/75 leading-relaxed max-w-2xl mt-1">
                Simply drop, select or paste an image URL. Our dual-engine classical OCR + vision pipeline scans package details, filters out generic hallucinations, and formats catalog listings in seconds.
              </p>
            </div>
            <AIUploadZone onExtracted={handleExtracted} adminApiKey={adminApiKey} />
          </div>
        </div>

        {/* Stats Cards Dashboard Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <div key={stat.label}
              className={`admin-stat-card bg-brand-cream border border-brand-rose p-4 rounded-2xl ${stat.glowClass} shadow-sm`}>
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <span className="text-[9px] font-bold text-foreground/60 uppercase tracking-widest block truncate">{stat.label}</span>
                  <h3 className="text-xl md:text-2xl font-extrabold text-foreground mt-1 tracking-tight">{stat.value}</h3>
                </div>
                <div className={`p-2.5 rounded-xl bg-background border border-brand-rose ${stat.iconColor} shrink-0 shadow-sm`}>
                  <stat.icon size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Product Table List */}
        <div className="space-y-3">
          <h3 className="text-xs md:text-sm font-extrabold uppercase tracking-widest text-foreground">
            Catalog List Inventory ({products.length} Products)
          </h3>
          <ProductTable products={products} onEdit={handleEdit} onDuplicate={handleDuplicate}
            onArchive={handleArchive} onDelete={handleDelete} />
        </div>
      </div>

      {/* Product Editor Modal - RENDERED OUTSIDE OF ANIMATE-SLIDE-IN TO PREVENT COORDINATE TRANSLATION BUG */}
      <ProductEditorModal product={editProduct} isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditProduct(null); }}
        onSave={handleSave} adminApiKey={adminApiKey} />
    </>
  );
}

export default function AdminInventory() {
  return (
    <ToastProvider>
      <AdminInventoryInner />
    </ToastProvider>
  );
}
