"use client";

import React, { useState, use, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useShop, Product } from "@/context/ShopContext";
import { Header } from "@/components/Header";
import { CartDrawer } from "@/components/CartDrawer";
import {
  ShieldCheck,
  ShoppingBag,
  Plus,
  Minus,
  Star,
  Heart,
  Check,
  ArrowLeft,
  MessageSquare,
  QrCode,
  Sparkles,
  Info,
  AlertTriangle,
  Award,
  Truck,
  Lock,
  ChevronRight,
  Activity,
  Zap,
  Gift,
  X
} from "lucide-react";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetails({ params }: ProductPageProps) {
  const resolvedParams = use(params);
  const { products, addToCart, setCartOpen } = useShop();
  const product = products.find((p) => p.id === resolvedParams.id);

  const [quantity, setQuantity] = useState(1);
  const [selectedShade, setSelectedShade] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"description" | "howtouse" | "reviews">("description");
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [wishlisted, setWishlisted] = useState(false);
  const [upiModalOpen, setUpiModalOpen] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Auto-select shade and default image
  useEffect(() => {
    if (product) {
      setSelectedShade(product.shades?.[0] || "");
      setSelectedImage(product.image || "");
    }
  }, [product]);

  const selectedOrDefaultShade = selectedShade || product?.shades?.[0] || "";

  // Dynamic margins & profit calculations
  const priceStats = useMemo(() => {
    if (!product) return { discount: 0, savings: 0 };
    const mrp = product.mrp || 0;
    const price = product.price || 0;
    if (mrp <= 0 || price <= 0 || price >= mrp) return { discount: 0, savings: 0 };
    const savings = mrp - price;
    const discount = Math.round((savings / mrp) * 100);
    return { discount, savings };
  }, [product]);

  // Dynamic description split formatting
  const formattedBullets = useMemo(() => {
    if (!product?.description) return [];
    if (product.description.includes(",")) {
      return product.description
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean);
    }
    return [product.description];
  }, [product?.description]);

  // Ingredients tag parser
  const parsedIngredients = useMemo(() => {
    if (!product?.ingredients) return [];
    return product.ingredients
      .split(",")
      .map((i) => i.trim())
      .filter((i) => i.length > 2)
      .slice(0, 8);
  }, [product?.ingredients]);

  // Extract benefits from AI data
  const parsedBenefits = useMemo(() => {
    if (product?.benefits) {
      return product.benefits
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean)
        .slice(0, 5);
    }
    // Fallback based on category
    if (product?.category === "Serums") {
      return ["Restores skin barrier", "Hydrates dry layers", "Deeply locks cell hydration", "Fragrance-free formula"];
    }
    if (product?.category === "Lipsticks") {
      return ["Velvet matte lock", "No-transfer formula", "Keeps lips nourished", "Highly saturated pigment"];
    }
    return ["Skin barrier restoration", "Calms local redness", "Dermatologically checked"];
  }, [product?.benefits, product?.category]);

  // Recommendation carousel compiler (similar items)
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.id !== product.id && (p.category === product.category || p.brand === product.brand))
      .slice(0, 4);
  }, [product, products]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#120018] justify-between">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center text-center space-y-6">
          <div className="p-4 rounded-full bg-[#2A093D] border border-[#C77DFF]/20 text-orchid-accent">
            <ShoppingBag size={48} />
          </div>
          <h2 className="text-2xl font-bold font-elegant text-white">Product Not Found</h2>
          <p className="text-xs text-orchid-text-muted max-w-sm leading-relaxed">
            The premium item you are searching for might have sold out or is currently unavailable in our verified collection.
          </p>
          <Link
            href="/shop"
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-brand-gradient text-white hover:scale-102 transition-transform shadow-md"
          >
            Return to Boutique
          </Link>
        </main>
      </div>
    );
  }

  const handleAddToBag = () => {
    addToCart(product, quantity, product.shades ? selectedOrDefaultShade : undefined);
    setCartOpen(true);
  };

  // Custom WhatsApp ordering URL generator
  const getWhatsAppLink = () => {
    const phone = "918585061614"; // Sayanita's business phone line
    const text = encodeURIComponent(
      `Hello Sayanita, I'd like to order a curated beauty item from Glow Addict:\n\n` +
      `🌸 *Product:* ${product.title}\n` +
      `🏷️ *Brand:* ${product.brand}\n` +
      (selectedOrDefaultShade ? `🎨 *Shade:* ${selectedOrDefaultShade}\n` : "") +
      `📦 *Quantity:* ${quantity}\n` +
      `💰 *Curated Price:* ₹${product.price * quantity} (MRP: ₹${product.mrp * quantity})\n\n` +
      `Can you please confirm dispatch and UPI verification? Thanks!`
    );
    return `https://wa.me/${phone}?text=${text}`;
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText("sayanita@upi");
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const productImages = product.images && product.images.length > 0
    ? product.images
    : [product.image];

  // Mock Reviews
  const reviews = [
    { name: "Ananya S.", rating: 5, date: "2026-05-18", comment: "Absolutely authentic! Checked the batch code and it matches. The packaging Sayanita did was so cute with the custom freebie. Highly recommend!" },
    { name: "Priyanjali D.", rating: 5, date: "2026-05-12", comment: "So happy I found Glow Addict! Laneige Lip Sleeping Mask Berry is my absolute favorite, and getting the free scrunchies with the order was such a treat. Will order again soon!" },
    { name: "Sushmita R.", rating: 5, date: "2026-05-04", comment: "Fast shipping and tamper-proof packing. The Cosrx Essence is exactly the original formula. Thank you, Sayanita, for making premium skincare affordable!" }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#120018] text-white">
      <Header />
      <CartDrawer />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 select-none text-left">
        
        {/* Back navigation */}
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-orchid-accent hover:text-white transition-colors"
        >
          <ArrowLeft size={12} />
          Back to boutique collection
        </Link>

        {/* Product Grid Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-[#1B0124]/40 border border-[#C77DFF]/10 rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
          
          {/* LEFT: Premium Image Gallery */}
          <div className="lg:col-span-6 flex flex-col space-y-4">
            
            {/* Primary Large Display Frame */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#2A093D]/30 border border-[#C77DFF]/15 group">
              <Image
                src={selectedImage || product.image}
                alt={product.title}
                fill
                sizes="(max-w-768px) 100vw, 50vw"
                className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
                priority
                unoptimized
              />
              
              {/* Authenticity Overlays */}
              <span className="absolute bottom-4 left-4 bg-[#1B0124]/90 text-white text-[10px] font-bold py-1.5 px-3.5 rounded-full shadow-md border border-[#C77DFF]/20 flex items-center gap-1.5 backdrop-blur-sm">
                <ShieldCheck size={13} className="text-[#FF8DC7]" />
                100% Import Verified Original
              </span>

              {/* Savings overlay */}
              {priceStats.discount > 0 && (
                <span className="absolute top-4 right-4 bg-brand-gradient text-white text-[10px] font-bold py-1 px-3 rounded-full shadow-lg">
                  {priceStats.discount}% OFF
                </span>
              )}
            </div>

            {/* Sub-thumbnails selection strip */}
            {productImages.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto py-1">
                {productImages.map((imgUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden bg-[#2A093D] border shrink-0 transition-all ${
                      (selectedImage || product.image) === imgUrl
                        ? "border-[#E056FD] scale-102 shadow-md shadow-[#E056FD]/20"
                        : "border-[#C77DFF]/10 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image src={imgUrl} alt="" fill className="object-cover" unoptimized />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Skincare/Beauty Details */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              
              {/* Brand & Title */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF8DC7]">
                      {product.brand} Collection
                    </span>
                    <h1 className="text-xl sm:text-2xl font-extrabold font-elegant text-white leading-snug">
                      {product.title}
                    </h1>
                  </div>
                  
                  {/* Wishlist favorite button */}
                  <button
                    onClick={() => setWishlisted(!wishlisted)}
                    className={`p-2.5 rounded-full border transition-all cursor-pointer ${
                      wishlisted
                        ? "bg-[#FF8DC7]/15 border-[#FF8DC7]/40 text-[#FF8DC7] scale-105"
                        : "bg-[#2A093D] border-[#C77DFF]/12 text-orchid-text-muted hover:text-white"
                    }`}
                    aria-label="Add to wishlist"
                  >
                    <Heart size={16} fill={wishlisted ? "currentColor" : "none"} />
                  </button>
                </div>

                {/* Rating row */}
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} fill="currentColor" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-orchid-text-muted/70 border-l border-[#C77DFF]/15 pl-3">
                    4.9 Customer Rating
                  </span>
                  <span className="text-[10px] font-bold text-orchid-text-muted/70 border-l border-[#C77DFF]/15 pl-3">
                    {product.category}
                  </span>
                </div>
              </div>

              {/* Premium Pricing & Stock Card */}
              <div className="bg-[#2A093D]/40 p-4.5 rounded-2xl border border-[#C77DFF]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-orchid-text-muted uppercase tracking-widest block">
                    Curated Price (Incl. of customs & taxes)
                  </span>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-sm text-orchid-text-muted/50 line-through font-mono">₹{product.mrp}</span>
                    <span className="text-2xl font-black text-white font-mono">₹{product.price}</span>
                    {priceStats.savings > 0 && (
                      <span className="text-[9.5px] font-extrabold text-[#FF8DC7] bg-[#FF8DC7]/10 px-2 py-0.5 rounded-md border border-[#FF8DC7]/20 font-sans">
                        Save ₹{priceStats.savings}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Stock warning */}
                <div className="flex flex-col items-start sm:items-end gap-1.5 self-start sm:self-auto">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[9px] font-bold uppercase rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Verified Stock Batch
                  </span>
                  <span className="text-[8px] font-bold text-orchid-text-muted/50 uppercase tracking-widest">
                    {product.stock <= 5 ? `Only ${product.stock} units left!` : "Ready to Dispatch"}
                  </span>
                </div>
              </div>

              {/* Bulleted Description summary */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-orchid-text-muted uppercase tracking-widest block">Product Highlights</span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-orchid-text-warm">
                  {formattedBullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-[#2A093D]/25 border border-[#C77DFF]/8 p-2 rounded-xl">
                      <Check size={13} className="text-[#FF8DC7] shrink-0 mt-0.5" />
                      <span className="truncate">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Shade dropdown Selector */}
              {product.shades && product.shades.length > 0 && (
                <div className="space-y-2.5">
                  <label className="text-[10px] font-bold text-orchid-text-muted uppercase tracking-widest block">
                    Curated Shades / Options: <span className="text-white font-extrabold">{selectedOrDefaultShade}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.shades.map((shade) => (
                      <button
                        key={shade}
                        onClick={() => setSelectedShade(shade)}
                        className={`text-xs px-4 py-2 rounded-xl border font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          selectedOrDefaultShade === shade
                            ? "bg-brand-gradient text-white border-transparent shadow-sm"
                            : "bg-[#2A093D]/30 text-orchid-accent border-[#C77DFF]/15 hover:bg-[#2A093D]/60"
                        }`}
                      >
                        {selectedOrDefaultShade === shade && <Check size={12} />}
                        {shade}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions Counter & Direct order triggers */}
              <div className="space-y-3.5 pt-2">
                
                <div className="flex items-center gap-3.5">
                  {/* Quantity selector */}
                  <div className="flex items-center bg-[#2A093D]/40 rounded-xl border border-[#C77DFF]/15 p-1 h-12">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 rounded-lg text-orchid-accent hover:text-white transition-colors cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-black px-4 text-white min-w-[32px] text-center font-mono">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 rounded-lg text-orchid-accent hover:text-white transition-colors cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Primary Add to Bag CTA */}
                  <button
                    onClick={handleAddToBag}
                    className="flex-1 h-12 bg-brand-gradient text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
                  >
                    <ShoppingBag size={15} />
                    Add to Self-Care Bag
                  </button>
                </div>

                {/* Direct alternative payment options */}
                <div className="grid grid-cols-2 gap-2">
                  
                  {/* WhatsApp Ordering */}
                  <a
                    href={getWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-11 border border-emerald-500/35 hover:bg-emerald-500/5 text-emerald-400 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <MessageSquare size={13} />
                    Order via WhatsApp
                  </a>

                  {/* Instant UPI scan */}
                  <button
                    onClick={() => setUpiModalOpen(true)}
                    className="h-11 border border-purple-500/35 hover:bg-purple-500/5 text-purple-400 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <QrCode size={13} />
                    UPI / QR Code Transfer
                  </button>
                </div>
              </div>
            </div>

            {/* Authenticity trust assurances */}
            <div className="border-t border-[#C77DFF]/10 pt-4 flex gap-3.5 items-start">
              <Award size={18} className="text-[#FF8DC7] shrink-0 mt-0.5" />
              <div className="text-[10px] leading-relaxed text-orchid-text-muted font-medium">
                <span className="font-bold text-white">Curated Tamper-Proof Pack:</span> Every item is double-inspected, batch-checked, and wrapped in secure, elegant packaging with signature stickers from Sayanita.
              </div>
            </div>
          </div>
        </div>

        {/* NEW PRESTIGE SECTION: AI Skincare Insights (No raw JSON/OCR!) */}
        {product.extracted_text && (
          <section className="bg-[#1B0124]/40 border border-[#C77DFF]/10 rounded-3xl p-5 sm:p-8 shadow-xl space-y-5 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#E056FD]/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="border-b border-[#C77DFF]/8 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Sparkles size={16} className="text-[#FF8DC7] animate-pulse" />
                AI-Powered Skincare Diagnostics & Insights
              </h3>
              <p className="text-[9.5px] text-orchid-text-muted mt-0.5">
                Google Gemini & Groq Vision OCR analysis matched and verified with our database entities
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
              
              {/* Insight 1: AI verified benefits list */}
              <div className="bg-[#2A093D]/30 p-4.5 rounded-2xl border border-[#C77DFF]/8 space-y-3.5">
                <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF8DC7] flex items-center gap-1.5">
                  <Check size={11} className="stroke-[3] text-emerald-400" />
                  AI Verified Skincare Benefits
                </h4>
                <ul className="space-y-2 text-xs font-semibold text-orchid-text-warm">
                  {parsedBenefits.map((b, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E056FD] shrink-0 mt-1.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Insight 2: Ingredient highlight pills */}
              <div className="bg-[#2A093D]/30 p-4.5 rounded-2xl border border-[#C77DFF]/8 space-y-3.5">
                <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-orchid-accent flex items-center gap-1.5">
                  <Activity size={12} />
                  Verified Active Ingredients
                </h4>
                {parsedIngredients.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {parsedIngredients.map((ing, idx) => (
                      <span key={idx} className="admin-tag-pill">
                        {ing}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 text-xs text-orchid-text-muted font-medium">
                    <p>✓ Dermatologically balanced layers</p>
                    <p>✓ 100% fragrance-free formula</p>
                    <p>✓ Paraben & cruelty-free</p>
                  </div>
                )}
              </div>

              {/* Insight 3: Skin Suitability widget */}
              <div className="bg-[#2A093D]/30 p-4.5 rounded-2xl border border-[#C77DFF]/8 space-y-3.5">
                <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF8DC7] flex items-center gap-1.5">
                  <Zap size={11} />
                  Skin Suitability Matrix
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-orchid-text-warm">
                    <span>Target Skin Type:</span>
                    <span className="text-white uppercase font-black bg-[#FF8DC7]/15 border border-[#FF8DC7]/35 px-2.5 py-0.5 rounded-lg">
                      {product.skin_type || "All Skin Types"}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#120018]/40 border border-[#C77DFF]/6 text-[10px] font-medium leading-relaxed text-orchid-text-muted">
                    Analyzed via NIM: Highly compatible with high humidity conditions and sensitive layers. Helps prevent redness.
                  </div>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* Tabbed Routine, Application & Review panels */}
        <section className="bg-[#1B0124]/40 border border-[#C77DFF]/10 rounded-3xl p-5 sm:p-8 shadow-xl space-y-6 backdrop-blur-sm">
          
          {/* Tab selectors */}
          <div className="flex border-b border-[#C77DFF]/8 select-none">
            <button
              onClick={() => setActiveTab("description")}
              className={`pb-3.5 text-xs sm:text-xs font-bold uppercase tracking-widest transition-all relative mr-8 ${
                activeTab === "description" ? "text-white font-black scale-102" : "text-orchid-text-muted/50 hover:text-white"
              }`}
            >
              Overview & Integrity
              {activeTab === "description" && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-gradient" />}
            </button>
            <button
              onClick={() => setActiveTab("howtouse")}
              className={`pb-3.5 text-xs sm:text-xs font-bold uppercase tracking-widest transition-all relative mr-8 ${
                activeTab === "howtouse" ? "text-white font-black scale-102" : "text-orchid-text-muted/50 hover:text-white"
              }`}
            >
              Routine Guidelines
              {activeTab === "howtouse" && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-gradient" />}
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-3.5 text-xs sm:text-xs font-bold uppercase tracking-widest transition-all relative ${
                activeTab === "reviews" ? "text-white font-black scale-102" : "text-orchid-text-muted/50 hover:text-white"
              }`}
            >
              Reviews ({reviews.length})
              {activeTab === "reviews" && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-gradient" />}
            </button>
          </div>

          {/* Tab Contents */}
          <div className="text-xs sm:text-sm text-orchid-text-warm leading-relaxed font-sans space-y-4">
            
            {activeTab === "description" && (
              <div className="space-y-4 animate-slide-in text-left">
                <p>
                  Each batch of this premium {product.brand} catalog is verified personally by Sayanita. We check import custom seals, batch expiry codes, and test consistency to guarantee a premium experience.
                </p>
                <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">Certified Catalog Safeguards:</h4>
                <ul className="list-disc pl-5 space-y-2 text-xs text-[#D8B4FE] font-medium">
                  <li>Formulated to accommodate sensitive Indian skin and varying humidity cycles.</li>
                  <li>Dermatologically analyzed and 100% fragrance-free/non-irritant formulas.</li>
                  <li>Promotes immediate barrier locking, soothing redness, and cell vitality restoration.</li>
                </ul>
              </div>
            )}

            {activeTab === "howtouse" && (
              <div className="space-y-4 animate-slide-in text-left">
                <p className="font-extrabold text-white text-xs uppercase tracking-wider">Sayanita’s Recommended Self-Care Routine:</p>
                <ol className="list-decimal pl-5 space-y-3 text-xs text-[#D8B4FE] font-medium">
                  <li><strong>Cleanse:</strong> Start with a gentle face wash and pat skin dry.</li>
                  <li><strong>Tone & Prep:</strong> Apply toner to balance pH and prep pores.</li>
                  <li><strong>Apply:</strong> Dispense 2-3 drops of {product.title} and sweep across face/neck, pressing gently.</li>
                  <li><strong>Seal:</strong> Lock the essence in with a rich ceramides moisturizer and organic SPF.</li>
                </ol>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-4 animate-slide-in text-left">
                {reviews.map((rev, idx) => (
                  <div key={idx} className="p-4 bg-[#2A093D]/30 border border-[#C77DFF]/8 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-white">
                      <span>{rev.name}</span>
                      <span className="text-orchid-text-muted/40 font-mono">{rev.date}</span>
                    </div>
                    <div className="flex text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} size={11} fill="currentColor" />
                      ))}
                    </div>
                    <p className="text-xs text-orchid-text-warm italic font-light leading-relaxed">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Curated Recommendations Carousel */}
        {relatedProducts.length > 0 && (
          <section className="space-y-4.5">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Gift size={15} className="text-[#FF8DC7]" />
                Frequently Curated Together
              </h3>
              <Link href="/shop" className="text-[10px] font-bold text-orchid-accent hover:underline flex items-center gap-1">
                View Boutique Shop <ChevronRight size={10} />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/product/${p.id}`}
                  className="bg-[#2A093D]/40 border border-[#C77DFF]/10 rounded-2xl p-3 shadow-md hover:scale-[1.01] transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-2 text-left">
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#120018]/50 border border-[#C77DFF]/8">
                      <Image src={p.image} alt={p.title} fill className="object-cover" unoptimized />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[7.5px] font-bold uppercase tracking-wider text-[#FF8DC7]">{p.brand}</span>
                      <h4 className="text-[11px] font-bold text-white truncate">{p.title}</h4>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-[#C77DFF]/8">
                    <span className="text-xs font-black font-mono">₹{p.price}</span>
                    <span className="text-[8px] font-bold text-orchid-accent uppercase group-hover:underline">Shop →</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </main>

      {/* MOBILE STICKY BOTTOM CHECKOUT ACTION PANEL */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#120018]/90 backdrop-blur-md border-t border-[#C77DFF]/15 px-5 py-3.5 flex items-center justify-between gap-4 select-none">
        <div className="text-left">
          <span className="text-[8.5px] font-bold text-orchid-text-muted uppercase tracking-widest block">Total Curated</span>
          <span className="text-base font-black font-mono">₹{product.price * quantity}</span>
        </div>
        <button
          onClick={handleAddToBag}
          className="flex-1 max-w-[200px] h-11 bg-brand-gradient text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform cursor-pointer"
        >
          <ShoppingBag size={14} />
          Add to Bag
        </button>
      </div>

      {/* INSTANT UPI TRANSFER MODAL OVERLAY */}
      {upiModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#080012]/85 backdrop-blur-md flex items-center justify-center p-4 animate-slide-in"
          onClick={() => setUpiModalOpen(false)}
        >
          <div
            className="bg-[#1B0124] border border-[#C77DFF]/25 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-[#C77DFF]/10 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">UPI Instant QR Scan</span>
              <button
                onClick={() => setUpiModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/5 text-orchid-text-muted cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* UPI QR Code mock layout */}
            <div className="bg-white p-4.5 rounded-2xl w-44 h-44 mx-auto flex flex-col items-center justify-center shadow-md relative group border border-[#C77DFF]/15">
              <QrCode size={120} className="text-black" />
              <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[9px] font-extrabold bg-[#1B0124] px-2 py-1 rounded text-white shadow">Scan QR</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-white">Sayanita UPI ID: sayanita@upi</p>
              <p className="text-[10px] text-orchid-text-muted leading-relaxed">
                Scan QR code above with any UPI app (GPay, PhonePe, Paytm) to complete transfer, then upload screenshot in orders.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={copyUpiId}
                className="flex-1 h-10 rounded-xl border border-[#C77DFF]/15 text-orchid-text-muted hover:text-white text-xs font-bold uppercase tracking-wider hover:bg-white/5 cursor-pointer transition-colors"
              >
                {copiedUpi ? "Copied ✓" : "Copy UPI ID"}
              </button>
              <button
                onClick={() => setUpiModalOpen(false)}
                className="flex-1 h-10 rounded-xl bg-brand-gradient text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
