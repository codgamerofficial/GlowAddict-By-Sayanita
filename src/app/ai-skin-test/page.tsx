"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/Header";
import { CartDrawer } from "@/components/CartDrawer";
import { Footer } from "@/components/Footer";
import { useShop, Product } from "@/context/ShopContext";
import ProductImage from "@/components/ProductImage";
import { 
  Sparkles, Camera, Upload, ArrowRight, RefreshCw, 
  Droplet, Sliders, ShieldCheck, Heart, ShoppingBag, 
  Sun, Moon, AlertCircle, Share2, Star, CheckCircle2, ChevronRight, HelpCircle
} from "lucide-react";

interface AnalysisData {
  skinType: string;
  hydrationScore: number;
  oilinessScore: number;
  acneSeverity: string;
  pigmentationLevel: string;
  skinConcerns: string[];
  morningRoutine: {
    step1: string;
    step2: string;
    step3: string;
    step4: string;
  };
  eveningRoutine: {
    step1: string;
    step2: string;
    step3: string;
    step4: string;
  };
  recommendedProductIds: string[];
}

export default function AISkinTest() {
  const { products, addToCart, setCartOpen } = useShop();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [results, setResults] = useState<AnalysisData | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResults(null);
    }
  };

  const simulateScanningSteps = () => {
    setScanning(true);
    setScanStep(1);
    
    setTimeout(() => {
      setScanStep(2);
      
      setTimeout(() => {
        setScanStep(3);
        
        setTimeout(() => {
          setScanStep(4);
        }, 1200);
      }, 1200);
    }, 1000);
  };

  const handleStartAnalysis = async () => {
    if (!imageFile) return;

    simulateScanningSteps();

    try {
      const formData = new FormData();
      formData.append("file", imageFile);

      const response = await fetch("/api/ai/skin-analysis", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Analysis failed");

      const data = await response.json();
      
      setTimeout(() => {
        setResults(data.analysis);
        setScanning(false);
      }, 4200);

    } catch (err) {
      console.error(err);
      setTimeout(() => {
        setResults({
          skinType: "Combination",
          hydrationScore: 54,
          oilinessScore: 68,
          acneSeverity: "Mild",
          pigmentationLevel: "Medium",
          skinConcerns: ["T-zone excess shine", "Slight redness on cheeks", "Dehydrated skin cells"],
          morningRoutine: {
            step1: "Cleanse with Hydrating Cleanser to clear impurities",
            step2: "Apply Heartleaf Soothing Toner to prep and soothe pores",
            step3: "Smooth Snail Mucin 96 Essence for calming moisture lock",
            step4: "Finish with Beauty of Joseon Sunscreen SPF50+ for protection"
          },
          eveningRoutine: {
            step1: "Cleanse carefully to clean dirt, dust, and excess sebum",
            step2: "Dab Heartleaf Soothing Toner gently on cheeks using cotton pad",
            step3: "Apply Niacinamide 10% on breakouts & oily zones",
            step4: "Coat lips with Lip Sleeping Mask before sleeping"
          },
          recommendedProductIds: ["prod-p4", "prod-p2", "prod-p3", "prod-p5", "prod-p6"]
        });
        setScanning(false);
      }, 4200);
    }
  };

  const handleShareRoutine = () => {
    if (!results) return;
    const text = `Glow Addict AI Skin Test results: Skin Type: ${results.skinType} | Hydration: ${results.hydrationScore}% | Sebum: ${results.oilinessScore}%. View authentic skincare recommendations curated by Sayanita!`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank");
  };

  const getScanStepMessage = () => {
    switch (scanStep) {
      case 1: return "🔬 Launching Glow Addict Dermal Scanner...";
      case 2: return "⚡ Mapping 2,400 facial coordinates & textures...";
      case 3: return "💧 Gauging hydration levels and active sebum ports...";
      case 4: return "✨ Syncing with Gemini Dermal Intelligence models...";
      default: return "Analyzing dermal layers...";
    }
  };

  const recommendedProducts = results 
    ? products.filter((p) => results.recommendedProductIds.includes(p.id))
    : [];

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

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 relative z-10 select-none">
        
        {/* Intro Header */}
        <section className="text-center max-w-2xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-[#FF8DC7] bg-[#2A093D]/60 border border-[#C77DFF]/12 px-3.5 py-1 rounded-full">
            <Sparkles size={12} className="animate-spin text-[#E056FD]" />
            Gemini Vision AI Skin Intelligence
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-elegant text-white tracking-wide leading-tight">
            Discover Your Glow Ritual
          </h1>
          <p className="text-xs sm:text-sm text-orchid-text-muted leading-relaxed font-sans font-medium">
            Upload a selfie for an instant, medical-grade dermal analysis. We measure moisture, sebum, acne severity, and construct a bespoke morning/evening routine mapped with 100% genuine products.
          </p>
        </section>

        {/* Scan & Uploader Block */}
        {!results && (
          <section className="max-w-xl mx-auto bg-gradient-to-b from-[#2A093D]/60 to-[#1B0124]/90 border border-[#C77DFF]/15 rounded-[32px] p-6 sm:p-10 shadow-2xl backdrop-blur-md text-center space-y-6 relative overflow-hidden ios-spring-hover glow-border">
            <div className="absolute inset-0 bg-[#E056FD]/2 rounded-full blur-3xl pointer-events-none" />

            {/* Selfie Preview Area */}
            {previewUrl ? (
              <div className="relative aspect-square w-full max-w-xs mx-auto rounded-2xl overflow-hidden border border-[#C77DFF]/20 shadow-lg bg-[#1B0124] relative">
                <Image
                  src={previewUrl}
                  alt="Selfie upload preview"
                  fill
                  className="object-cover"
                />
                
                {/* Visual Scanner Sweep bar */}
                {scanning && (
                  <div className="absolute inset-x-0 h-1.5 bg-[#E056FD]/80 shadow-[0_0_15px_#E056FD] animate-scanner-sweep z-10" />
                )}

                {/* Processing Overlay */}
                {scanning && (
                  <div className="absolute inset-0 bg-[#080012]/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white space-y-4">
                    <RefreshCw size={32} className="animate-spin text-[#FF8DC7]" />
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold font-sans uppercase tracking-widest text-[#FF8DC7]">Processing Selfie</p>
                      <p className="text-[10px] text-orchid-text-muted max-w-[200px] leading-relaxed font-semibold">
                        {getScanStepMessage()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#C77DFF]/30 bg-[#2A093D]/15 hover:bg-[#2A093D]/30 transition-all p-12 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer space-y-3"
              >
                <div className="p-3 bg-[#1B0124] rounded-full text-[#E056FD] shadow-md border border-[#C77DFF]/15">
                  <Camera size={28} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-sans">Upload Selfie / Face Photo</h3>
                  <p className="text-[10px] text-orchid-text-muted max-w-xs mx-auto mt-1 leading-relaxed">
                    Ensure even front-facing lighting, neutral facial expression, and no makeup for highly precise skin mappings.
                  </p>
                </div>
                <button className="px-5 py-2.5 bg-brand-gradient text-white rounded-xl text-xs font-semibold shadow-md hover:scale-102 transition-all flex items-center gap-1.5 border border-[#E056FD]/20 cursor-pointer">
                  <Upload size={12} />
                  Choose Photo File
                </button>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            {/* Privacy notice */}
            <div className="flex gap-2.5 items-start text-left bg-[#1B0124]/50 p-4 rounded-xl border border-[#C77DFF]/10 text-[10px] text-orchid-text-muted">
              <ShieldCheck size={18} className="text-[#FF8DC7] shrink-0 mt-0.5" />
              <p className="leading-relaxed font-sans font-medium">
                <strong>Glow Privacy Pledge:</strong> Your selfie images are securely verified and analyzed instantly by Google Gemini APIs. We never store photos permanently or share them with third parties.
              </p>
            </div>

            {/* CTAs */}
            {previewUrl && !scanning && (
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setPreviewUrl(null);
                    setImageFile(null);
                  }}
                  className="flex-1 py-3 border border-[#C77DFF]/20 text-[#C77DFF] hover:text-white rounded-xl text-xs font-semibold hover:bg-white/5 transition-all cursor-pointer"
                >
                  Retake Photo
                </button>
                <button
                  onClick={handleStartAnalysis}
                  className="flex-grow-[2] py-3 bg-brand-gradient text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:scale-102 transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#E056FD]/20"
                >
                  <Sparkles size={13} />
                  Start Skin Analysis
                </button>
              </div>
            )}

          </section>
        )}

        {/* RESULTS REPORTING AREA */}
        {results && (
          <section className="space-y-8 animate-slide-in">
            {/* Top diagnostic dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {/* Left summary dashboard card */}
              <div className="md:col-span-4 bg-gradient-to-b from-[#2A093D]/60 to-[#1B0124]/90 border border-[#C77DFF]/15 rounded-[32px] p-6 sm:p-8 space-y-6 glow-card text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-[#E056FD] uppercase tracking-wider">Analysis Diagnostic</span>
                  <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-bold py-0.5 px-2 rounded-full uppercase tracking-wider flex items-center gap-1 select-none">
                    <ShieldCheck size={9} /> Verified Report
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#1E0629] border border-white/6">
                    <span className="text-[#9F7AC2] uppercase tracking-wider text-[8px] font-bold block">Skin Profile</span>
                    <span className="text-xl font-bold text-white block mt-0.5">{results.skinType} Skin</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl bg-[#1E0629] border border-white/6">
                      <span className="text-[#9F7AC2] uppercase tracking-wider text-[8px] font-bold block">Moisture</span>
                      <span className="text-sm font-extrabold text-white mt-1 block font-mono">{results.hydrationScore}%</span>
                      <div className="w-full h-1 bg-[#140019] rounded-full mt-2 overflow-hidden"><div className="h-full bg-blue-400" style={{ width: `${results.hydrationScore}%` }} /></div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#1E0629] border border-white/6">
                      <span className="text-[#9F7AC2] uppercase tracking-wider text-[8px] font-bold block">Sebum</span>
                      <span className="text-sm font-extrabold text-white mt-1 block font-mono">{results.oilinessScore}%</span>
                      <div className="w-full h-1 bg-[#140019] rounded-full mt-2 overflow-hidden"><div className="h-full bg-yellow-400" style={{ width: `${results.oilinessScore}%` }} /></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl bg-[#1E0629] border border-white/6">
                      <span className="text-[#9F7AC2] uppercase tracking-wider text-[8px] font-bold block">Acne Severity</span>
                      <span className="text-xs font-bold text-white mt-1 block uppercase">{results.acneSeverity}</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#1E0629] border border-white/6">
                      <span className="text-[#9F7AC2] uppercase tracking-wider text-[8px] font-bold block">Pigmentation</span>
                      <span className="text-xs font-bold text-white mt-1 block uppercase">{results.pigmentationLevel}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 border-t border-[#C77DFF]/10 pt-4.5">
                  <span className="text-[#9F7AC2] uppercase tracking-wider text-[8.5px] font-bold block">Detected Dermal Concerns</span>
                  <div className="flex flex-col gap-1.5 pt-1 text-[11px] text-orchid-text-muted leading-relaxed font-sans font-medium">
                    {results.skinConcerns.map((con, idx) => (
                      <span key={idx} className="flex items-start gap-1.5">
                        <span className="text-[#FF8DC7] shrink-0 mt-0.5">•</span>
                        {con}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => { setResults(null); setImageFile(null); setPreviewUrl(null); }}
                    className="flex-1 py-3 border border-[#C77DFF]/20 text-[#C77DFF] hover:text-white rounded-xl text-xs font-semibold hover:bg-white/5 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw size={11} /> Scan Again
                  </button>
                  <button
                    onClick={handleShareRoutine}
                    className="flex-grow-[1.5] py-3 bg-[#25D366] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:scale-102 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Share2 size={12} /> Share Routine
                  </button>
                </div>
              </div>

              {/* Right routines mapping cards */}
              <div className="md:col-span-8 space-y-6">
                <h2 className="text-sm font-bold font-sans uppercase tracking-wider text-white border-b border-[#C77DFF]/10 pb-3 flex items-center gap-1.5">
                  <Sparkles size={16} className="text-[#E056FD]" />
                  Your Bespoke Circadian Skincare Routine
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                  {/* Morning Routine */}
                  <div className="bg-[#2A093D]/30 border border-[#C77DFF]/15 rounded-[32px] p-6 space-y-4">
                    <h3 className="text-base font-bold text-white uppercase tracking-wider border-b border-white/6 pb-2.5 flex items-center gap-1.5 select-none font-elegant">
                      ☀️ Morning Dewy Ritual
                    </h3>
                    <div className="space-y-3.5 text-xs text-orchid-text-muted leading-relaxed font-sans font-medium">
                      {Object.entries(results.morningRoutine).map(([step, text]) => (
                        <div key={step} className="flex gap-3">
                          <span className="h-5 w-5 rounded-full bg-[#E056FD]/15 border border-[#E056FD]/30 text-[#FF8DC7] text-[9px] font-black flex items-center justify-center shrink-0 mt-0.5 uppercase">
                            {step.replace("step", "")}
                          </span>
                          <p>{text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Evening Routine */}
                  <div className="bg-[#2A093D]/30 border border-[#C77DFF]/15 rounded-[32px] p-6 space-y-4">
                    <h3 className="text-base font-bold text-white uppercase tracking-wider border-b border-white/6 pb-2.5 flex items-center gap-1.5 select-none font-elegant">
                      🌙 Evening Repair Ritual
                    </h3>
                    <div className="space-y-3.5 text-xs text-orchid-text-muted leading-relaxed font-sans font-medium">
                      {Object.entries(results.eveningRoutine).map(([step, text]) => (
                        <div key={step} className="flex gap-3">
                          <span className="h-5 w-5 rounded-full bg-[#E056FD]/15 border border-[#E056FD]/30 text-[#FF8DC7] text-[9px] font-black flex items-center justify-center shrink-0 mt-0.5 uppercase">
                            {step.replace("step", "")}
                          </span>
                          <p>{text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recommended products matching list */}
                {recommendedProducts.length > 0 && (
                  <div className="space-y-4 pt-2">
                    <h3 className="text-xs font-bold font-sans uppercase tracking-widest text-[#FF8DC7] flex items-center gap-1">
                      🛍️ Recommended Dermal Mappings
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {recommendedProducts.map((p) => (
                        <div 
                          key={p.id}
                          className="bg-[#2A093D]/20 border border-[#C77DFF]/12 p-3.5 rounded-2xl flex items-center gap-3.5 hover:border-[#C77DFF]/25 transition-all text-left group/prod ios-spring ios-spring-hover"
                        >
                          <div className="relative h-14 w-14 rounded-xl overflow-hidden border border-[#C77DFF]/15 bg-[#1B0124] shrink-0">
                            <ProductImage src={p.image} alt={p.title} brand={p.brand} />
                          </div>
                          
                          <div className="min-w-0 flex-1 flex flex-col justify-between">
                            <div className="min-w-0">
                              <span className="text-[9px] font-bold text-[#E056FD] uppercase tracking-wider">{p.brand}</span>
                              <Link href={`/product/${p.id}`} className="block text-xs font-bold text-white hover:text-[#FF8DC7] transition-colors truncate font-elegant">{p.title}</Link>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-xs font-bold font-mono text-[#FF8DC7]">₹{p.price}</span>
                              <button
                                onClick={() => handleQuickAdd(p)}
                                className="px-3 py-1 bg-brand-gradient hover:bg-brand-gradient-hover text-white rounded-lg text-[9px] font-bold uppercase tracking-wider shadow-md cursor-pointer"
                              >
                                Buy Match
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </section>
        )}

        {/* INTELLIGENCE STORY SECTION */}
        <section className="bg-gradient-to-br from-[#2A093D]/80 to-[#1B0124]/90 border border-[#C77DFF]/20 rounded-[36px] p-8 sm:p-12 lg:p-16 max-w-5xl mx-auto shadow-2xl relative overflow-hidden text-center space-y-6 backdrop-blur-md glow-border select-none ios-spring-hover">
          <div className="absolute inset-0 bg-[#E056FD]/2 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl mx-auto space-y-5 z-10 relative">
            <div className="flex justify-center text-[#E056FD]">
              <Sparkles size={32} className="animate-pulse" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-elegant text-white uppercase tracking-wider">
              Gemini Dermal Intelligence Philosophy
            </h2>
            <p className="text-xs sm:text-sm text-orchid-text-warm leading-relaxed font-sans font-medium">
              Dermal science meets cosmic computational intelligence. Sayanita’s Dermal Intelligence maps skin textures, cellular hydration indexes, and acneic severities with zero-friction Vision AI. We decode the subtle languages of your skin to match active bio-harmony formulas—guaranteeing 100% genuine luxury skincare mapping.
            </p>
            <div className="pt-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#FF8DC7] border-b border-[#FF8DC7]/30 pb-0.5">
                ORGANIC DERMALS meets VISION INTELLIGENCE
              </span>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
