"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { CartDrawer } from "@/components/CartDrawer";
import { Footer } from "@/components/Footer";
import { useShop, Product } from "@/context/ShopContext";
import { Sparkles, ShieldCheck, Heart, ShoppingBag, ArrowRight, Star, Sparkle, Tag } from "lucide-react";
import ProductImage from "@/components/ProductImage";

interface CollectionType {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  concernTag: string;
  productIds: string[];
}

export default function Collections() {
  const { products, addToCart, setCartOpen, wishlist, toggleWishlist, isInWishlist } = useShop();

  const collections: CollectionType[] = useMemo(() => [
    {
      slug: "glass-skin-essentials",
      name: "Glass Skin Essentials",
      tagline: "Dewy, translucent, and deeply hydrated skin",
      description: "Achieve the coveted Korean dewy finish with our hydration essence and moisture-balancing toners.",
      image: "/images/p3.jpeg",
      concernTag: "Hydration & Glow",
      productIds: ["prod-p3", "prod-p4", "prod-p5", "prod-p6"]
    },
    {
      slug: "acne-blemish-control",
      name: "Acne & Blemish Control",
      tagline: "Clarify breakouts, control sebum, and balance pores",
      description: "Purge pores and control oil production with targeted zinc and high-strength niacinamide formulas.",
      image: "/images/p4.jpeg",
      concernTag: "Pore Clearing & Oil Control",
      productIds: ["prod-p2", "prod-p4", "prod-p6"]
    },
    {
      slug: "barrier-repair",
      name: "Hypoallergenic Barrier Repair",
      tagline: "Soothe sensitive skin, redness, and flaking",
      description: "Rebuild your natural skin barrier with ceramide-infused cleansers and highly soothing botanical toners.",
      image: "/images/p6.jpeg",
      concernTag: "Sensitive & Redness Relief",
      productIds: ["prod-p1", "prod-p5", "prod-p6"]
    },
    {
      slug: "luxury-lip-care",
      name: "Luxury Lip Care Rituals",
      tagline: "Plump, deeply nourished lips overnight",
      description: "Sleep away dryness and locks in hydration with rich, antioxidant fruits and berry sleep mask blends.",
      image: "/images/p2.jpeg",
      concernTag: "Dry & Chapped Lip Repair",
      productIds: ["prod-p2"]
    }
  ], []);

  const [activeCollectionSlug, setActiveCollectionSlug] = useState<string>("glass-skin-essentials");

  const activeCollection = useMemo(() => {
    return collections.find((c) => c.slug === activeCollectionSlug) || collections[0];
  }, [collections, activeCollectionSlug]);

  // Robust dynamic sorting: matches products both by direct ID and dynamically by title, description or category keywords
  const collectionProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Check direct ID matches first
      if (activeCollection.productIds.includes(p.id)) return true;
      
      // 2. Match dynamically by category or string keywords
      const title = p.title.toLowerCase();
      const desc = p.description.toLowerCase();
      const cat = p.category.toLowerCase();
      const tags = Array.isArray(p.tags) ? p.tags.map(t => t.toLowerCase()) : [];

      if (activeCollection.slug === "glass-skin-essentials") {
        return (
          cat.includes("serum") ||
          cat.includes("hydration") ||
          cat.includes("essence") ||
          cat.includes("toner") ||
          title.includes("hyaluronic") ||
          title.includes("hydrate") ||
          title.includes("dewy") ||
          title.includes("glass") ||
          title.includes("water") ||
          tags.includes("hydration") ||
          tags.includes("glow")
        );
      }
      
      if (activeCollection.slug === "acne-blemish-control") {
        return (
          cat.includes("cleanser") ||
          cat.includes("mask") ||
          title.includes("acne") ||
          title.includes("blemish") ||
          title.includes("pore") ||
          title.includes("salicylic") ||
          title.includes("niacinamide") ||
          desc.includes("sebum") ||
          tags.includes("acne") ||
          tags.includes("pore")
        );
      }
      
      if (activeCollection.slug === "barrier-repair") {
        return (
          cat.includes("hydration") ||
          cat.includes("spf") ||
          title.includes("barrier") ||
          title.includes("repair") ||
          title.includes("ceramide") ||
          title.includes("soothing") ||
          title.includes("cica") ||
          desc.includes("sensitive") ||
          desc.includes("redness") ||
          tags.includes("barrier") ||
          tags.includes("sensitive")
        );
      }
      
      if (activeCollection.slug === "luxury-lip-care") {
        return (
          cat.includes("lip") ||
          title.includes("lip") ||
          title.includes("balm") ||
          title.includes("gloss") ||
          tags.includes("lip") ||
          tags.includes("lips")
        );
      }

      return false;
    });
  }, [products, activeCollection]);

  const handleQuickAdd = (product: Product) => {
    const defaultShade = product.shades && product.shades.length > 0 ? product.shades[0] : undefined;
    addToCart(product, 1, defaultShade);
    setCartOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative">
      {/* Visual background luxury radial meshes */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-magenta/3 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[700px] h-[700px] bg-brand-rose/2 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-5 w-[250px] h-[250px] bg-brand-lilac/3 rounded-full blur-3xl pointer-events-none" />

      <Header />
      <CartDrawer />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14 relative z-10 select-none">
        
        {/* Editorial Header Section */}
        <section className="text-center max-w-2xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-widest text-brand-magenta bg-brand-rose/30 border border-brand-rose px-4 py-1.5 rounded-full">
            <Sparkle size={10} className="animate-spin text-brand-magenta" style={{ animationDuration: '6s' }} />
            Korean Inspired Skincare Vault
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-elegant text-foreground tracking-wide leading-tight">
            The Curated Collections
          </h1>
          <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed max-w-md mx-auto font-medium">
            Discover bespoke skincare rituals mapped by Sayanita to target specific concerns: whether you seek Korean glass skin dewyness, oil clearing, or lip care plumpness.
          </p>
        </section>

        {/* Collections editorial cards grid layout */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {collections.map((col) => {
            const isActive = col.slug === activeCollectionSlug;
            return (
              <div
                key={col.slug}
                onClick={() => setActiveCollectionSlug(col.slug)}
                className={`group relative h-80 rounded-[32px] overflow-hidden shadow-xl cursor-pointer border transition-all duration-500 ios-spring ios-spring-hover ios-spring-active ${
                  isActive 
                    ? "border-brand-magenta scale-[1.03] shadow-md shadow-brand-magenta/15" 
                    : "border-brand-rose/60 bg-gradient-to-b from-brand-peach/10 to-white hover:border-brand-magenta/40"
                }`}
              >
                {/* Visual Background image overlay */}
                <div className="absolute inset-0 bg-black/45 group-hover:bg-black/55 transition-colors z-10" />
                <Image
                  src={col.image}
                  alt={col.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 bg-brand-cream"
                  unoptimized
                />

                {/* Content Overlay */}
                <div className="absolute inset-0 z-20 p-6 flex flex-col justify-between text-white text-left">
                  
                  {/* Concern tag */}
                  <span className={`inline-block self-start text-[8px] uppercase tracking-widest px-3 py-1 rounded-full font-bold transition-all duration-300 ${
                    isActive ? "bg-brand-gradient shadow-[0_0_10px_rgba(252,39,121,0.4)]" : "bg-brand-magenta"
                  }`}>
                    {col.concernTag}
                  </span>

                  {/* Name and trigger */}
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold font-elegant leading-tight">{col.name}</h3>
                    <p className="text-[10px] text-white/80 line-clamp-2 leading-relaxed font-sans font-light">
                      {col.tagline}
                    </p>
                    <div className="pt-2 flex items-center gap-1.5 text-[9px] uppercase font-bold tracking-widest text-brand-lilac group-hover:translate-x-1.5 transition-transform">
                      {isActive ? "Viewing Collection" : "Explore Collection"}
                      <ArrowRight size={10} />
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </section>

        {/* Tactile Collections Navigation Pills (Tab Menu) */}
        <div className="flex flex-wrap justify-center gap-3 pb-2 relative z-20">
          {collections.map((col) => {
            const isActive = col.slug === activeCollectionSlug;
            return (
              <button
                key={col.slug}
                onClick={() => setActiveCollectionSlug(col.slug)}
                className={`px-5 py-3 rounded-full text-xs font-bold transition-all duration-300 border cursor-pointer select-none ios-spring ios-spring-hover ${
                  isActive
                    ? "bg-brand-gradient border-brand-magenta text-white shadow-xs scale-105"
                    : "bg-white border-brand-rose/60 text-foreground/60 hover:text-brand-magenta hover:bg-brand-cream hover:border-brand-rose"
                }`}
              >
                {col.name}
              </button>
            );
          })}
        </div>

        {/* Curated Catalogue Products Panel */}
        <section className="bg-gradient-to-br from-brand-peach/30 via-brand-cream to-white border border-brand-rose rounded-[36px] p-6 sm:p-10 shadow-xl space-y-8 animate-slide-in relative overflow-hidden">
          <div className="absolute inset-0 bg-brand-magenta/1 rounded-full blur-3xl pointer-events-none" />
          
          {/* Header intro of selected */}
          <div className="text-left max-w-3xl border-b border-brand-rose pb-6 space-y-3.5 relative z-10">
            <span className="text-[9px] font-extrabold text-brand-magenta uppercase tracking-widest flex items-center gap-1">
              <Sparkles size={11} className="text-brand-magenta animate-pulse" />
              Active Skincare Ritual
            </span>
            <h2 className="text-2xl sm:text-3.5xl font-black font-elegant text-foreground leading-tight">
              {activeCollection.name}
            </h2>
            <p className="text-xs text-foreground/75 leading-relaxed font-sans font-semibold">
              {activeCollection.description}
            </p>
          </div>

          {/* Grid list of collection items */}
          {collectionProducts.length === 0 ? (
            <div className="py-16 text-center space-y-3 relative z-10">
              <p className="text-xs text-foreground/65 font-medium">No products currently matched to this ritual.</p>
              <Link href="/shop" className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-magenta hover:underline">
                Explore Full Shop <ArrowRight size={10} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {collectionProducts.map((product) => {
                const fav = isInWishlist(product.id);
                const savings = product.mrp && product.price ? product.mrp - product.price : 0;
                const discount = savings > 0 ? Math.round((savings / product.mrp) * 100) : 0;

                return (
                  <div
                    key={product.id}
                    className="group flex flex-col bg-white border border-brand-rose rounded-3xl overflow-hidden shadow-xs hover:border-brand-magenta/40 hover:shadow-lg transition-all duration-500 h-full justify-between ios-spring ios-spring-hover"
                  >
                    
                    {/* Image Section */}
                    <div className="relative aspect-square w-full bg-brand-cream/30 overflow-hidden border-b border-brand-rose/60">
                      <div className="absolute inset-0 group-hover:scale-105 transition-transform duration-700">
                        <ProductImage
                          src={product.image}
                          alt={product.title}
                          brand={product.brand}
                        />
                      </div>
                      
                      {/* Authenticity badge */}
                      <span className="absolute top-3 left-3 bg-white/95 text-foreground text-[8px] font-bold py-1.5 px-3.5 rounded-full border border-brand-rose/60 flex items-center gap-1.5 backdrop-blur-md font-sans select-none">
                        <ShieldCheck size={11} className="text-brand-magenta" />
                        100% Genuine
                      </span>

                      {/* AI Confidence / Best Seller Badge */}
                      {product.ai_confidence && product.ai_confidence > 75 ? (
                        <span className="absolute top-3 right-3 bg-brand-magenta/90 text-white text-[8px] font-bold py-1.5 px-3 rounded-full border border-white/20 flex items-center gap-1 backdrop-blur-md font-sans">
                          ✨ AI Match {product.ai_confidence}%
                        </span>
                      ) : (
                        <span className="absolute top-3 right-3 bg-brand-rose/95 text-brand-magenta text-[8px] font-extrabold py-1.5 px-3.5 rounded-full border border-white/20 flex items-center gap-1 backdrop-blur-md font-sans">
                          👑 Curator's Pick
                        </span>
                      )}

                      {/* Wishlist toggle */}
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className={`absolute bottom-3 right-3 p-2.5 rounded-full border transition-all duration-300 shadow-sm cursor-pointer z-20 ${
                          fav 
                            ? "bg-brand-magenta text-white border-transparent scale-105" 
                            : "bg-brand-cream/80 text-foreground/45 hover:text-brand-magenta hover:bg-brand-cream border-brand-rose/30"
                        }`}
                        aria-label="Toggle wishlist"
                      >
                        <Heart size={15} fill={fav ? "currentColor" : "none"} className={fav ? "animate-pulse" : ""} />
                      </button>
                    </div>

                    {/* Info details */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4 text-left">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[9px] font-sans font-bold">
                          <span className="uppercase tracking-widest text-brand-magenta">{product.brand}</span>
                          <span className="text-brand-magenta/80 truncate max-w-[110px] bg-brand-cream px-2 py-0.5 rounded-md border border-brand-rose/50 flex items-center gap-1">
                            <Tag size={8} />
                            {product.category}
                          </span>
                        </div>
                        <Link
                          href={`/product/${product.id}`}
                          className="block text-xs sm:text-sm font-bold text-foreground hover:text-brand-magenta transition-colors line-clamp-1 font-elegant"
                        >
                          {product.title}
                        </Link>
                        <p className="text-[10px] text-foreground/70 leading-relaxed line-clamp-2 font-sans font-medium">
                          {product.description}
                        </p>
                      </div>

                      {/* Review Rating stars */}
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={11} fill="currentColor" />
                        ))}
                        <span className="text-[9px] text-brand-magenta font-extrabold ml-1">
                          (4.9 Rating)
                        </span>
                      </div>

                      {/* Pricing Actions */}
                      <div className="flex justify-between items-center pt-3 border-t border-brand-rose/60 text-xs shrink-0 bg-brand-cream/40 rounded-xl p-3">
                        <div>
                          {product.mrp > product.price && (
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-[10px] text-foreground/30 line-through">₹{product.mrp}</span>
                              {discount > 0 && (
                                <span className="text-[8px] font-extrabold text-brand-magenta bg-brand-magenta/10 px-1.5 py-0.5 rounded-md border border-brand-rose uppercase tracking-wide">
                                  Save {discount}%
                                </span>
                              )}
                            </div>
                          )}
                          <span className="text-sm font-bold text-foreground block font-sans">₹{product.price}</span>
                        </div>
                        
                        <button
                          onClick={() => handleQuickAdd(product)}
                          className="px-4 py-2 bg-brand-gradient text-white rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-1 cursor-pointer border border-brand-rose/30"
                        >
                          <ShoppingBag size={11} />
                          Add To Bag
                        </button>
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </section>

        {/* MAPPING STORY SECTION */}
        <section className="bg-gradient-to-br from-brand-cream/80 to-white/90 border border-brand-rose rounded-[36px] p-8 sm:p-12 lg:p-16 max-w-5xl mx-auto shadow-2xl relative overflow-hidden text-center space-y-6 backdrop-blur-md glow-border select-none ios-spring-hover">
          <div className="absolute inset-0 bg-brand-magenta/2 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl mx-auto space-y-5 z-10 relative">
            <div className="flex justify-center text-brand-magenta">
              <Sparkles size={32} className="animate-pulse" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-elegant text-foreground uppercase tracking-wider">
              Circadian Ritual Mapping Philosophy
            </h2>
            <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-sans font-medium">
              Skincare is not just application; it is chronobiology. Sayanita maps each ritual to synchronize with your skin's biological rhythm—unlocking glass skin dewyness in the morning and deep cellular barrier repair at night. Indulge in routines verified by dermal AI for true skin harmony.
            </p>
            <div className="pt-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand-magenta border-b border-brand-rose pb-0.5">
                RITUAL BIO-HARMONY MAP BY SAYANITA
              </span>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
