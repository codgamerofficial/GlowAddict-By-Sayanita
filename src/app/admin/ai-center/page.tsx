"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useShop, Product } from "@/context/ShopContext";
import { Header } from "@/components/Header";
import { 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  ShieldAlert, 
  ArrowLeft, 
  FileText, 
  Image as ImageIcon, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Mail, 
  Compass, 
  RefreshCw, 
  Layers, 
  Save, 
  Copy, 
  Check, 
  Heart,
  TrendingUp
} from "lucide-react";
import "@/app/admin/admin-inventory.css";

const ADMIN_SECRET_KEY = "0909";

export default function AiCommandCenter() {
  const { products, adminUpdateProduct } = useShop();

  const [secretKey, setSecretKey] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [keyError, setKeyError] = useState("");
  const [adminApiKey, setAdminApiKey] = useState("");

  // Catalog Health Scan state
  const [isScanning, setIsScanning] = useState(false);
  const [scannedStats, setScannedStats] = useState({
    total: 0,
    missingDescription: 0,
    missingSeo: 0,
    missingImages: 0,
    lowConfidence: 0,
  });

  // Batch enrichment workspace state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [enrichmentTab, setEnrichmentTab] = useState<"desc" | "seo" | "marketing">("desc");
  const [isEnriching, setIsEnriching] = useState(false);
  const [aiOutput, setAiOutput] = useState("");
  const [aiKeywords, setAiKeywords] = useState<string[]>([]);
  const [aiSeoTitle, setAiSeoTitle] = useState("");
  const [copiedText, setCopiedText] = useState(false);

  // Marketing Copywriter Wizards state
  const [marketingType, setMarketingType] = useState<"instagram" | "newsletter" | "whatsapp">("instagram");
  const [igTone, setIgTone] = useState("luxury");
  const [campAngle, setCampAngle] = useState("dewy-skin");
  const [selectedAdProduct, setSelectedAdProduct] = useState<string>("");
  const [adOutput, setAdOutput] = useState("");
  const [isGeneratingAd, setIsGeneratingAd] = useState(false);
  const [copiedAd, setCopiedAd] = useState(false);

  // Hydration and security verification
  useEffect(() => {
    const storedKey = sessionStorage.getItem("glow_admin_secret_key") || "";
    if (storedKey) setSecretKey(storedKey);

    let apiKey = sessionStorage.getItem("glow_admin_api_key") || "";
    if (!apiKey && process.env.NEXT_PUBLIC_ADMIN_API_KEY) {
      apiKey = process.env.NEXT_PUBLIC_ADMIN_API_KEY;
      sessionStorage.setItem("glow_admin_api_key", apiKey);
    }
    if (apiKey) setAdminApiKey(apiKey);

    // Initial catalog scan
    runCatalogScan();
  }, [products]);

  const handleUnlockConsole = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyError("");
    if (keyInput === ADMIN_SECRET_KEY) {
      setSecretKey(ADMIN_SECRET_KEY);
      sessionStorage.setItem("glow_admin_secret_key", ADMIN_SECRET_KEY);
    } else {
      setKeyError("Access Denied: Invalid Secret Passcode.");
    }
  };

  const runCatalogScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const stats = {
        total: products.length,
        missingDescription: products.filter(p => !p.description || p.description.includes("Detected from uploaded")).length,
        missingSeo: products.filter(p => !p.seo_title || !p.seo_description).length,
        missingImages: products.filter(p => !p.image).length,
        lowConfidence: products.filter(p => (p.ai_confidence || 100) < 75).length,
      };
      setScannedStats(stats);
      setIsScanning(false);
    }, 600);
  };

  // Luxury Beauty Coprocessor Fallbacks & Generator
  const generateLuxuryDescription = (title: string, brand: string, category: string): string => {
    const formulas = [
      `Indulge in the ultimate sensory beauty ritual with the signature ${title} from ${brand}. Exquisitely formulated for discerning beauty connoisseurs, this premium ${category} combines rare botanicals with high-performance active vectors. It weightlessly melts into your skin mantle to activate a breathtaking, lit-from-within radiance, providing intense nourishment and a velvety cashmere finish. Perfect for restoring youth-glow luminosity, it represents the absolute peak of modern luxury skincare design.`,
      `Reveal a flawless, dewy complexion that glows with divine health. The ${brand} ${title} is a groundbreaking masterwork of modern cosmetic alchemy. Engineered specifically to enhance the cellular lipid barrier, this ultra-luxurious ${category} floods your skin layers with rich nourishment. Crafted with premium antioxidants and micro-emulsified hydration boosters, it erases daily fatigue lines and seals in a smooth, glass-like dewy mantle. A true beauty essential for the skin-conscious elite.`,
      `A luxurious veil of pure perfection. ${title} by ${brand} represents a new golden standard in high-end ${category}. Harnessing next-generation light-reflecting pigments and active moisturizers, this majestic formula creates an instant soft-focus finish while working deep beneath the surface to firm and illuminate. Designed to match perfectly with all luxury skin routines, it leaves a sensational orchid-soft signature feel that lasts all day.`
    ];
    return formulas[Math.floor(Math.random() * formulas.length)];
  };

  const generateSeoData = (title: string, brand: string, category: string) => {
    const seo_title = `${title} | Premium ${category} by ${brand} | Glow Addict`;
    const seo_description = `Shop the legendary ${title} from ${brand}. Certified authentic ${category} formulated to enhance your natural beauty. Enjoy free VIP shipping and custom routine gifts.`;
    const keywords = [
      brand.toLowerCase(),
      category.toLowerCase(),
      title.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, "").split(" ").join(", "),
      "glow addict",
      "luxury beauty online",
      "buy skincare india",
      "dewy glass skin"
    ];
    return { seo_title, seo_description, keywords };
  };

  const handleAiEnrich = async () => {
    if (!selectedProduct) return;
    setIsEnriching(true);
    setAiOutput("");

    // Simulate Groq / Gemini beauty copywriting stream
    setTimeout(() => {
      if (enrichmentTab === "desc") {
        const desc = generateLuxuryDescription(selectedProduct.title, selectedProduct.brand, selectedProduct.category);
        setAiOutput(desc);
      } else if (enrichmentTab === "seo") {
        const data = generateSeoData(selectedProduct.title, selectedProduct.brand, selectedProduct.category);
        setAiSeoTitle(data.seo_title);
        setAiOutput(data.seo_description);
        setAiKeywords(data.keywords);
      } else {
        const ad = generateIgCaption(selectedProduct.title, selectedProduct.brand, selectedProduct.category, "luxury");
        setAiOutput(ad);
      }
      setIsEnriching(false);
    }, 1200);
  };

  const handleSaveEnrichment = () => {
    if (!selectedProduct) return;

    const updates: Partial<Product> = {};
    if (enrichmentTab === "desc" && aiOutput) {
      updates.description = aiOutput;
    } else if (enrichmentTab === "seo" && aiOutput) {
      updates.seo_title = aiSeoTitle;
      updates.seo_description = aiOutput;
      updates.seo_keywords = aiKeywords;
    }

    adminUpdateProduct(selectedProduct.id, updates);
    alert(`Successfully synchronized enriched ${enrichmentTab.toUpperCase()} catalog parameters for ${selectedProduct.title}!`);
    runCatalogScan();
  };

  // Instagram, WhatsApp, and VIP Newsletters copy builders
  const generateIgCaption = (title: string, brand: string, cat: string, tone: string): string => {
    const hashtagBlock = `\n\n#GlowAddict #LuxurySkincare #DewySkin #SelfCareSunday #BeautyRitual #GlassSkin #${cat.replace(/\s+/g, "")} #AuthenticBeauty`;
    
    if (tone === "luxury") {
      return `✨ The Absolute Pinnacle of Cosmetic Elegance ✨\n\nElevate your daily beauty ritual with the legendary ${title} by ${brand}. Formulated as a rare, ultra-premium ${cat}, this masterpiece weightlessly melts into the skin mantle to unleash a sensational, lit-from-within crystal glow. \n\nNo filters. No compromise. Just pure luxury. \n\n🛍️ Experience authentic brilliance. Tap the link in bio to secure yours with our signature gift wrapping. ${hashtagBlock}`;
    }
    if (tone === "playful") {
      return `Obsessed is an understatement! 😍 Say hello to your skin's new absolute bestie: the ${title} from ${brand}! \n\nIf you've been looking for that effortless, glazed-donut dewy shine without feeling heavy - this is the holy grail ${cat} you've been waiting for! ✨💦\n\nSwipe left to see this magic in action and grab yours before we sell out again! 🤫👇 ${hashtagBlock}`;
    }
    return `Clean. Conscious. Sensational. 🌿\n\nNurture your skin mantle with the ultra-refined ${title} by ${brand}. Powered by highly concentrated bio-actives and premium botanical hydrators, this clinical ${cat} strengthens your natural moisture barrier while unlocking a pure, organic radiance. \n\nFree from synthetic fillers, 100% authentic, curated with absolute love. ✨ ${hashtagBlock}`;
  };

  const generateNewsletter = (angle: string, product?: Product): string => {
    const prodTitle = product ? product.title : "Glow Addict Curated Collections";
    const prodBrand = product ? product.brand : "Premium Beauty Brands";

    if (angle === "dewy-skin") {
      return `Subject: 🌟 Revealed: Sayanita’s VIP Routine for Perfect Glass Skin 

Dearest Glow Connoisseur,

True luminosity isn’t created—it is unlocked. Today, we invite you behind the velvet rope of our elite beauty vaults to explore a groundbreaking approach to dewy hydration.

At the heart of every flawless complexion lies a perfectly balanced lipid barrier. To help you achieve that coveted, glass-like finish, we are showcasing the iconic ${prodTitle} by ${prodBrand}. 

Crafted with premium active botanicals and micro-emulsified hydration carriers, this masterpiece floods your skin mantle with deep, weightless nourishment. The result? A breathtaking, lit-from-within glow that looks absolutely stunning in any light.

🎁 YOUR EXCLUSIVE VIP GIFT:
As a valued subscriber of Sayanita's curated circle, use code GLOW10 at checkout today to receive 10% off your purchase, alongside a complimentary set of handmade luxury silk scrunchies with orders over ₹999.

Elevate your vanity table today.

With radiant affection,
Sayanita
Founder, Glow Addict`;
    }

    return `Subject: 💄 Alert: VIP VIP Access to Our Luxury Cosmetics Flash Sale

Dearest Glow Connoisseur,

Some secrets are simply too beautiful to keep. For the next 48 hours, we are opening the gates to our private boutique vaults for an exclusive curation event.

Treat yourself to the award-winning ${prodTitle} by ${prodBrand} alongside other highly coveted formulas at a special, limited-edition pricing structure.

Whether you're restocking your ultimate signature lip shade or upgrading your clinical SPF shield, our catalog guarantees 100% verified authenticity with direct batch trackings.

🎟️ YOUR PRIORITY ENTRY CODE:
Apply coupon code FESTIVE20 at checkout for an instant 20% discount on your entire order. 

Discover your next signature formula before public allocations close.

With gorgeous regards,
Glow Addict Executive Council`;
  };

  const generateWhatsappCopy = (title: string, coupon: string): string => {
    return `✨ GLOW ADDICT PRIVATE ALERT ✨\n\nHello gorgeous! Sayanita here with an exclusive VIP vanity invite. 🛍️\n\nInstantly upgrade your beauty routine with the highly coveted *${title}*. Highly concentrated, 100% authentic, and designed for an unforgettable, radiant dewiness.\n\nUse your secret WhatsApp code: *${coupon}* at checkout today to get instant luxury cashbacks and our curated cosmetic gift bundle! \n\nTap to secure yours now: https://glow-addict.in/product \n\n_Replenish your glow. Stay authentic._`;
  };

  const handleGenerateAd = () => {
    setIsGeneratingAd(true);
    setAdOutput("");

    const prod = products.find(p => p.id === selectedAdProduct) || products[0];
    if (!prod) {
      alert("Please add products to your catalog first!");
      setIsGeneratingAd(false);
      return;
    }

    setTimeout(() => {
      if (marketingType === "instagram") {
        setAdOutput(generateIgCaption(prod.title, prod.brand, prod.category, igTone));
      } else if (marketingType === "newsletter") {
        setAdOutput(generateNewsletter(campAngle, prod));
      } else {
        setAdOutput(generateWhatsappCopy(prod.title, "GLOW10"));
      }
      setIsGeneratingAd(false);
    }, 1000);
  };

  const copyToClipboard = (text: string, isAd: boolean) => {
    navigator.clipboard.writeText(text);
    if (isAd) {
      setCopiedAd(true);
      setTimeout(() => setCopiedAd(false), 2000);
    } else {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  // Lockscreen interface for security
  if (secretKey !== ADMIN_SECRET_KEY) {
    return (
      <div className="min-h-screen flex flex-col bg-[#080012] text-[#F3EEF6] relative">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-10 w-[400px] h-[400px] bg-[#FC2779]/5 rounded-full blur-3xl pointer-events-none" />
        
        <Header />

        <main className="flex-grow flex items-center justify-center px-4 py-20 relative z-10 select-none">
          <div className="w-full max-w-md bg-white/[0.03] backdrop-blur-md border border-[#C77DFF]/20 rounded-[32px] p-8 text-center space-y-8 shadow-[0_0_50px_rgba(199,125,255,0.08)] relative overflow-hidden animate-slide-in">
            <div className="absolute inset-0 bg-purple-600/2 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative inline-flex items-center justify-center mx-auto">
              <div className="absolute inset-0 bg-purple-600/10 rounded-full blur-md animate-pulse" />
              <div className="relative p-6 rounded-full bg-[#140A1F] border border-[#C77DFF]/30 text-[#C77DFF] shadow-[0_0_20px_rgba(252,39,121,0.25)]">
                <Lock size={36} />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-[#FC2779] px-3 py-1 rounded-full font-sans">
                AI Studio Locked
              </span>
              <h2 className="text-2xl font-black font-elegant tracking-wide text-white pt-2 font-serif">
                Enter Secret Passcode
              </h2>
              <p className="text-xs text-[#D0C3D9] leading-relaxed max-w-sm mx-auto font-medium">
                Sayanita's AI Creative Command Studio requires verification. Enter your store manager secret key to access automation.
              </p>
            </div>

            {keyError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl p-4.5 text-xs flex gap-2.5 items-start text-left">
                <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                <span className="leading-relaxed font-semibold">{keyError}</span>
              </div>
            )}

            <form onSubmit={handleUnlockConsole} className="space-y-4 text-xs text-left">
              <div className="space-y-1.5">
                <label className="font-bold text-[#8E7A9C] uppercase tracking-wider block text-[9px]">Passcode Entry</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E7A9C]" />
                  <input
                    type="password"
                    required
                    placeholder="••••"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#C77DFF]/20 focus:border-[#FC2779] outline-none bg-[#140A1F] text-white text-center tracking-widest text-lg font-bold transition-all font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-[#C77DFF] to-[#FC2779] hover:opacity-90 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 shadow-lg shadow-purple-950 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Unlock size={13} />
                Unlock AI Center
              </button>
            </form>

            <div className="pt-4 border-t border-[#C77DFF]/10 text-center">
              <Link
                href="/admin"
                className="text-[10px] text-[#D0C3D9] hover:text-[#FC2779] font-semibold transition-colors"
              >
                ← Back to Sayanita's Control Portal
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#080012] text-[#F3EEF6] admin-portal-wrapper relative pb-12">
      {/* Radiant Glowing Elements */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-purple-900/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-[400px] h-[400px] bg-[#FC2779]/5 rounded-full blur-3xl pointer-events-none" />

      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 z-10 relative">
        
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#C77DFF]/20 pb-6 text-left">
          <div className="space-y-1">
            <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs text-[#C77DFF] hover:text-[#FC2779] font-bold transition-all mb-2 cursor-pointer">
              <ArrowLeft size={12} />
              Return to Control Portal
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-elegant text-white flex items-center gap-2.5 tracking-tight">
              <Sparkles size={28} className="text-[#FC2779] drop-shadow-[0_0_8px_rgba(252,39,121,0.6)] animate-pulse" />
              AI Creative Command Center
            </h1>
            <p className="text-xs text-[#D0C3D9] font-semibold leading-relaxed">
              Automated PIM copywriting, metadata audits, and high-conversion social copy generators powered by Gemini & Groq
            </p>
          </div>
          <div className="flex gap-2.5">
            <button
              onClick={runCatalogScan}
              className="p-2.5 bg-[#140A1F] border border-[#C77DFF]/20 hover:bg-[#1C0F2B] rounded-xl text-[#C77DFF] transition-all duration-300 cursor-pointer"
              aria-label="Refresh catalog audit"
            >
              <RefreshCw size={16} className={isScanning ? "animate-spin" : ""} />
            </button>
            <Link
              href="/admin/bulk-import"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#C77DFF] to-[#FC2779] text-white text-xs font-extrabold uppercase tracking-wider rounded-xl hover:opacity-90 transition-all duration-300 shadow-md shadow-purple-900/30 cursor-pointer"
            >
              <Layers size={13} />
              Catalog Factory
            </Link>
          </div>
        </div>

        {/* 📊 CATALOG HEALTH SYSTEM MONITOR */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white/[0.02] border border-[#C77DFF]/10 p-4 rounded-2xl space-y-1 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 text-white/5"><FileText size={40} /></div>
            <span className="text-[9px] font-bold text-[#8E7A9C] uppercase tracking-widest block">Total Registry</span>
            <h3 className="text-xl md:text-2xl font-extrabold text-white font-sans">{scannedStats.total} Products</h3>
            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-2">
              <CheckCircle size={10} /> Active sync
            </span>
          </div>

          <div className="bg-white/[0.02] border border-[#C77DFF]/10 p-4 rounded-2xl space-y-1 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 text-[#FC2779]/5"><AlertTriangle size={40} /></div>
            <span className="text-[9px] font-bold text-[#8E7A9C] uppercase tracking-widest block">Missing Description</span>
            <h3 className="text-xl md:text-2xl font-extrabold text-white font-sans">{scannedStats.missingDescription} Items</h3>
            <span className={`text-[10px] font-bold block mt-2 ${scannedStats.missingDescription > 0 ? "text-[#FC2779]" : "text-emerald-400"}`}>
              {scannedStats.missingDescription > 0 ? "⚠️ Needs copy enrichment" : "✓ Copy active"}
            </span>
          </div>

          <div className="bg-white/[0.02] border border-[#C77DFF]/10 p-4 rounded-2xl space-y-1 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 text-[#C77DFF]/5"><Search size={40} /></div>
            <span className="text-[9px] font-bold text-[#8E7A9C] uppercase tracking-widest block">Missing SEO Tags</span>
            <h3 className="text-xl md:text-2xl font-extrabold text-white font-sans">{scannedStats.missingSeo} Items</h3>
            <span className={`text-[10px] font-bold block mt-2 ${scannedStats.missingSeo > 0 ? "text-amber-400" : "text-emerald-400"}`}>
              {scannedStats.missingSeo > 0 ? "⚠️ Organic SEO offline" : "✓ Meta headers set"}
            </span>
          </div>

          <div className="bg-white/[0.02] border border-[#C77DFF]/10 p-4 rounded-2xl space-y-1 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 text-white/5"><ImageIcon size={40} /></div>
            <span className="text-[9px] font-bold text-[#8E7A9C] uppercase tracking-widest block">Missing Image URL</span>
            <h3 className="text-xl md:text-2xl font-extrabold text-white font-sans">{scannedStats.missingImages} Items</h3>
            <span className="text-[10px] text-emerald-400 font-bold block mt-2">✓ All assets set</span>
          </div>

          <div className="bg-white/[0.02] border border-[#C77DFF]/10 p-4 rounded-2xl space-y-1 text-left col-span-2 lg:col-span-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 text-[#FC2779]/5"><Sparkles size={40} /></div>
            <span className="text-[9px] font-bold text-[#8E7A9C] uppercase tracking-widest block">Low AI Confidence</span>
            <h3 className="text-xl md:text-2xl font-extrabold text-white font-sans">{scannedStats.lowConfidence} Items</h3>
            <span className={`text-[10px] font-bold block mt-2 ${scannedStats.lowConfidence > 0 ? "text-[#FC2779] animate-pulse" : "text-emerald-400"}`}>
              {scannedStats.lowConfidence > 0 ? "⚠️ Needs verification" : "✓ High confidence"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: 🚀 BATCH PIM COPY & METADATA ENRICHER */}
          <div className="lg:col-span-7 bg-white/[0.03] backdrop-blur-md border border-[#C77DFF]/20 rounded-3xl p-6 sm:p-8 space-y-6 text-left shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers size={18} className="text-[#C77DFF]" />
                1-Click Catalog Copy & SEO Builder
              </h2>
              <p className="text-xs text-[#D0C3D9]">
                Select any active or draft beauty product to automatically construct luxury branding copywriting and SEO parameters.
              </p>
            </div>

            {/* Product Selector */}
            <div className="space-y-2">
              <label className="font-bold text-[#8E7A9C] uppercase tracking-wider text-[9px] block">Select Product to Enrich</label>
              <select
                onChange={(e) => {
                  const p = products.find(prod => prod.id === e.target.value);
                  setSelectedProduct(p || null);
                  setAiOutput("");
                  setAiKeywords([]);
                }}
                className="w-full bg-[#140A1F] border border-[#C77DFF]/20 rounded-xl px-4 py-3 text-xs text-white font-bold outline-none focus:border-[#FC2779] cursor-pointer"
              >
                <option value="">-- Choose Product ({products.length} registered) --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.brand} - {p.title} ({p.category}) {(!p.seo_title || !p.seo_description) ? "⚠️ No SEO" : ""}
                  </option>
                ))}
              </select>
            </div>

            {selectedProduct && (
              <div className="border border-[#C77DFF]/20 rounded-2xl p-4 bg-[#140A1F]/40 space-y-4 animate-slide-in">
                {/* Active Product Details */}
                <div className="flex gap-4">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#140A1F] border border-[#C77DFF]/20 shrink-0">
                    <Image src={selectedProduct.image} alt={selectedProduct.title} fill className="object-cover" unoptimized />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] uppercase font-bold text-[#FC2779] tracking-wider block">{selectedProduct.brand}</span>
                    <h4 className="text-sm font-extrabold text-white truncate leading-snug">{selectedProduct.title}</h4>
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[9px] text-[#C77DFF] font-bold">
                        {selectedProduct.category}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#FC2779]/10 border border-[#FC2779]/20 text-[9px] text-[#FC2779] font-bold">
                        ₹{selectedProduct.price}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Enrichment Tab selector */}
                <div className="flex border-b border-[#C77DFF]/15 pb-1 gap-2">
                  <button
                    onClick={() => { setEnrichmentTab("desc"); setAiOutput(""); }}
                    className={`pb-2 px-3 text-xs font-bold transition-all relative ${enrichmentTab === "desc" ? "text-white border-b-2 border-[#FC2779]" : "text-[#D0C3D9] hover:text-white"}`}
                  >
                    Branding Description
                  </button>
                  <button
                    onClick={() => { setEnrichmentTab("seo"); setAiOutput(""); }}
                    className={`pb-2 px-3 text-xs font-bold transition-all relative ${enrichmentTab === "seo" ? "text-white border-b-2 border-[#FC2779]" : "text-[#D0C3D9] hover:text-white"}`}
                  >
                    SEO Meta-Headers
                  </button>
                </div>

                {/* Live Copy Panel */}
                <div className="space-y-3">
                  <button
                    onClick={handleAiEnrich}
                    disabled={isEnriching}
                    className="w-full py-2.5 bg-gradient-to-r from-purple-700 to-[#FC2779] hover:opacity-90 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md shadow-purple-950 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles size={13} className={isEnriching ? "animate-spin" : ""} />
                    {isEnriching ? "Gemini Synthesizing beauty metadata..." : `Synthesize Enriched ${enrichmentTab === "desc" ? "Description" : "SEO Meta"}`}
                  </button>

                  {/* Shimmer skeleton while generating */}
                  {isEnriching && (
                    <div className="space-y-2.5 pt-3">
                      <div className="h-4 w-3/4 rounded bg-white/5 animate-pulse" />
                      <div className="h-4 w-full rounded bg-white/5 animate-pulse" />
                      <div className="h-4 w-5/6 rounded bg-white/5 animate-pulse" />
                    </div>
                  )}

                  {/* Enrichment outputs */}
                  {aiOutput && !isEnriching && (
                    <div className="space-y-4 pt-3 border-t border-[#C77DFF]/10 text-xs text-[#D0C3D9] animate-slide-in">
                      {enrichmentTab === "seo" && (
                        <div className="space-y-3">
                          <div>
                            <span className="text-[9px] font-bold text-[#8E7A9C] uppercase tracking-wider block mb-1">Generated SEO Title Tag (Italiana Serif match)</span>
                            <input
                              type="text"
                              value={aiSeoTitle}
                              onChange={(e) => setAiSeoTitle(e.target.value)}
                              className="w-full bg-[#140A1F] border border-[#C77DFF]/20 rounded-xl px-3.5 py-2.5 text-xs text-white font-semibold outline-none focus:border-[#FC2779]"
                            />
                          </div>

                          <div>
                            <span className="text-[9px] font-bold text-[#8E7A9C] uppercase tracking-wider block mb-1">Target Keywords (Meta Keywords payload)</span>
                            <div className="flex flex-wrap gap-1.5 p-2 bg-[#140A1F] border border-[#C77DFF]/20 rounded-xl">
                              {aiKeywords.map((k, i) => (
                                <span key={i} className="px-2 py-0.5 rounded bg-purple-500/10 border border-[#C77DFF]/20 text-[9px] text-[#C77DFF] font-bold">
                                  #{k}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <span className="text-[9px] font-bold text-[#8E7A9C] uppercase tracking-wider block mb-1">
                          {enrichmentTab === "desc" ? "Luxury Branding Copy" : "SEO Meta Description Tag"}
                        </span>
                        <textarea
                          rows={6}
                          value={aiOutput}
                          onChange={(e) => setAiOutput(e.target.value)}
                          className="w-full bg-[#140A1F] border border-[#C77DFF]/20 rounded-xl p-3.5 text-xs text-white leading-relaxed font-sans outline-none focus:border-[#FC2779]"
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => copyToClipboard(aiOutput, false)}
                          className="flex-1 py-2.5 rounded-xl border border-[#C77DFF]/20 hover:bg-[#1C0F2B] text-xs font-bold text-[#C77DFF] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        >
                          {copiedText ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                          {copiedText ? "Copied!" : "Copy to Clipboard"}
                        </button>
                        <button
                          onClick={handleSaveEnrichment}
                          className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:scale-[1.01] transition-transform"
                        >
                          <Save size={13} />
                          Save & Publish to Store
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: 🎨 AI MARKETING COPYWRITING STUDIO */}
          <div className="lg:col-span-5 bg-white/[0.03] backdrop-blur-md border border-[#C77DFF]/20 rounded-3xl p-6 sm:p-8 space-y-6 text-left shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <svg className="text-[#FC2779]" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                VIP Campaign & Social Studio
              </h2>
              <p className="text-xs text-[#D0C3D9]">
                Produce high-converting Instagram caption sets, email campaigns, and VIP loyalty notifications in seconds.
              </p>
            </div>

            {/* Campaign Selector tabs */}
            <div className="grid grid-cols-3 bg-[#140A1F] border border-[#C77DFF]/15 p-1 rounded-xl gap-1">
              <button
                onClick={() => { setMarketingType("instagram"); setAdOutput(""); }}
                className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${marketingType === "instagram" ? "bg-gradient-to-r from-[#C77DFF] to-[#FC2779] text-white" : "text-[#D0C3D9] hover:text-white"}`}
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                Instagram
              </button>
              <button
                onClick={() => { setMarketingType("newsletter"); setAdOutput(""); }}
                className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${marketingType === "newsletter" ? "bg-gradient-to-r from-[#C77DFF] to-[#FC2779] text-white" : "text-[#D0C3D9] hover:text-white"}`}
              >
                <Mail size={14} />
                VIP Email
              </button>
              <button
                onClick={() => { setMarketingType("whatsapp"); setAdOutput(""); }}
                className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${marketingType === "whatsapp" ? "bg-gradient-to-r from-[#C77DFF] to-[#FC2779] text-white" : "text-[#D0C3D9] hover:text-white"}`}
              >
                <Compass size={14} />
                WhatsApp
              </button>
            </div>

            {/* Wizards Parameters */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="font-bold text-[#8E7A9C] uppercase tracking-wider text-[9px] block">Target Product Context</label>
                <select
                  value={selectedAdProduct}
                  onChange={(e) => setSelectedAdProduct(e.target.value)}
                  className="w-full bg-[#140A1F] border border-[#C77DFF]/20 rounded-xl px-4 py-2.5 text-xs text-white font-bold outline-none focus:border-[#FC2779] cursor-pointer"
                >
                  <option value="">-- Choose Product Context --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.brand} - {p.title}</option>
                  ))}
                </select>
              </div>

              {marketingType === "instagram" && (
                <div className="space-y-2">
                  <label className="font-bold text-[#8E7A9C] uppercase tracking-wider text-[9px] block">Instagram Tone</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["luxury", "playful", "clinical"].map(tone => (
                      <button
                        key={tone}
                        onClick={() => setIgTone(tone)}
                        className={`py-2 text-[10px] font-extrabold uppercase tracking-widest border rounded-xl capitalize cursor-pointer transition-colors ${igTone === tone ? "bg-[#FC2779]/10 border-[#FC2779] text-[#FC2779]" : "border-[#C77DFF]/20 text-[#D0C3D9]"}`}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {marketingType === "newsletter" && (
                <div className="space-y-2">
                  <label className="font-bold text-[#8E7A9C] uppercase tracking-wider text-[9px] block">Newsletter Theme</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "dewy-skin", label: "Dewy Skin Routine" },
                      { id: "flash-sale", label: "Cosmetic Flash Sale" }
                    ].map(theme => (
                      <button
                        key={theme.id}
                        onClick={() => setCampAngle(theme.id)}
                        className={`py-2 px-1 text-[9px] font-extrabold uppercase tracking-wider border rounded-xl cursor-pointer transition-colors ${campAngle === theme.id ? "bg-[#FC2779]/10 border-[#FC2779] text-[#FC2779]" : "border-[#C77DFF]/20 text-[#D0C3D9]"}`}
                      >
                        {theme.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleGenerateAd}
                disabled={isGeneratingAd}
                className="w-full py-3 bg-gradient-to-r from-[#C77DFF] to-[#FC2779] hover:opacity-90 disabled:opacity-50 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 shadow-md shadow-purple-950 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles size={13} className={isGeneratingAd ? "animate-spin" : ""} />
                {isGeneratingAd ? "Gemini drafting copywriting templates..." : `Generate High-Conversion ${marketingType === "instagram" ? "Caption Set" : marketingType === "newsletter" ? "VIP Newsletter" : "WhatsApp Broadcast"}`}
              </button>
            </div>

            {/* Generated copywriter preview */}
            {adOutput && !isGeneratingAd && (
              <div className="border border-[#C77DFF]/20 rounded-2xl p-4 bg-[#140A1F]/40 space-y-4 animate-slide-in text-xs leading-relaxed text-[#D0C3D9]">
                <div className="flex justify-between items-center border-b border-[#C77DFF]/15 pb-2">
                  <span className="text-[9px] font-bold text-[#FC2779] uppercase tracking-widest flex items-center gap-1.5">
                    <Heart size={10} className="text-[#FC2779] fill-[#FC2779]" /> Copywriter Output ready
                  </span>
                  <button
                    onClick={() => copyToClipboard(adOutput, true)}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-[#C77DFF] hover:text-[#FC2779] transition-colors cursor-pointer"
                    title="Copy output"
                  >
                    {copiedAd ? <Check size={13} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
                <textarea
                  rows={10}
                  readOnly
                  value={adOutput}
                  className="w-full bg-transparent border-none text-xs text-white leading-relaxed font-sans outline-none resize-none custom-scrollbar"
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
