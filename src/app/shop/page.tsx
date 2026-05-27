"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { CartDrawer } from "@/components/CartDrawer";
import { Footer } from "@/components/Footer";
import { useShop, Product } from "@/context/ShopContext";
import { Search, SlidersHorizontal, Heart, ShoppingBag, ShieldCheck, Star, Sparkles } from "lucide-react";

export default function Shop() {
  const { products, addToCart, setCartOpen, wishlist, toggleWishlist, isInWishlist } = useShop();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("popular");

  // Get unique categories and brands for filter lists
  const categories = useMemo(() => {
    const list = new Set(products.map((p) => p.category.split(" / ")[0]));
    return ["All", ...Array.from(list)];
  }, [products]);

  const brands = useMemo(() => {
    const list = new Set(products.map((p) => p.brand));
    return ["All", ...Array.from(list)];
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Advanced NLP/Semantic AI Query Parser
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      
      // 1. Extract price boundary limits (e.g. "under ₹300", "below 500", "under 1000")
      const priceLimitMatch = q.match(/(?:under|below|less\s+than|max|maximum|under\s*₹|below\s*₹)\s*(?:rs\.?|₹)?\s*(\d+)/i);
      const targetPrice = priceLimitMatch ? parseInt(priceLimitMatch[1]) : null;
      
      // Clean extracted price condition from raw search query
      let cleanQ = q;
      if (priceLimitMatch) {
        cleanQ = q.replace(priceLimitMatch[0], "").trim();
      }
      
      // 2. Extract skin type constraints (e.g. "dry skin", "oily", "sensitive")
      const skinKeywords = ["oily", "dry", "combination", "sensitive", "normal"];
      const targetSkinType = skinKeywords.find(k => q.includes(k));
      if (targetSkinType) {
        cleanQ = cleanQ.replace(new RegExp(`${targetSkinType}\\s*(?:skin)?`, "gi"), "").trim();
      }
      
      // 3. Normalize search query (strip generic grammatical stop words to extract core cosmetic terms)
      cleanQ = cleanQ
        .replace(/\b(products|formulas|items|for|with|under|below|rs|inr|and|the)\b/gi, "")
        .replace(/\s+/g, " ")
        .trim();

      const SYNONYM_MAP: Record<string, string[]> = {
        'face wash': ['cleanser', 'facewash', 'wash', 'cleansing'],
        'facewash': ['cleanser', 'face wash', 'wash', 'cleansing'],
        'face-wash': ['cleanser', 'face wash', 'wash', 'cleansing'],
        'cleanser': ['face wash', 'facewash', 'wash', 'cleansing'],
        'sunscreen': ['spf', 'sun block', 'sunblock', 'sun cream'],
        'sun block': ['spf', 'sunscreen', 'sunblock', 'sun cream'],
        'moisturizer': ['hydration', 'hydrate', 'cream', 'gel', 'lotion', 'moisturiser'],
        'moisturiser': ['hydration', 'hydrate', 'cream', 'gel', 'lotion', 'moisturizer'],
        'cream': ['moisturizer', 'lotion', 'hydration'],
        'serum': ['essence', 'elixir', 'ampoule'],
        'essence': ['serum', 'elixir'],
        'elixir': ['serum', 'essence'],
        'lip balm': ['lipstick', 'lip care', 'lip balm', 'balm'],
        'lipstick': ['lip', 'lipsticks', 'matte', 'liquid lipstick']
      };

      result = result.filter((p) => {
        // Apply Price bounds validation
        if (targetPrice !== null && p.price > targetPrice) {
          return false;
        }

        // Apply Skin type matching (skin_type or fallback skin_type arrays)
        if (targetSkinType) {
          const productSkinTypes = Array.isArray(p.skin_type)
            ? p.skin_type.map((s) => String(s).toLowerCase())
            : String(p.skin_type || "").toLowerCase().split(/,\s*/);
          
          const matchesSkin = productSkinTypes.includes(targetSkinType) || productSkinTypes.includes("all");
          if (!matchesSkin) return false;
        }

        // Match normalized core keywords with smart multi-word search & synonym expansion
        if (cleanQ) {
          const terms = cleanQ.split(/\s+/).filter(t => t.length > 0);
          
          const title = p.title.toLowerCase();
          const brand = p.brand.toLowerCase();
          const category = p.category.toLowerCase();
          const desc = p.description.toLowerCase();
          const productType = ((p as any).product_type || '').toLowerCase();
          
          // Type safe tags & ingredients resolution
          const tags = Array.isArray((p as any).tags) 
            ? (p as any).tags.map((t: unknown) => String(t).toLowerCase()) 
            : [];
          const ingredients = Array.isArray((p as any).ingredients)
            ? (p as any).ingredients.map((i: unknown) => String(i).toLowerCase())
            : String((p as any).ingredients || '').toLowerCase().split(/,\s*/);

          return terms.every((term) => {
            // 1. Direct match
            const directMatch = (
              title.includes(term) ||
              brand.includes(term) ||
              category.includes(term) ||
              desc.includes(term) ||
              productType.includes(term) ||
              tags.some((t: string) => t.includes(term)) ||
              ingredients.some((i: string) => i.includes(term))
            );
            if (directMatch) return true;

            // 2. Single-word synonym map match
            const synonyms = SYNONYM_MAP[term] || [];
            for (const syn of synonyms) {
              const synMatch = (
                title.includes(syn) ||
                brand.includes(syn) ||
                category.includes(syn) ||
                desc.includes(syn) ||
                productType.includes(syn) ||
                tags.some((t: string) => t.includes(syn)) ||
                ingredients.some((i: string) => i.includes(syn))
              );
              if (synMatch) return true;
            }

            // 3. Multi-word synonym match
            for (const key of Object.keys(SYNONYM_MAP)) {
              if (cleanQ.includes(key)) {
                const multiSyns = SYNONYM_MAP[key];
                for (const syn of multiSyns) {
                  const multiMatch = (
                    title.includes(syn) ||
                    brand.includes(syn) ||
                    category.includes(syn) ||
                    desc.includes(syn) ||
                    productType.includes(syn) ||
                    tags.some((t: string) => t.includes(syn)) ||
                    ingredients.some((i: string) => i.includes(syn))
                  );
                  if (multiMatch) return true;
                }
              }
            }

            return false;
          });
        }

        return true;
      });
    }

    // Category filter
    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category.startsWith(selectedCategory));
    }

    // Brand filter
    if (selectedBrand !== "All") {
      result = result.filter((p) => p.brand === selectedBrand);
    }

    // Sorting logic
    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "title-az") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "title-za") {
      result.sort((a, b) => b.title.localeCompare(a.title));
    }

    return result;
  }, [products, searchQuery, selectedCategory, selectedBrand, sortBy]);

  const handleQuickAdd = (product: Product) => {
    const defaultShade = product.shades && product.shades.length > 0 ? product.shades[0] : undefined;
    addToCart(product, 1, defaultShade);
    setCartOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#120018] text-white relative">
      {/* Background radial glows for Apple-level luxury */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#E056FD]/3 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[600px] h-[600px] bg-[#C77DFF]/2 rounded-full blur-3xl pointer-events-none" />

      <Header />
      <CartDrawer />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10 select-none">
        
        {/* ✨ THE VAULT OF PURITY STORY BANNER */}
        <section className="bg-gradient-to-br from-[#2A093D]/80 to-[#1B0124]/90 border border-[#C77DFF]/20 rounded-[32px] p-8 sm:p-12 shadow-2xl text-center space-y-4 glow-border select-none ios-spring-hover relative overflow-hidden">
          <div className="absolute inset-0 bg-[#E056FD]/2 rounded-full blur-3xl pointer-events-none" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-[#FF8DC7] font-sans flex items-center justify-center gap-1.5">
            <Sparkles size={12} className="animate-spin-slow text-[#E056FD]" />
            Sayanita's Sourcing Journey
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-elegant text-white tracking-wide">
            The Vault of Purity
          </h1>
          <p className="text-xs sm:text-sm text-orchid-text-warm max-w-2xl mx-auto leading-relaxed font-sans font-medium">
            Glow Addict's catalog is not just a collection of products—it is Sayanita's handpicked skincare closet. Every serum, lipstick, and cooling globe is sourced directly from laboratories in Seoul and Tokyo, passing rigorous chemical purity and Gemini Vision AI scans. Indulge in 100% authentic, tamper-sealed formulas.
          </p>
        </section>

        {/* Search and Filters Bar */}
        <section className="bg-white dark:bg-[#1B0124]/90 border border-brand-rose/25 dark:border-[#C77DFF]/20 rounded-2xl p-4 shadow-2xs glow-card flex flex-col lg:flex-row gap-4 items-center justify-between sticky top-24 z-30 backdrop-blur-md">
          
          {/* Search box input */}
          <div className="relative w-full lg:max-w-xs">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40 dark:text-white/40" />
            <input
              type="text"
              placeholder="Search formulas, brands, concerns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-brand-rose/30 dark:border-[#C77DFF]/20 focus:border-brand-magenta dark:focus:border-[#E056FD] outline-hidden text-xs bg-[#fdfafb] dark:bg-[#2A093D] text-amethyst dark:text-white font-medium"
            />
          </div>

          {/* Filtering Dropdowns */}
          <div className="flex flex-wrap gap-4 items-center justify-start lg:justify-end w-full lg:w-auto text-xs font-sans font-semibold">
            
            {/* Category Select */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-foreground/50 dark:text-white/50 shrink-0">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-auto bg-white dark:bg-[#2A093D] border border-brand-rose/30 dark:border-[#C77DFF]/20 px-3.5 py-2.5 rounded-xl outline-hidden focus:border-brand-magenta dark:focus:border-[#E056FD] text-amethyst dark:text-white cursor-pointer hover:border-brand-magenta/50 dark:hover:border-[#E056FD]/50 transition-colors"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Brand Select */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-foreground/50 dark:text-white/50 shrink-0">Brand:</span>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full sm:w-auto bg-white dark:bg-[#2A093D] border border-brand-rose/30 dark:border-[#C77DFF]/20 px-3.5 py-2.5 rounded-xl outline-hidden focus:border-brand-magenta dark:focus:border-[#E056FD] text-amethyst dark:text-white cursor-pointer hover:border-brand-magenta/50 dark:hover:border-[#E056FD]/50 transition-colors"
              >
                {brands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Sorting Select */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-foreground/50 dark:text-white/50 shrink-0">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto bg-white dark:bg-[#2A093D] border border-brand-rose/30 dark:border-[#C77DFF]/20 px-3.5 py-2.5 rounded-xl outline-hidden focus:border-brand-magenta dark:focus:border-[#E056FD] text-amethyst dark:text-white cursor-pointer hover:border-brand-magenta/50 dark:hover:border-[#E056FD]/50 transition-colors"
              >
                <option value="popular">Popularity</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="title-az">Name: A to Z</option>
                <option value="title-za">Name: Z to A</option>
              </select>
            </div>

          </div>

        </section>

        {/* Product Catalog Grid Layout */}
        <section className="space-y-6">
          <div className="flex justify-between items-center text-xs font-sans font-bold">
            <span className="text-amethyst dark:text-[#D8B4FE]">Showing {filteredProducts.length} premium formulas</span>
            <span className="text-[#E056FD] dark:text-[#FF8DC7] flex items-center gap-1.5">
              <ShieldCheck size={15} />
              Tamper-Evident Hygiene Sealed
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            /* Luxury Empty State Design */
            <div className="bg-white dark:bg-[#1B0124]/90 border border-brand-rose/25 dark:border-[#C77DFF]/15 rounded-3xl p-10 sm:p-16 text-center space-y-6 glow-card max-w-lg mx-auto relative overflow-hidden">
              <div className="absolute -top-12 -left-12 w-24 h-24 rounded-full bg-[#E056FD]/10 blur-xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-24 h-24 rounded-full bg-[#FF8DC7]/10 blur-xl pointer-events-none" />
              
              <div className="p-5 rounded-full bg-brand-cream dark:bg-[#2A093D] text-brand-rose dark:text-[#C77DFF] inline-block shadow-inner relative animate-pulse-glow">
                <SlidersHorizontal size={40} className="animate-pulse" />
                <Sparkles size={16} className="absolute -top-1 -right-1 text-[#FF8DC7]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold font-elegant text-amethyst dark:text-white">No Matching Formulas</h3>
                <p className="text-xs text-foreground/60 dark:text-white/60 max-w-sm mx-auto leading-relaxed font-sans font-medium">
                  We couldn't find any premium skincare elixirs matching your active concerns. Reset filters to continue self-care!
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center font-sans text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                    setSelectedBrand("All");
                    setSortBy("popular");
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-gradient text-white font-bold uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
                >
                  Clear Filters
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("Serum");
                    setSelectedBrand("All");
                    setSortBy("popular");
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl border border-brand-rose dark:border-[#C77DFF]/30 text-amethyst dark:text-white font-bold uppercase tracking-wider hover:bg-brand-cream dark:hover:bg-[#2A093D] transition-colors cursor-pointer"
                >
                  Browse Bestsellers
                </button>
              </div>
            </div>
          ) : (
            /* Premium Responsive E-commerce Grid with staggering aesthetics */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 items-stretch animate-slide-in">
              {filteredProducts.map((product) => {
                const fav = isInWishlist(product.id);
                // Flag to add an AI Recommendation Badge on premium skin matching items
                const isAiRecommended = ["prod-p4", "prod-p5", "prod-p6", "prod-p12"].includes(product.id);

                return (
                  <div
                    key={product.id}
                    className="group flex flex-col bg-white dark:bg-[#2A093D]/40 border border-brand-rose/20 dark:border-[#C77DFF]/15 rounded-3xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-500 glow-card h-full justify-between ios-spring ios-spring-hover ios-spring-active"
                  >
                    <div>
                      {/* Image & Badges Container */}
                      <div className="relative aspect-square w-full bg-zinc-50 dark:bg-[#1B0124] overflow-hidden border-b border-brand-rose/10 dark:border-[#C77DFF]/10">
                        <Image
                          src={product.image}
                          alt={product.title}
                          fill
                          sizes="(max-w-768px) 100vw, (max-w-1200px) 50vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          unoptimized
                        />
                        
                        {/* Authenticity Flag */}
                        {product.authenticity_flag && (
                          <span className="absolute top-3 left-3 bg-white/95 dark:bg-[#1B0124]/95 text-amethyst dark:text-white text-[8px] sm:text-[9px] font-bold py-1 px-2.5 rounded-full shadow-2xs border border-brand-rose/30 dark:border-[#C77DFF]/20 flex items-center gap-1 font-sans">
                            <ShieldCheck size={11} className="text-brand-magenta dark:text-[#E056FD]" />
                            100% Genuine
                          </span>
                        )}

                        {/* AI Recommended Badge */}
                        {isAiRecommended && (
                          <span className="absolute top-10 left-3 bg-[#E056FD] dark:bg-[#C77DFF] text-white dark:text-[#120018] text-[8px] font-bold py-0.5 px-2 rounded-full shadow-2xs flex items-center gap-0.5 font-sans animate-pulse">
                            <Sparkles size={9} />
                            AI Match
                          </span>
                        )}

                        {/* Discount Tag */}
                        {product.mrp > product.price && (
                          <span className="absolute top-3 right-3 bg-brand-gradient text-white text-[9px] font-bold py-1 px-2 rounded-full shadow-xs">
                            -{Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                          </span>
                        )}

                        {/* Wishlist Toggle button */}
                        <button
                          onClick={() => toggleWishlist(product.id)}
                          className={`absolute bottom-3 right-3 p-2.5 rounded-full border transition-all duration-300 shadow-xs cursor-pointer ${
                            fav 
                              ? "bg-brand-rose/90 dark:bg-[#FF8DC7]/90 text-brand-magenta dark:text-[#120018] border-transparent scale-105" 
                              : "bg-white/85 dark:bg-[#1B0124]/85 text-foreground/40 dark:text-white/40 hover:text-brand-magenta dark:hover:text-[#E056FD] hover:bg-white dark:hover:bg-[#2A093D] border-brand-rose/10 dark:border-[#C77DFF]/10"
                          }`}
                          aria-label="Toggle wishlist"
                        >
                          <Heart size={15} fill={fav ? "currentColor" : "none"} className={fav ? "animate-pulse" : ""} />
                        </button>
                      </div>

                      {/* Info Details Section */}
                      <div className="p-4 sm:p-5 space-y-3">
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-sans font-bold">
                            <span className="uppercase tracking-widest text-[#E056FD] dark:text-[#C77DFF]">
                              {product.brand}
                            </span>
                            <span className="text-foreground/45 dark:text-white/45 truncate max-w-[100px]">
                              {product.category}
                            </span>
                          </div>

                          <Link
                            href={`/product/${product.id}`}
                            className="block text-xs sm:text-sm font-bold text-amethyst dark:text-white hover:text-brand-magenta dark:hover:text-[#E056FD] transition-colors line-clamp-1 font-elegant"
                          >
                            {product.title}
                          </Link>
                          
                          <p className="text-[10px] text-foreground/60 dark:text-white/60 leading-relaxed line-clamp-2 font-sans font-medium">
                            {product.description}
                          </p>
                        </div>

                        {/* Review rating stars */}
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={11} fill="currentColor" />
                          ))}
                          <span className="text-[9px] text-foreground/50 dark:text-white/50 font-bold ml-1">
                            (4.9)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Pricing and Quick Add to Bag CTA */}
                    <div className="p-4 sm:p-5 pt-0 border-t border-brand-rose/10 dark:border-[#C77DFF]/10 flex items-center justify-between">
                      <div>
                        {product.mrp > product.price && (
                          <span className="text-[10px] text-foreground/45 dark:text-white/45 line-through">
                            ₹{product.mrp}
                          </span>
                        )}
                        <span className="text-sm sm:text-base font-bold text-amethyst dark:text-white block -mt-1 font-sans">
                          ₹{product.price}
                        </span>
                      </div>

                      {product.stock <= 0 ? (
                        <span className="text-[9px] font-bold uppercase px-3 py-1 bg-red-50 dark:bg-red-950/45 text-red-500 dark:text-red-400 rounded-full border border-red-200 dark:border-red-900/40 font-sans">
                          Sold Out
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleQuickAdd(product)}
                          className="px-4 py-2 bg-brand-gradient hover:bg-brand-gradient-hover text-white rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-xs hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-1 cursor-pointer"
                        >
                          <ShoppingCartIcon />
                          Add to Bag
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>

      <Footer />
    </div>
  );
}

// Simple internal icon since ShoppingCart might not be directly imported
function ShoppingCartIcon() {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="13" 
      height="13" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className="lucide lucide-shopping-cart"
    >
      <circle cx="8" cy="21" r="1"/>
      <circle cx="19" cy="21" r="1"/>
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
    </svg>
  );
}
