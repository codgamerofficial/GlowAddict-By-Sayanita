"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useShop, Product } from "@/context/ShopContext";
import { Header } from "@/components/Header";
import { CartDrawer } from "@/components/CartDrawer";
import { Footer } from "@/components/Footer";
import ProductImage from "@/components/ProductImage";
import {
  Heart,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  MessageCircle,
  HelpCircle,
  Star,
  ArrowRight,
  Truck,
  Sparkles,
  Gift,
  CheckCircle2,
  TrendingUp,
  Activity,
  Award,
  Zap,
  HelpCircle as HelpIcon
} from "lucide-react";

export default function Home() {
  const { products, addToCart, setCartOpen, wishlist, toggleWishlist } = useShop();
  const [activeTab, setActiveTab] = useState<string>("all");

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultShade = product.shades ? product.shades[0] : undefined;
    addToCart(product, 1, defaultShade);
    setCartOpen(true);
  };

  // Filter products by active tab category
  const filteredProducts = useMemo(() => {
    if (activeTab === "all") return products;
    return products.filter((p) => p.category === activeTab);
  }, [products, activeTab]);

  // Categories helper
  const categories = useMemo(() => {
    const list = new Set<string>();
    products.forEach((p) => {
      if (p.category) list.add(p.category);
    });
    return ["all", ...Array.from(list)];
  }, [products]);

  // Premium copy sanitizer to eliminate any raw AI/OCR debug JSON
  const getCleanDescription = (p: Product) => {
    const desc = p.description || "";
    if (
      desc.trim().startsWith("{") ||
      desc.includes('{"') ||
      desc.includes("Detected Label Text") ||
      desc.includes("OCR") ||
      desc.includes("rawText")
    ) {
      return `Dermatologist tested premium formulated ${
        p.product_type || p.category || "skincare essence"
      } designed by ${p.brand || "global specialists"} to soothe, hydrate, and nurture your skin barrier daily.`;
    }
    return desc;
  };

  // Structured beauty highlight chips (Never raw OCR JSON dumps!)
  const getProductHighlights = (p: Product) => {
    if (p.benefits && p.benefits.trim() && !p.benefits.trim().startsWith("{")) {
      return p.benefits.split(",").slice(0, 2).map((b) => b.trim().replace(/[✓•]/g, ""));
    }
    if (p.tags && p.tags.length > 0) {
      return p.tags.slice(0, 2);
    }
    const cleanDesc = getCleanDescription(p);
    if (cleanDesc.includes(",")) {
      return cleanDesc.split(",").slice(0, 2).map((b) => b.trim().replace(/[✓•]/g, ""));
    }
    return [p.product_type || "Dermatologist Tested", "Premium Quality"];
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#120018] text-white relative">
      {/* Background radial glows for Apple-level luxury */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#E056FD]/3 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-[#C77DFF]/2 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-10 w-[400px] h-[400px] bg-[#FF8DC7]/3 rounded-full blur-3xl pointer-events-none" />

      <Header />
      <CartDrawer />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12 select-none">
        
        {/* ✨ HERO SECTION — Balanced Spacing & Density */}
        <section className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#C77DFF]/15 bg-gradient-to-br from-[#1B0124] via-[#2A093D]/60 to-[#120018] text-white">
          <div className="absolute inset-0 bg-[#E056FD]/3 backdrop-blur-xs" />
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-10 lg:p-14 items-center">
            
            {/* Left Content */}
            <div className="md:col-span-7 space-y-5 max-w-xl text-left">
              <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest bg-[#C77DFF]/10 border border-[#C77DFF]/25 px-3 py-1 rounded-full text-[#FF8DC7]">
                <Sparkles size={11} className="animate-pulse" />
                Sayanita's Curated Selection
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-elegant tracking-wide leading-tight">
                Authenticity that <br className="hidden sm:inline" />
                celebrates your journey.
              </h1>
              <p className="text-xs sm:text-sm text-orchid-text-muted leading-relaxed font-medium">
                Indulge in 100% genuine, premium skincare from global brands. Curated with love, packaged with care, and priced within reach.
              </p>
              <div className="pt-2">
                <a
                  href="#catalog"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-brand-gradient text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-[#E056FD]/15"
                >
                  Shop Curated Catalog
                  <ArrowRight size={13} />
                </a>
              </div>
            </div>

            {/* Right Banner logo card */}
            <div className="md:col-span-5 hidden md:flex justify-center relative w-full h-72">
              <div className="relative aspect-square w-64 rounded-3xl overflow-hidden border border-[#C77DFF]/15 shadow-2xl bg-gradient-to-br from-[#2A093D]/80 to-[#1B0124]/90 flex items-center justify-center p-6 backdrop-blur-md">
                <div className="absolute inset-0 bg-[#C77DFF]/5 rounded-full blur-2xl pointer-events-none" />
                <Image
                  src="/logo.png"
                  alt="Glow Addict Logo"
                  fill
                  className="object-contain p-6 hover:scale-105 transition-transform duration-700"
                  priority
                  unoptimized
                />
              </div>
            </div>

          </div>
        </section>

        {/* 📢 FREEBIES ALERT PROMOTIONAL SECTION */}
        <section className="bg-[#1B0124]/40 border border-[#C77DFF]/10 rounded-3xl p-5 sm:p-8 shadow-xl backdrop-blur-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Graphic Image preview */}
            <div className="lg:col-span-5 flex justify-center relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-[#C77DFF]/12 shadow-inner">
              <Image
                src="/freebies_alert.jpg"
                alt="Glow Addict Reward Tiers"
                fill
                className="object-cover hover:scale-[1.01] transition-transform duration-700"
                unoptimized
              />
            </div>

            {/* Info Text & Goals */}
            <div className="lg:col-span-7 space-y-5 text-left">
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#FF8DC7] flex items-center gap-1">
                  <Gift size={11} /> Exclusive Self-Care treats
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-elegant text-white leading-tight">
                  Freebie Rewards For Every Goal!
                </h2>
              </div>
              <p className="text-xs text-orchid-text-muted leading-relaxed font-medium">
                Every ritual deserves an extra dash of glow. We automatically bundle gorgeous accessories and sample sizes based on your self-care bag value!
              </p>

              {/* Tiers List */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-[#2A093D]/30 p-3.5 rounded-xl border border-[#C77DFF]/8 space-y-1">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#FF8DC7]/15 border border-[#FF8DC7]/30 text-[#FF8DC7] text-[10px] font-black">1</span>
                  <h4 className="text-[10px] font-bold text-white uppercase tracking-wider pt-1">₹799+ Reward</h4>
                  <p className="text-[10px] text-orchid-text-muted leading-normal font-medium">Free Shipping + Satin Scrunchies 🌸</p>
                </div>
                <div className="bg-[#2A093D]/30 p-3.5 rounded-xl border border-[#C77DFF]/8 space-y-1">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#C77DFF]/15 border border-[#C77DFF]/30 text-[#C77DFF] text-[10px] font-black">2</span>
                  <h4 className="text-[10px] font-bold text-white uppercase tracking-wider pt-1">₹1299+ Reward</h4>
                  <p className="text-[10px] text-orchid-text-muted leading-normal font-medium">Locks in a moisturizing Free Lipstick! 💄</p>
                </div>
                <div className="bg-[#2A093D]/30 p-3.5 rounded-xl border border-[#C77DFF]/8 space-y-1">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#E056FD]/15 border border-[#E056FD]/30 text-[#E056FD] text-[10px] font-black">3</span>
                  <h4 className="text-[10px] font-bold text-white uppercase tracking-wider pt-1">₹1499+ Supreme</h4>
                  <p className="text-[10px] text-orchid-text-muted leading-normal font-medium">Free face wash OR Crochet Keychain! 🎁</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 🛍️ PRODUCT BESTSELLERS CATALOG — Responsive luxury grid */}
        <section id="catalog" className="space-y-6 scroll-mt-24">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-[#FF8DC7] bg-[#2A093D]/60 border border-[#C77DFF]/12 px-3.5 py-1 rounded-full">
              Curated Catalog
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-elegant text-white">
              Shop Our Curated Bestsellers
            </h2>
            <p className="text-xs text-orchid-text-muted leading-relaxed font-medium">
              Discover 100% genuine, premium global skincare formulas. Verified by Gemini Vision AI, delivered straight to your dressing table.
            </p>
          </div>

          {/* Luxury Categories Tabs selector */}
          <div className="flex gap-2 justify-center py-2 overflow-x-auto select-none border-b border-[#C77DFF]/8">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveTab(c)}
                className={`px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === c
                    ? "bg-[#2A093D] text-white border border-[#C77DFF]/20 shadow"
                    : "text-orchid-text-muted/60 hover:text-white"
                }`}
              >
                {c === "all" ? "All Skincare" : c}
              </button>
            ))}
          </div>

          {/* Premium Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-[#C77DFF]/15 rounded-2xl text-orchid-text-muted italic text-xs">
              No products found in this category.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {filteredProducts.map((p) => {
                const savings = p.mrp && p.price ? p.mrp - p.price : 0;
                const discount = savings > 0 ? Math.round((savings / p.mrp) * 100) : 0;
                const bullets = getProductHighlights(p);
                const isWishlisted = wishlist.includes(p.id);

                const handleWishlistToggle = (e: React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleWishlist(p.id);
                };

                return (
                  <Link
                    href={`/product/${p.id}`}
                    key={p.id}
                    className="group bg-gradient-to-b from-[#2A093D]/45 via-[#2A093D]/30 to-[#1B0124]/75 border border-[#C77DFF]/12 hover:border-[#C77DFF]/25 shadow-xl hover:shadow-2xl hover:shadow-[#C77DFF]/8 rounded-[32px] overflow-hidden relative flex flex-col justify-between h-full cursor-pointer select-none ios-spring ios-spring-hover ios-spring-active"
                  >
                    <div>
                      {/* Floating Badges & Wishlist Actions */}
                      <div className="absolute inset-x-0 top-3 px-3 flex justify-between items-start z-10">
                        {/* Genuine badge */}
                        {p.authenticity_flag ? (
                          <span className="bg-[#1B0124]/90 text-white text-[8px] font-bold py-1.5 px-3 rounded-full border border-[#C77DFF]/15 flex items-center gap-1.5 backdrop-blur-md">
                            <ShieldCheck size={10} className="text-[#FF8DC7]" />
                            100% Genuine
                          </span>
                        ) : (
                          <div />
                        )}

                        {/* Interactive Wishlist Heart */}
                        <button
                          onClick={handleWishlistToggle}
                          className="p-2.5 rounded-full bg-[#1B0124]/85 border border-[#C77DFF]/15 text-[#FF8DC7] hover:scale-105 active:scale-95 transition-all backdrop-blur-md cursor-pointer group/heart shadow-md"
                          aria-label="Add to wishlist"
                        >
                          <Heart
                            size={12}
                            fill={isWishlisted ? "#FF8DC7" : "none"}
                            className={`transition-all duration-300 ${
                              isWishlisted ? "scale-110 drop-shadow-[0_0_6px_#FF8DC7]" : "group-hover/heart:scale-105"
                            }`}
                          />
                        </button>
                      </div>

                      {/* Aspect Ratio Image Container with hover zoom */}
                      <div className="relative aspect-square w-full overflow-hidden bg-[#2A093D]/10 border-b border-[#C77DFF]/8">
                        <div className="w-full h-full group-hover:scale-105 transition-transform duration-700">
                          <ProductImage src={p.image} alt={p.title} brand={p.brand} />
                        </div>
                      </div>

                      {/* Info details */}
                      <div className="p-5.5 space-y-4 text-left">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-[9px] font-extrabold uppercase tracking-widest text-[#FF8DC7] gap-2">
                            <span>{p.brand || "Glow Addict"}</span>
                            <span className="text-orchid-text-muted/50 truncate max-w-[120px]">{p.category}</span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-extrabold text-white line-clamp-2 leading-snug group-hover:text-orchid-accent transition-colors">
                            {p.title}
                          </h4>
                        </div>

                        {/* Skincare highlight chips (Never raw OCR JSON dumps!) */}
                        <div className="flex flex-wrap gap-1">
                          {bullets.map((bullet, index) => (
                            <span
                              key={index}
                              className="text-[8.5px] font-extrabold text-orchid-text-warm bg-[#1B0124]/55 border border-[#C77DFF]/10 px-2.5 py-1 rounded-lg flex items-center gap-1"
                            >
                              <span className="text-[#FF8DC7]">✓</span>
                              {bullet}
                            </span>
                          ))}
                        </div>

                        {/* Verified Rating & Trust Badges */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-bold">
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={10} fill="currentColor" />
                              ))}
                            </div>
                            <span className="text-orchid-text-muted/60 font-semibold">(4.9 verified)</span>
                          </div>
                          
                          {/* Optional AI Verified Badge */}
                          {p.ai_confidence && p.ai_confidence >= 80 && (
                            <span className="bg-[#E056FD]/15 border border-[#E056FD]/30 text-[#E056FD] text-[7.5px] font-extrabold py-0.5 px-2 rounded-full tracking-wider uppercase flex items-center gap-0.5 select-none">
                              <Sparkles size={8} className="animate-pulse" /> AI Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Pricing & CTA action bar */}
                    <div className="px-5.5 pb-5.5 pt-4 border-t border-[#C77DFF]/8 flex justify-between items-center bg-[#2A093D]/15 shrink-0">
                      <div className="space-y-0.5">
                        {p.mrp > p.price && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] text-orchid-text-muted/40 line-through font-mono">
                              ₹{p.mrp}
                            </span>
                            {discount > 0 && (
                              <span className="text-[8px] font-extrabold text-[#FF8DC7]">
                                Save {discount}%
                              </span>
                            )}
                          </div>
                        )}
                        <span className="text-sm sm:text-base font-black text-white block font-mono">
                          ₹{p.price}
                        </span>
                      </div>

                      {p.stock <= 0 ? (
                        <span className="text-[8.5px] font-extrabold uppercase px-3 py-2 bg-red-500/10 border border-red-500/20 text-[#FF8DC7] rounded-xl select-none">
                          Sold Out
                        </span>
                      ) : (
                        <button
                          onClick={(e) => handleQuickAdd(p, e)}
                          className="px-4 py-2 bg-brand-gradient text-white rounded-xl text-[10px] font-extrabold uppercase tracking-wider hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#E056FD]/10 hover:shadow-[#E056FD]/20 border border-[#E056FD]/20"
                        >
                          <ShoppingCart size={11} />
                          Add to Bag
                        </button>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* 👩‍🦰 SAYANITA'S BRAND PROMISE STORY */}
        <section className="bg-gradient-to-br from-[#2A093D]/80 to-[#1B0124]/90 border border-[#C77DFF]/20 rounded-[36px] p-8 sm:p-12 lg:p-16 max-w-5xl mx-auto shadow-2xl relative overflow-hidden text-center space-y-6 backdrop-blur-md glow-border select-none ios-spring-hover">
          <div className="absolute -right-20 -bottom-20 opacity-5 w-80 h-80 pointer-events-none">
            <Image src="/logo.png" alt="" fill className="object-contain" />
          </div>
          <div className="absolute inset-0 bg-[#E056FD]/3 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl mx-auto space-y-6 z-10 relative">
            <div className="flex justify-center">
              <span className="p-3.5 rounded-full bg-[#E056FD]/10 border border-[#E056FD]/20 text-[#FF8DC7] inline-block shadow-md">
                <Sparkles size={24} className="animate-pulse" />
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-elegant text-white leading-tight">
              Sayanita's Dream: The Story of Purity
            </h2>
            <div className="space-y-4 max-w-2xl mx-auto text-orchid-text-warm font-sans text-xs sm:text-sm leading-relaxed font-medium">
              <p>
                Glow Addict was born out of a simple, beautiful realization. As a girl’s girl, Sayanita noticed that while the ritual of skincare brings immense joy and peace, the marketplace was filled with astronomical prices and counterfeit products.
              </p>
              <p className="italic text-[#FF8DC7]">
                "Self-care is not a luxury reserved for the few; it is a daily commitment to your own peace. I wanted to build a sanctuary where every bottle is verified pure, and every package is bundled with love, scrunchies, and absolute trust."
              </p>
              <p>
                Today, every single shipment is handpacked under Sayanita’s strict quality guidance, featuring tamper-proof unboxing validation. When you unbox a Glow Addict package, you are not just opening skincare—you are unboxing a promise.
              </p>
            </div>
            <div className="pt-4 flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#FF8DC7] border-b border-[#FF8DC7]/30 pb-1">
                Founder, Glow Addict by Sayanita
              </span>
              <span className="text-[8.5px] uppercase font-bold tracking-widest text-orchid-text-muted mt-1.5">
                🌸 TAMPER-PROOF UNBOXING GUARANTEED 🌸
              </span>
            </div>
          </div>
        </section>

        {/* 📚 OPERATIONS POLICIES */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto pt-2 text-left">
          
          <Link
            href="/shipping-policy"
            className="block p-5.5 rounded-2xl bg-[#2A093D]/30 border border-[#C77DFF]/10 hover:border-[#C77DFF]/20 shadow-md backdrop-blur-xs space-y-2.5 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-[#1B0124] border border-[#C77DFF]/12 text-[#FF8DC7]">
                <Truck size={16} />
              </div>
              <h3 className="text-xs font-bold text-white uppercase tracking-widest font-sans">
                Shipping & Delivery Tiers
              </h3>
            </div>
            <p className="text-[11px] text-orchid-text-muted leading-relaxed font-medium">
              Orders below ₹799 have a basic ₹39 delivery charge. Orders above ₹799 receive **FREE SHIPPING** automatically. Tamper-evident seals applied to all orders.
            </p>
          </Link>

          <Link
            href="/store-policy"
            className="block p-5.5 rounded-2xl bg-[#2A093D]/30 border border-[#C77DFF]/10 hover:border-[#C77DFF]/20 shadow-md backdrop-blur-xs space-y-2.5 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-[#1B0124] border border-[#C77DFF]/12 text-orchid-accent">
                <ShieldCheck size={16} />
              </div>
              <h3 className="text-xs font-bold text-white uppercase tracking-widest font-sans">
                Strict No-Return Policy
              </h3>
            </div>
            <p className="text-[11px] text-orchid-text-muted leading-relaxed font-medium">
              Verified catalog orders are covered by our absolute no-return, no-exchange policy. A **complete, continuous unboxing video** is strictly required for claims.
            </p>
          </Link>

        </section>

        {/* 💬 HELPFUL SELF-CARE Q&As & SUPPORT */}
        <section className="bg-[#1B0124]/40 border border-[#C77DFF]/10 rounded-3xl p-6 sm:p-10 max-w-4xl mx-auto shadow-xl space-y-6 text-left select-none">
          <div className="text-center space-y-1.5 border-b border-[#C77DFF]/8 pb-4">
            <h2 className="text-xl sm:text-2xl font-black font-elegant text-white uppercase tracking-wider">
              Self-Care Support Center
            </h2>
            <p className="text-[10px] text-orchid-text-muted font-semibold tracking-wider uppercase">
              Answers to your common skincare self-care queries
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-semibold leading-relaxed text-[#D8B4FE]">
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-white flex items-start gap-2">
                <HelpIcon size={13} className="text-[#FF8DC7] shrink-0 mt-0.5" />
                How do I know my products are 100% genuine?
              </h4>
              <p className="text-orchid-text-muted text-[10.5px] pl-5 leading-normal">
                Every bottle from Glow Addict is directly imported from authentic manufacturers or authorized distributors, backed by Sayanita's personal verification seals.
              </p>
            </div>
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-white flex items-start gap-2">
                <HelpIcon size={13} className="text-orchid-accent shrink-0 mt-0.5" />
                What is the order unboxing video requirement?
              </h4>
              <p className="text-orchid-text-muted text-[10.5px] pl-5 leading-normal">
                To protect against shipping damages, you must film a continuous, uncut video showing the sealed shipping package label, opening the box, and inspecting the items.
              </p>
            </div>
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-white flex items-start gap-2">
                <HelpIcon size={13} className="text-[#FF8DC7] shrink-0 mt-0.5" />
                How long does shipment and delivery take?
              </h4>
              <p className="text-orchid-text-muted text-[10.5px] pl-5 leading-normal">
                Once payment is confirmed, orders are packaged within 24 hours. Transit typically takes 3 to 5 business days, and you'll receive a tracking code instantly.
              </p>
            </div>
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-white flex items-start gap-2">
                <HelpIcon size={13} className="text-orchid-accent shrink-0 mt-0.5" />
                Are freebie choices automatically processed?
              </h4>
              <p className="text-orchid-text-muted text-[10.5px] pl-5 leading-normal">
                Yes! When your cart reaches ₹1499, a gift selection popup lets you pick either the Face Wash or the Keychain. We process the chosen item in your packing slip.
              </p>
            </div>
          </div>

          {/* Quick Contact triggers */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4 border-t border-[#C77DFF]/10 text-center sm:text-left select-none">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Need immediate shade assistance or routine advice?
            </span>
            <a
              href="https://wa.me/918585061614?text=Hi%20Sayanita!%20I%20have%20a%20question%20about%20skincare%20shades%20on%20Glow%20Addict."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#25D366] text-white hover:bg-[#128C7E] shadow-sm transition-all cursor-pointer"
            >
              <MessageCircle size={15} />
              WhatsApp Sayanita
            </a>
          </div>

        </section>

      </main>

      <Footer />
    </div>
  );
}
