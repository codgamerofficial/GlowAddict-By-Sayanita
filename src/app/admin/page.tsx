"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useShop, Claim, Product, Order, UserProfile } from "@/context/ShopContext";
import { Header } from "@/components/Header";
import AdminInventory from "@/components/admin/AdminInventory";
import { 
  ShieldCheck, 
  IndianRupee, 
  ShieldAlert, 
  Package, 
  Check, 
  Send, 
  Sparkles, 
  RefreshCcw, 
  Eye, 
  X, 
  Sliders, 
  Plus, 
  Trash2, 
  TrendingUp, 
  Lock, 
  Unlock,
  Users,
  Layers,
  Search,
  Globe,
  FileImage,
  Activity,
  Heart,
  ChevronRight,
  AlertTriangle,
  Grid
} from "lucide-react";
import "@/app/admin/admin-inventory.css";

interface Coupon {
  code: string;
  discount_percent: number;
  discount_flat: number;
  min_cart_value: number;
}

type AdminTab = 
  | "dashboard" 
  | "orders" 
  | "inventory" 
  | "beauty-crm" 
  | "collections" 
  | "media" 
  | "seo-center" 
  | "claims" 
  | "coupons" 
  | "users" 
  | "settings"
  | "account-system"
  | "customer-insights";

const ADMIN_SECRET_KEY = "0909";

const DEFAULT_COUPONS: Coupon[] = [
  { code: "GLOW10", discount_percent: 10, discount_flat: 0, min_cart_value: 0 },
  { code: "AUTHENTIC", discount_percent: 0, discount_flat: 100, min_cart_value: 500 },
  { code: "FESTIVE20", discount_percent: 20, discount_flat: 0, min_cart_value: 0 },
];

export default function AdminDashboard({ initialTab = "dashboard" }: { initialTab?: AdminTab }) {
  const {
    products,
    orders,
    claims,
    settings,
    adminAddProduct,
    adminRemoveProduct,
    adminVerifyPayment,
    adminShipOrder,
    adminDeliverOrder,
    adminResolveClaim,
    adminToggleCod,
    adminUpdateStock,
    adminUpdateProductPrice,
    adminUpdateProduct,
    adminUsers,
    adminSuspendUser,
    adminUnsuspendUser,
    adminAdjustLoyaltyPoints
  } = useShop();

  const [secretKey, setSecretKey] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [keyError, setKeyError] = useState("");

  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);

  const [selectedShipOrder, setSelectedShipOrder] = useState<string | null>(null);
  const [courierName, setCourierName] = useState("BlueDart");
  const [trackingCode, setTrackingCode] = useState("");

  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null);
  const [labelModalOrder, setLabelModalOrder] = useState<Order | null>(null);

  const [adminCoupons, setAdminCoupons] = useState<Coupon[]>(DEFAULT_COUPONS);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discount_percent: "",
    min_cart_value: ""
  });

  const [adminApiKey, setAdminApiKey] = useState("");

  // Beauty CRM Profile selector
  const [selectedCustomerCrm, setSelectedCustomerCrm] = useState<UserProfile | null>(null);
  const [generatedRoutine, setGeneratedRoutine] = useState<string[]>([]);
  const [routineCrossSells, setRoutineCrossSells] = useState<Product[]>([]);

  // Visual Collection Builder states
  const [selectedCollection, setSelectedCollection] = useState("glass-skin");
  const [customCollections, setCustomCollections] = useState<Record<string, string[]>>({
    "glass-skin": ["prod-serum-1", "prod-hydra-1"],
    "spf-shield": ["prod-spf-1"],
    "cashmere-lips": [],
  });
  const [searchCollectionQuery, setSearchCollectionQuery] = useState("");

  // Media Library state
  const [mediaAssets, setMediaAssets] = useState<{ id: string; name: string; url: string; size: string; type: "image" | "video"; tag: string }[]>([
    { id: "1", name: "Sayanita Editorial Signature.png", url: "/signature.png", size: "340 KB", type: "image", tag: "editorial" },
    { id: "2", name: "Glazed Serum Shot.webp", url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500", size: "1.2 MB", type: "image", tag: "product-hero" },
    { id: "3", name: "Unboxing Verif GA-9182.mp4", url: "/unboxing.mp4", size: "18.4 MB", type: "video", tag: "claim-dispute" },
    { id: "4", name: "SPF Shield Active Shoot.webp", url: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=500", size: "840 KB", type: "image", tag: "spf-care" }
  ]);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // SEO Audit Engine states
  const [seoScanResults, setSeoScanResults] = useState<{ id: string; title: string; missingFields: string[]; score: number }[]>([]);
  const [isAuditingSeo, setIsAuditingSeo] = useState(false);

  // Hydrate browser-storage states
  useEffect(() => {
    const storedKey = sessionStorage.getItem("glow_admin_secret_key") || "";
    if (storedKey) setSecretKey(storedKey);

    const savedCoupons = localStorage.getItem("glow_admin_coupons");
    if (savedCoupons) {
      try { setAdminCoupons(JSON.parse(savedCoupons)); } catch { /* ignore */ }
    }

    let apiKey = sessionStorage.getItem("glow_admin_api_key") || "";
    if (!apiKey && process.env.NEXT_PUBLIC_ADMIN_API_KEY) {
      apiKey = process.env.NEXT_PUBLIC_ADMIN_API_KEY;
      sessionStorage.setItem("glow_admin_api_key", apiKey);
    }
    if (apiKey) setAdminApiKey(apiKey);

    // Bootstrap Visual Collections using actual catalog items if empty
    if (products.length > 0) {
      setCustomCollections({
        "glass-skin": products.filter(p => p.category === "Serums" || p.category === "Hydration").slice(0, 3).map(p => p.id),
        "spf-shield": products.filter(p => p.category === "SPF Care").map(p => p.id),
        "cashmere-lips": products.filter(p => p.category === "Lipsticks").map(p => p.id),
      });
    }

    runSeoAudit();
  }, [products]);

  // Map backward-compatible tabs to their new beautiful interfaces
  useEffect(() => {
    if (initialTab === "account-system") {
      setActiveTab("settings");
    } else if (initialTab === "customer-insights") {
      setActiveTab("beauty-crm");
    }
  }, [initialTab]);

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

  const handleLockConsole = () => {
    setSecretKey("");
    sessionStorage.removeItem("glow_admin_secret_key");
    setKeyInput("");
  };

  // Coupons
  const handleAddCoupon = () => {
    if (!newCoupon.code.trim() || !newCoupon.discount_percent) {
      alert("Please fill in the coupon code and discount percentage.");
      return;
    }
    const percent = parseInt(newCoupon.discount_percent);
    const minVal = parseInt(newCoupon.min_cart_value) || 0;
    if (percent <= 0 || percent > 100) {
      alert("Discount rate must be between 1 and 100.");
      return;
    }
    const updated = [
      ...adminCoupons,
      { code: newCoupon.code.trim().toUpperCase(), discount_percent: percent, discount_flat: 0, min_cart_value: minVal }
    ];
    setAdminCoupons(updated);
    localStorage.setItem("glow_admin_coupons", JSON.stringify(updated));
    setNewCoupon({ code: "", discount_percent: "", min_cart_value: "" });
    alert("New promo coupon successfully created!");
  };

  const handleDeleteCoupon = (code: string) => {
    const updated = adminCoupons.filter((c) => c.code !== code);
    setAdminCoupons(updated);
    localStorage.setItem("glow_admin_coupons", JSON.stringify(updated));
  };

  // Fulfillment and dispute resolutions
  const handleVerifyPrepaid = (orderId: string) => {
    adminVerifyPayment(orderId);
    alert(`Prepaid UPI Payment successfully confirmed for order ${orderId}! Status updated to 'Packed'.`);
  };

  const handleShipOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipOrder || !trackingCode) return;
    adminShipOrder(selectedShipOrder, courierName, trackingCode);
    setSelectedShipOrder(null);
    setTrackingCode("");
    alert(`Shipment registered. Order ${selectedShipOrder} dispatched via ${courierName}.`);
  };

  const handleResolveClaim = (claimId: string, status: "approved" | "rejected") => {
    if (!resolutionNotes) {
      alert("Please enter resolution notes explaining your decision.");
      return;
    }
    adminResolveClaim(claimId, status, resolutionNotes);
    setSelectedClaim(null);
    setResolutionNotes("");
    alert(`Dispute claim resolved: ${status.toUpperCase()}. Customer dashboard updated.`);
  };

  // --- BEAUTY CRM AI ROUTINE ENGINE ---
  const handleCrmSelect = (customer: UserProfile) => {
    setSelectedCustomerCrm(customer);
    
    // Simulate Gemini Skin Profile Routing
    const skinType = customer.skin_type || "normal";
    const routineOptions: Record<string, string[]> = {
      dry: ["Cleansing Milk", "Ceramide Toner", "Hydrating Glazed Serum", "Intense Moisture Lock Cream"],
      oily: ["Salicylic Gel Cleanser", "Pore Clarifying Mist", "Lactic Acid 10% Serum", "Ultra-Light Matte Gel SPF"],
      combination: ["Dewy Foam Cleanser", "Centella Balancing Toner", "Niacinamide Radiance Serum", "Barrier Defense SPF 50"],
      sensitive: ["Hypoallergenic Milk Cleanser", "Calming Oats Mist", "Centella Soothing Gel", "Physical Zinc Sunscreen"],
      normal: ["Hydrating Gel Cleanser", "Rose Nectar Mist", "Squalane Glow Elixir", "Lit-From-Within SPF 50"]
    };

    setGeneratedRoutine(routineOptions[skinType] || routineOptions.normal);
    
    // Cross sell matches
    const cross = products.filter(p => 
      p.category === "Serums" || p.category === "Hydration" || p.category === "SPF Care"
    ).slice(0, 3);
    setRoutineCrossSells(cross);
  };

  // --- VISUAL COLLECTION BUILDER ---
  const handleToggleCollectionItem = (prodId: string) => {
    const activeList = customCollections[selectedCollection] || [];
    let updated;
    if (activeList.includes(prodId)) {
      updated = activeList.filter(id => id !== prodId);
    } else {
      updated = [...activeList, prodId];
    }
    const next = { ...customCollections, [selectedCollection]: updated };
    setCustomCollections(next);
  };

  // --- MEDIA LIBRARY UPLOADER ---
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMedia(true);
    setTimeout(() => {
      const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      const isVideo = file.type.includes("video");
      const newAsset = {
        id: String(Date.now()),
        name: file.name,
        url: isVideo ? "/unboxing.mp4" : URL.createObjectURL(file),
        size: sizeStr,
        type: isVideo ? "video" as const : "image" as const,
        tag: "user-upload"
      };
      setMediaAssets([newAsset, ...mediaAssets]);
      setUploadingMedia(false);
      alert("New marketing asset successfully registered in catalog media vaults!");
    }, 1000);
  };

  // --- PIM SEO CENTER AUDITING ---
  const runSeoAudit = () => {
    setIsAuditingSeo(true);
    setTimeout(() => {
      const results = products.map(p => {
        const missing = [];
        let score = 100;
        if (!p.seo_title) { missing.push("SEO Title Tag"); score -= 30; }
        if (!p.seo_description) { missing.push("SEO Meta Description"); score -= 40; }
        if (!p.seo_keywords || p.seo_keywords.length === 0) { missing.push("SEO Keywords"); score -= 20; }
        if (!p.slug) { missing.push("Canonical URL Slug"); score -= 10; }
        return { id: p.id, title: p.title, missingFields: missing, score };
      }).filter(r => r.missingFields.length > 0);
      
      setSeoScanResults(results);
      setIsAuditingSeo(false);
    }, 500);
  };

  const handleFixSeoAuto = (prodId: string) => {
    const p = products.find(prod => prod.id === prodId);
    if (!p) return;

    const seo_title = `${p.title} | Premium Skincare by ${p.brand} | Glow Addict`;
    const seo_description = `Shop authentic ${p.title} by ${p.brand}. Pure cosmetic curation designed to unlock natural radiance. Free VIP checkout shipping inside India.`;
    const keywords = [p.brand.toLowerCase(), p.category.toLowerCase(), "glow addict", "authentic beauty"];

    adminUpdateProduct(prodId, {
      seo_title,
      seo_description,
      seo_keywords: keywords,
      slug: p.title.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, "").split(" ").join("-")
    });

    alert(`Gemini auto-patched SEO meta parameters successfully for ${p.title}!`);
    runSeoAudit();
  };

  // Revenue & Metrics Calculations
  const totalSales = orders
    .filter((o) => o.payment_status === "paid")
    .reduce((sum, o) => sum + o.total_amount, 0);

  const pendingVerificationOrders = orders.filter((o) => o.payment_status === "pending_verification");
  const activeClaimsCount = claims.filter((c) => c.status === "pending").length;

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
                Creator Console Locked
              </span>
              <h2 className="text-2xl font-black font-elegant tracking-wide text-white pt-2 font-serif">
                Enter Secret Key
              </h2>
              <p className="text-xs text-[#D0C3D9] leading-relaxed max-w-sm mx-auto font-medium">
                The Glow Addict administration console is locked. Enter Sayanita's passcode to access e-commerce operations.
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
                Unlock Admin Console
              </button>
            </form>

            <div className="pt-4 border-t border-[#C77DFF]/10 text-center">
              <Link
                href="/"
                className="text-[10px] text-[#D0C3D9] hover:text-[#C77DFF] font-semibold transition-colors"
              >
                ← Return to Public Catalog
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Define sidebar navigation items
  const sidebarItems: { id: AdminTab; label: string; icon: React.ComponentType<{ size: number }> }[] = [
    { id: "dashboard", label: "Ledger Summary", icon: TrendingUp },
    { id: "orders", label: `Prepaid Orders (${orders.length})`, icon: Package },
    { id: "inventory", label: "Products Registry", icon: Sliders },
    { id: "beauty-crm", label: "Beauty CRM Insights", icon: Heart },
    { id: "collections", label: "Collection Builder", icon: Layers },
    { id: "media", label: "Media Assets", icon: FileImage },
    { id: "seo-center", label: "SEO PIM Sweeper", icon: Globe },
    { id: "claims", label: `Disputes Claims (${claims.length})`, icon: ShieldAlert },
    { id: "coupons", label: "Promo Coupons", icon: Sparkles },
    { id: "users", label: "Registered Users", icon: Users },
    { id: "settings", label: "System Gateways", icon: Activity },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#080012] text-[#F3EEF6] admin-portal-wrapper relative pb-12">
      {/* Background dewy blooms */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-purple-900/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-[#FC2779]/5 rounded-full blur-3xl pointer-events-none" />

      <Header />

      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8 relative z-10">
        
        {/* ===================================================
            🔥 SIDE NAVIGATION BAR (Lg screen vertical layout)
            =================================================== */}
        <aside className="lg:w-64 shrink-0 flex flex-col gap-6">
          
          {/* Logo & lock status card */}
          <div className="bg-white/[0.03] backdrop-blur-md border border-[#C77DFF]/20 rounded-3xl p-5 text-left space-y-4">
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={22} className="text-[#FC2779] drop-shadow-[0_0_6px_rgba(252,39,121,0.5)]" />
              <h2 className="text-sm font-black font-elegant tracking-wider uppercase text-white font-serif">Glow Control OS</h2>
            </div>
            
            <div className="text-[10px] text-[#D0C3D9] leading-relaxed">
              Active Session: <strong className="text-white">Admin Sayanita</strong>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 p-2 bg-[#140A1F] border border-[#C77DFF]/20 hover:bg-[#1C0F2B] rounded-xl text-[#C77DFF] transition-all flex items-center justify-center cursor-pointer"
                title="Force refresh backend data"
              >
                <RefreshCcw size={13} />
              </button>
              <button
                onClick={handleLockConsole}
                className="flex-1 py-1.5 px-3 bg-[#140A1F] border border-[#C77DFF]/20 hover:border-[#FC2779] text-[#C77DFF] hover:text-[#FC2779] text-[9px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Lock size={10} />
                Lock
              </button>
            </div>
          </div>

          {/* AI Creative Suite Quick launchers */}
          <div className="bg-gradient-to-b from-[#140A1F] to-[#250A32] border border-[#FC2779]/30 rounded-3xl p-5 text-left space-y-3.5 shadow-[0_0_15px_rgba(252,39,121,0.06)]">
            <span className="text-[8px] font-black tracking-widest text-[#FC2779] uppercase block">AI Commerce Engines</span>
            
            <Link 
              href="/admin/bulk-import" 
              className="flex items-center justify-between p-2.5 bg-white/[0.02] border border-[#C77DFF]/15 hover:border-[#FC2779] hover:bg-white/[0.04] rounded-xl transition-all text-xs font-bold text-white group cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Layers size={13} className="text-[#C77DFF] group-hover:text-[#FC2779]" />
                PIM Catalog Factory
              </span>
              <ChevronRight size={12} className="text-white/40 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link 
              href="/admin/ai-center" 
              className="flex items-center justify-between p-2.5 bg-white/[0.02] border border-[#C77DFF]/15 hover:border-[#FC2779] hover:bg-white/[0.04] rounded-xl transition-all text-xs font-bold text-white group cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Sparkles size={13} className="text-[#C77DFF] group-hover:text-[#FC2779]" />
                AI Creative Studio
              </span>
              <ChevronRight size={12} className="text-white/40 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Navigation vertical list */}
          <nav className="hidden lg:flex flex-col bg-white/[0.02] border border-[#C77DFF]/15 rounded-3xl p-2.5 text-left" aria-label="Desktop menu navigation">
            {sidebarItems.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full py-2.5 px-4 rounded-2xl text-xs font-bold text-left transition-all flex items-center gap-3 cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-purple-800 to-[#FC2779] text-white shadow-md shadow-purple-950"
                      : "text-[#D0C3D9] hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={15} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ===================================================
            🔥 MAIN WORKSPACE PANEL AREA (tab switching)
            =================================================== */}
        <section className="flex-1 min-w-0">
          
          {/* Mobile responsive scrollable tabs */}
          <div className="lg:hidden w-full overflow-x-auto admin-scrollable-tabs flex bg-[#140A1F] border border-[#C77DFF]/20 p-1.5 rounded-2xl gap-1 shrink-0 scroll-smooth select-none mb-6">
            {sidebarItems.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-[10px] font-bold text-center transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-purple-700 to-[#FC2779] text-white shadow-md"
                    : "text-[#D0C3D9] hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 1. OVERVIEW DASHBOARD TAB */}
          {activeTab === "dashboard" && (
            <div className="space-y-6 animate-slide-in">
              <div className="text-left space-y-1">
                <h3 className="text-xs uppercase font-extrabold tracking-widest text-[#FC2779]">Operating Summary</h3>
                <h2 className="text-xl font-black font-elegant text-white">Central Ledger Overview</h2>
              </div>

              {/* Grid Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/[0.03] border border-[#C77DFF]/20 p-5 rounded-2xl text-left relative overflow-hidden shadow-sm">
                  <span className="text-[9px] font-bold text-[#8E7A9C] uppercase tracking-widest block">Total Sales</span>
                  <h3 className="text-xl md:text-2xl font-extrabold text-white font-sans flex items-center mt-1">
                    <IndianRupee size={16} className="text-[#C77DFF] shrink-0" />
                    {totalSales}
                  </h3>
                  <span className="text-[9px] text-[#10B981] font-bold block mt-2">✓ Verified UPI accounts</span>
                </div>

                <div className="bg-white/[0.03] border border-[#C77DFF]/20 p-5 rounded-2xl text-left relative overflow-hidden shadow-sm">
                  <span className="text-[9px] font-bold text-[#8E7A9C] uppercase tracking-widest block">Pending Approvals</span>
                  <h3 className="text-xl md:text-2xl font-extrabold text-white font-sans mt-1">
                    {pendingVerificationOrders.length}
                  </h3>
                  <span className="text-[9px] text-amber-400 font-bold block mt-2">⚠️ Awaiting screenshots</span>
                </div>

                <div className="bg-white/[0.03] border border-[#C77DFF]/20 p-5 rounded-2xl text-left relative overflow-hidden shadow-sm">
                  <span className="text-[9px] font-bold text-[#8E7A9C] uppercase tracking-widest block">Active Shipments</span>
                  <h3 className="text-xl md:text-2xl font-extrabold text-white font-sans mt-1">
                    {orders.filter(o => o.order_status !== "delivered").length}
                  </h3>
                  <span className="text-[9px] text-[#C77DFF] font-bold block mt-2">✓ Logistics synced</span>
                </div>

                <div className="bg-white/[0.03] border border-[#C77DFF]/20 p-5 rounded-2xl text-left relative overflow-hidden shadow-sm">
                  <span className="text-[9px] font-bold text-[#8E7A9C] uppercase tracking-widest block">Unresolved Disputes</span>
                  <h3 className="text-xl md:text-2xl font-extrabold text-[#FC2779] font-sans mt-1">
                    {activeClaimsCount}
                  </h3>
                  <span className="text-[9px] text-[#FC2779] font-bold block mt-2 animate-pulse">⚠️ Lightbox check</span>
                </div>
              </div>

              {/* Quick statistics layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                
                <div className="bg-[#140A1F] border border-[#C77DFF]/15 p-6 rounded-3xl space-y-4 md:col-span-2">
                  <h4 className="text-xs uppercase font-extrabold tracking-widest text-[#FC2779] flex items-center gap-1.5">
                    <TrendingUp size={14} /> Catalog Health Ledger
                  </h4>
                  <div className="space-y-4">
                    <p className="text-xs text-[#D0C3D9] leading-relaxed">
                      Sayanita's Glow Addict stores currently hold <strong className="text-white">{products.length} unique cosmetic formulas</strong>. All items are active with verified batch tracking.
                    </p>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 bg-white/[0.02] border border-[#C77DFF]/10 rounded-xl">
                        <span className="text-[8px] font-bold text-[#8E7A9C] uppercase block">Low Stock</span>
                        <strong className="text-lg text-white font-sans block mt-1">
                          {products.filter(p => p.stock <= 5).length}
                        </strong>
                      </div>
                      <div className="p-3 bg-white/[0.02] border border-[#C77DFF]/10 rounded-xl">
                        <span className="text-[8px] font-bold text-[#8E7A9C] uppercase block">Out of Stock</span>
                        <strong className="text-lg text-[#FC2779] font-sans block mt-1">
                          {products.filter(p => p.stock === 0).length}
                        </strong>
                      </div>
                      <div className="p-3 bg-white/[0.02] border border-[#C77DFF]/10 rounded-xl">
                        <span className="text-[8px] font-bold text-[#8E7A9C] uppercase block">Draft Mode</span>
                        <strong className="text-lg text-amber-400 font-sans block mt-1">
                          {products.filter(p => p.status === "draft").length}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#140A1F] border border-[#C77DFF]/15 p-6 rounded-3xl space-y-3.5">
                  <h4 className="text-xs uppercase font-extrabold tracking-widest text-[#FC2779] flex items-center gap-1.5">
                    <Grid size={14} /> Top Categories
                  </h4>
                  <div className="space-y-2 text-xs font-bold text-[#D0C3D9]">
                    {[
                      { name: "Serums", count: 32 },
                      { name: "Lipsticks", count: 28 },
                      { name: "SPF Care", count: 22 },
                      { name: "Hydration", count: 18 }
                    ].map((cat, i) => (
                      <div key={i} className="flex justify-between items-center py-1.5 border-b border-[#C77DFF]/10">
                        <span>{cat.name}</span>
                        <span className="text-[#C77DFF]">{cat.count}% share</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 2. ORDERS LIST TAB */}
          {activeTab === "orders" && (
            <div className="space-y-6 animate-slide-in text-left">
              <h2 className="text-xs md:text-sm font-extrabold uppercase tracking-widest text-[#FC2779] flex items-center gap-2">
                <Package size={14} className="text-[#FC2779]" />
                Customer Purchases & Prepaid Verification
              </h2>

              {orders.length === 0 ? (
                <p className="text-xs text-[#D0C3D9] text-center py-12 bg-white/[0.02] border border-[#C77DFF]/20 rounded-2xl">
                  No orders placed yet.
                </p>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white/[0.03] backdrop-blur-md border border-[#C77DFF]/20 rounded-3xl p-5 md:p-6 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6 text-left hover:border-[#FC2779]/45 transition-colors"
                    >
                      {/* Customer Info */}
                      <div className="lg:col-span-4 space-y-4">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-[#FC2779] uppercase tracking-wider block">
                            Order Code: {order.id}
                          </span>
                          <p className="text-[10px] text-[#D0C3D9]">
                            Placed: {new Date(order.created_at).toLocaleString()}
                          </p>
                        </div>

                        <div className="bg-[#140A1F] p-3.5 rounded-xl border border-[#C77DFF]/15 text-[11px] font-sans text-[#D0C3D9] space-y-1.5">
                          <span className="font-extrabold text-[#FC2779] block uppercase tracking-wider text-[9px] border-b border-[#C77DFF]/15 pb-1 mb-1">Recipient Details:</span>
                          <p><strong>Name:</strong> {order.shipping_address.name}</p>
                          <p><strong>Phone:</strong> {order.shipping_address.phone}</p>
                          <p><strong>Email:</strong> {order.shipping_address.email}</p>
                          <p className="leading-relaxed"><strong>Address:</strong> {order.shipping_address.address}, {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.zipCode}</p>
                        </div>
                      </div>

                      {/* Items details */}
                      <div className="lg:col-span-4 text-xs font-sans space-y-3">
                        <span className="font-extrabold text-[#FC2779] block uppercase tracking-wider text-[9px] border-b border-[#C77DFF]/15 pb-1">
                          Purchased Items:
                        </span>
                        <div className="divide-y divide-[#C77DFF]/15 text-[11px] space-y-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="py-2.5 flex justify-between gap-4">
                              <span className="font-semibold text-white leading-tight">
                                {item.product.title}
                                {item.selectedShade && <strong className="text-[#FC2779] ml-1">({item.selectedShade})</strong>}
                              </span>
                              <span className="text-[#D0C3D9] shrink-0">Qty: {item.quantity}</span>
                            </div>
                          ))}
                        </div>

                        {/* Gift freebies */}
                        {(order.freebies.scrunchies || order.freebies.lipstick || order.freebies.choice) && (
                          <div className="pt-2 border-t border-dashed border-[#C77DFF]/20 text-[10px] space-y-1 font-semibold text-[#10B981]">
                            <strong className="text-[9px] uppercase tracking-wider text-[#10B981]">Bundled Freebies:</strong>
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                              {order.freebies.scrunchies && <span className="bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20">✓ Scrunchies</span>}
                              {order.freebies.lipstick && <span className="bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20">✓ Lipstick</span>}
                              {order.freebies.choice && <span className="bg-[#10B981]/15 px-2 py-0.5 rounded border border-[#10B981]/35 font-extrabold">✓ Choice: {order.freebies.choice}</span>}
                            </div>
                          </div>
                        )}

                        <div className="pt-2 border-t border-[#C77DFF]/20 flex justify-between font-bold text-white text-xs">
                          <span>Grand Total Collected:</span>
                          <span className="text-[#FC2779] text-sm">₹{order.total_amount}</span>
                        </div>
                      </div>

                      {/* Operations Actions & Screenshot */}
                      <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
                        {order.upi_transaction_id ? (
                          <div className="p-3 bg-[#140A1F] border border-[#C77DFF]/15 rounded-xl space-y-2.5">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="text-[#D0C3D9]">Ref ID:</span>
                              <span className="font-mono text-[#FC2779] font-extrabold bg-[#080012] border border-[#C77DFF]/20 px-2 py-0.5 rounded">{order.upi_transaction_id}</span>
                            </div>

                            {order.screenshot_url && (
                              <button
                                onClick={() => setPlayingVideoUrl(order.screenshot_url!)}
                                className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#140A1F] border border-[#C77DFF]/20 hover:border-[#FC2779] text-xs font-bold rounded-lg text-[#FC2779] transition-colors cursor-pointer"
                              >
                                <Eye size={13} className="text-[#FC2779]" />
                                View Payment Screenshot
                              </button>
                            )}
                          </div>
                        ) : (
                          order.payment_method === "UPI" && (
                            <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[10px] leading-relaxed font-semibold">
                              ⚠️ UPI confirmation reference screenshot missing.
                            </div>
                          )
                        )}

                        <div className="space-y-2">
                          <span className="text-[9px] font-bold text-[#8E7A9C] uppercase tracking-wider block">Fulfillment Controls:</span>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              disabled={order.payment_status === "paid"}
                              onClick={() => handleVerifyPrepaid(order.id)}
                              className={`py-2 px-1 text-[9px] font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                order.payment_status === "paid"
                                  ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/25 cursor-not-allowed"
                                  : "admin-gradient-btn text-white"
                              }`}
                            >
                              <Check size={12} />
                              {order.payment_status === "paid" ? "Confirmed" : "Verify UPI"}
                            </button>

                            <button
                              disabled={order.payment_status !== "paid" || order.order_status === "shipped" || order.order_status === "delivered"}
                              onClick={() => setSelectedShipOrder(order.id)}
                              className={`py-2 px-1 text-[9px] font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                order.order_status === "shipped" || order.order_status === "delivered"
                                  ? "bg-blue-500/15 text-blue-500 border border-blue-500/25 cursor-not-allowed"
                                  : order.payment_status !== "paid"
                                  ? "bg-white/5 text-white/20 border border-white/5 cursor-not-allowed"
                                  : "bg-blue-600 hover:bg-blue-700 text-white"
                              }`}
                            >
                              <Send size={12} />
                              {order.order_status === "shipped" || order.order_status === "delivered" ? "Shipped" : "Dispatch"}
                            </button>

                            {order.payment_status === "paid" && (
                              <button
                                type="button"
                                onClick={() => setLabelModalOrder(order)}
                                className="col-span-2 py-2 text-[9px] font-bold uppercase tracking-wider bg-purple-700 hover:bg-purple-800 text-white rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-[#C77DFF]/20 shadow-md"
                              >
                                <Package size={12} />
                                Print Shiprocket Label
                              </button>
                            )}

                            <button
                              disabled={order.order_status !== "shipped"}
                              onClick={() => {
                                adminDeliverOrder(order.id);
                                alert(`Order ${order.id} marked as Delivered successfully!`);
                              }}
                              className={`col-span-2 py-2 text-[9px] font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                order.order_status === "delivered"
                                  ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/25 cursor-not-allowed"
                                  : order.order_status !== "shipped"
                                  ? "bg-white/5 text-white/20 border border-white/5 cursor-not-allowed"
                                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
                              }`}
                            >
                              <Check size={12} />
                              {order.order_status === "delivered" ? "Delivered to Customer" : "Mark Order Delivered"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. INVENTORY TAB MODULE */}
          {activeTab === "inventory" && (
            <AdminInventory />
          )}

          {/* 4. BEAUTY CRM TAB */}
          {activeTab === "beauty-crm" && (
            <div className="space-y-6 animate-slide-in text-left">
              <div className="space-y-1">
                <h3 className="text-xs uppercase font-extrabold tracking-widest text-[#FC2779]">Luxury Beauty Profiles</h3>
                <h2 className="text-xl font-black font-elegant text-white flex items-center gap-2">
                  <Heart size={18} className="text-[#FC2779]" />
                  Beauty CRM Client Insights
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Customer CRM Selector list */}
                <div className="lg:col-span-5 bg-white/[0.03] border border-[#C77DFF]/20 rounded-3xl p-5 space-y-4">
                  <span className="text-[9px] font-bold text-[#8E7A9C] uppercase tracking-widest block border-b border-[#C77DFF]/15 pb-2">Registered Skin Profiles</span>
                  <div className="space-y-2 max-h-[450px] overflow-y-auto custom-scrollbar">
                    {adminUsers && adminUsers.length > 0 ? (
                      adminUsers.map((cust) => (
                        <button
                          key={cust.email}
                          onClick={() => handleCrmSelect(cust)}
                          className={`w-full p-3 rounded-xl border text-xs text-left transition-all flex items-center gap-3 cursor-pointer ${
                            selectedCustomerCrm?.email === cust.email
                              ? "bg-purple-950/40 border-[#FC2779] text-white shadow-md shadow-[#FC2779]/10"
                              : "bg-[#140A1F] border-[#C77DFF]/10 text-[#D0C3D9] hover:bg-white/5"
                          }`}
                        >
                          <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-[#140A1F] border border-[#C77DFF]/20 shrink-0 flex items-center justify-center font-bold text-[#FC2779]">
                            {cust.avatar ? <Image src={cust.avatar} alt={cust.name} fill className="object-cover" unoptimized /> : cust.name[0].toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-extrabold text-white block truncate">{cust.name}</span>
                            <span className="text-[9px] text-[#C77DFF] font-bold block uppercase tracking-wider mt-0.5">
                              {cust.skin_type || "normal"} Skin
                            </span>
                          </div>
                          <ChevronRight size={14} className="text-white/20" />
                        </button>
                      ))
                    ) : (
                      <p className="text-xs text-[#D0C3D9] py-8 text-center">No registered customers logged.</p>
                    )}
                  </div>
                </div>

                {/* Routine and cross sell builder */}
                <div className="lg:col-span-7 bg-white/[0.03] border border-[#C77DFF]/20 rounded-3xl p-6 space-y-6">
                  {selectedCustomerCrm ? (
                    <div className="space-y-6 animate-slide-in">
                      <div className="border-b border-[#C77DFF]/15 pb-4">
                        <span className="text-[9px] font-bold text-[#FC2779] uppercase tracking-widest block">Active Profile Insights</span>
                        <h3 className="text-base font-extrabold text-white mt-1">{selectedCustomerCrm.name}</h3>
                        <p className="text-xs text-[#D0C3D9] font-mono mt-0.5">{selectedCustomerCrm.email}</p>
                      </div>

                      {/* AI Generated routine */}
                      <div className="space-y-3.5">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                          <Sparkles size={13} className="text-[#FC2779]" /> Gemini Beauty Routine Match
                        </span>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {generatedRoutine.map((step, i) => (
                            <div key={i} className="p-3 bg-[#140A1F] border border-[#C77DFF]/15 rounded-xl text-left relative overflow-hidden">
                              <span className="absolute top-0 right-0 p-1 text-[#C77DFF]/10 font-bold font-serif text-lg">0{i+1}</span>
                              <span className="text-[8px] font-bold text-[#8E7A9C] uppercase block mb-1">Step 0{i+1}</span>
                              <strong className="text-white leading-snug">{step}</strong>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* CRM Routine matches */}
                      <div className="space-y-3">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest block">Recommended Cross-Sells</span>
                        <div className="grid grid-cols-3 gap-3">
                          {routineCrossSells.map((prod) => (
                            <div key={prod.id} className="p-2.5 bg-[#140A1F] border border-[#C77DFF]/15 rounded-xl text-center space-y-2">
                              <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-[#080012] border border-[#C77DFF]/15">
                                <Image src={prod.image} alt={prod.title} fill className="object-cover" unoptimized />
                              </div>
                              <span className="text-[9px] font-extrabold text-white truncate block">{prod.title}</span>
                              <span className="text-[9px] text-[#FC2779] font-bold block">₹{prod.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-20 text-center text-[#D0C3D9] space-y-3">
                      <Heart size={36} className="mx-auto text-purple-600/30" />
                      <p className="text-xs font-semibold">Select a customer skin profile on the left to reveal target beauty routines and routine matches.</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* 5. VISUAL COLLECTION BUILDER TAB */}
          {activeTab === "collections" && (
            <div className="space-y-6 animate-slide-in text-left">
              <div className="space-y-1">
                <h3 className="text-xs uppercase font-extrabold tracking-widest text-[#FC2779]">Dynamic Beauty Curation</h3>
                <h2 className="text-xl font-black font-elegant text-white flex items-center gap-2">
                  <Layers size={18} className="text-[#C77DFF]" />
                  Visual Collection Builder
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Collection selector list */}
                <div className="lg:col-span-4 bg-white/[0.03] border border-[#C77DFF]/20 rounded-3xl p-5 space-y-4">
                  <span className="text-[9px] font-bold text-[#8E7A9C] uppercase tracking-widest block border-b border-[#C77DFF]/15 pb-2">Active Collections</span>
                  <div className="space-y-2">
                    {[
                      { id: "glass-skin", name: "🌟 Glass Skin Ritual" },
                      { id: "spf-shield", name: "☀️ Summer SPF Shield" },
                      { id: "cashmere-lips", name: "💄 Cashmere Lip Couture" }
                    ].map(col => (
                      <button
                        key={col.id}
                        onClick={() => setSelectedCollection(col.id)}
                        className={`w-full p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                          selectedCollection === col.id
                            ? "bg-purple-950/40 border-[#FC2779] text-white shadow-md shadow-[#FC2779]/10"
                            : "bg-[#140A1F] border-[#C77DFF]/10 text-[#D0C3D9] hover:bg-white/5"
                        }`}
                      >
                        {col.name}
                        <span className="text-[9px] text-[#C77DFF] font-bold block mt-1 font-sans">
                          {customCollections[col.id]?.length || 0} formulas linked
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Items linker registry */}
                <div className="lg:col-span-8 bg-white/[0.03] border border-[#C77DFF]/20 rounded-3xl p-6 space-y-6">
                  <div className="flex justify-between items-center border-b border-[#C77DFF]/15 pb-4">
                    <div>
                      <span className="text-[9px] font-bold text-[#FC2779] uppercase tracking-widest block">Collection Registry Linker</span>
                      <h3 className="text-base font-extrabold text-white mt-1 capitalize">{selectedCollection.replace("-", " ")} Curation</h3>
                    </div>
                    <span className="text-xs text-[#C77DFF] font-mono font-bold">
                      {customCollections[selectedCollection]?.length || 0} selected
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    {/* Catalog search filter */}
                    <div className="relative">
                      <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="text"
                        placeholder="Search products in PIM to add/remove..."
                        value={searchCollectionQuery}
                        onChange={(e) => setSearchCollectionQuery(e.target.value)}
                        className="w-full bg-[#140A1F] pl-10 pr-4 py-2.5 rounded-xl border border-[#C77DFF]/15 text-xs text-white placeholder-white/40 outline-none focus:border-[#FC2779]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
                      {products
                        .filter(p => p.title.toLowerCase().includes(searchCollectionQuery.toLowerCase()))
                        .map(p => {
                          const isLinked = (customCollections[selectedCollection] || []).includes(p.id);
                          return (
                            <button
                              key={p.id}
                              onClick={() => handleToggleCollectionItem(p.id)}
                              className={`p-3 rounded-xl border text-xs text-left transition-all flex items-center gap-3 cursor-pointer ${
                                isLinked 
                                  ? "bg-emerald-950/20 border-emerald-500/40 text-white" 
                                  : "bg-[#140A1F] border-[#C77DFF]/10 text-[#D0C3D9]"
                              }`}
                            >
                              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#080012] border border-[#C77DFF]/10 shrink-0">
                                <Image src={p.image} alt={p.title} fill className="object-cover" unoptimized />
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="font-extrabold text-white block truncate leading-snug">{p.title}</span>
                                <span className="text-[9px] text-[#C77DFF] font-bold block mt-0.5">{p.brand}</span>
                              </div>
                              {isLinked ? (
                                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold font-sans">✓</span>
                              ) : (
                                <span className="w-4 h-4 rounded-full bg-white/5 border border-[#C77DFF]/20 flex items-center justify-center text-[10px] font-bold text-white">+</span>
                              )}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 6. MEDIA LIBRARY TAB */}
          {activeTab === "media" && (
            <div className="space-y-6 animate-slide-in text-left">
              <div className="flex justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <h3 className="text-xs uppercase font-extrabold tracking-widest text-[#FC2779]">Asset Management</h3>
                  <h2 className="text-xl font-black font-elegant text-white flex items-center gap-2">
                    <FileImage size={18} className="text-[#C77DFF]" />
                    Enterprise Media vaults
                  </h2>
                </div>
                
                {/* Upload zone button */}
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-700 to-[#FC2779] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:opacity-90 shadow-md cursor-pointer transition-transform duration-300">
                  <Plus size={14} />
                  {uploadingMedia ? "Saving..." : "Add New Asset"}
                  <input type="file" onChange={handleMediaUpload} className="hidden" accept="image/*,video/*" />
                </label>
              </div>

              {/* Grid representation */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {mediaAssets.map(asset => (
                  <div key={asset.id} className="bg-white/[0.03] border border-[#C77DFF]/10 rounded-2xl overflow-hidden p-3.5 space-y-3 relative group">
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#080012] border border-[#C77DFF]/10">
                      {asset.type === "video" ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-purple-950/20 text-[#C77DFF]">
                          <span className="p-3.5 rounded-full bg-[#140A1F] border border-[#C77DFF]/20 text-[#FC2779] shadow-lg mb-2">▶</span>
                          <span className="text-[9px] uppercase font-bold tracking-widest font-mono">Dispute MP4</span>
                        </div>
                      ) : (
                        <Image src={asset.url} alt={asset.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                      )}
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] font-black text-[#FC2779] uppercase tracking-widest block bg-[#FC2779]/10 border border-[#FC2779]/20 px-2 py-0.5 rounded w-max">
                        {asset.tag}
                      </span>
                      <strong className="text-[10px] text-white truncate block mt-1 leading-snug">{asset.name}</strong>
                      <span className="text-[9px] text-[#8E7A9C] font-mono block">{asset.size}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. SEO PIM SWEEPER CENTER TAB */}
          {activeTab === "seo-center" && (
            <div className="space-y-6 animate-slide-in text-left">
              <div className="space-y-1">
                <h3 className="text-xs uppercase font-extrabold tracking-widest text-[#FC2779]">Catalog Audits</h3>
                <h2 className="text-xl font-black font-elegant text-white flex items-center gap-2">
                  <Globe size={18} className="text-[#C77DFF]" />
                  SEO Metadata Sweeper
                </h2>
              </div>

              {/* Scan summary */}
              <div className="bg-white/[0.03] border border-[#C77DFF]/20 rounded-3xl p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-[#C77DFF]/15 pb-3.5">
                  <span className="text-xs text-[#D0C3D9]">
                    Catalog audit scans for missing organic title tags, meta descriptions, search keywords, or canonical slugs.
                  </span>
                  <button
                    onClick={runSeoAudit}
                    disabled={isAuditingSeo}
                    className="py-1.5 px-3 bg-[#140A1F] border border-[#C77DFF]/20 hover:border-[#FC2779] rounded-xl text-xs font-bold text-white flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <RefreshCcw size={12} className={isAuditingSeo ? "animate-spin" : ""} />
                    {isAuditingSeo ? "Sweeping catalog..." : "Re-Audit Catalog"}
                  </button>
                </div>

                {seoScanResults.length === 0 ? (
                  <p className="text-xs text-[#10B981] font-bold text-center py-8">
                    ✓ All registered formulas in Sayanita's PIM registries have complete SEO headers!
                  </p>
                ) : (
                  <div className="divide-y divide-[#C77DFF]/15 space-y-4">
                    {seoScanResults.map((audit) => (
                      <div key={audit.id} className="pt-4 flex justify-between items-center gap-4 first:pt-0">
                        <div className="space-y-1.5">
                          <strong className="text-xs text-white block">{audit.title}</strong>
                          <div className="flex flex-wrap gap-1">
                            {audit.missingFields.map((field, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded bg-[#FC2779]/10 border border-[#FC2779]/20 text-[8px] text-[#FC2779] font-bold uppercase tracking-wider">
                                Missing: {field}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => handleFixSeoAuto(audit.id)}
                          className="py-2 px-3 bg-gradient-to-r from-purple-700 to-[#FC2779] text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-md cursor-pointer hover:scale-[1.01] transition-transform"
                        >
                          Gemini Autopatch
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 8. CLAIMS LIST TAB */}
          {activeTab === "claims" && (
            <div className="space-y-6 animate-slide-in text-left">
              <h2 className="text-xs md:text-sm font-extrabold uppercase tracking-widest text-[#FC2779] flex items-center gap-2">
                <ShieldAlert size={14} className="text-[#FC2779]" />
                Unboxing Video Dispute Claims Panel
              </h2>

              {claims.length === 0 ? (
                <p className="text-xs text-[#D0C3D9] text-center py-12 bg-white/[0.02] border border-[#C77DFF]/20 rounded-2xl">
                  No claims filed yet.
                </p>
              ) : (
                <div className="space-y-6">
                  {claims.map((claim) => {
                    const orderMatch = orders.find(o => o.id === claim.order_id);
                    const customerEmail = orderMatch?.shipping_address.email || "Unknown Email";
                    const claimStatement = claim.claim_type === "damage" 
                      ? "Disputed condition: Package arrived with visible structural or fluid damages."
                      : "Disputed condition: Stated quantities or custom elements missing from fulfillment box.";
                    const videoUrl = claim.unboxing_video_url || "";

                    return (
                      <div
                        key={claim.id}
                        className="bg-white/[0.03] backdrop-blur-md border border-[#C77DFF]/20 rounded-3xl p-5 md:p-6 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6 hover:border-[#FC2779]/45 transition-colors"
                      >
                        <div className="lg:col-span-4 space-y-4">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-[#FC2779] uppercase tracking-wider block">
                              Dispute ID: {claim.id}
                            </span>
                            <p className="text-xs font-bold text-white mt-1.5">
                              Associated Order: {claim.order_id}
                            </p>
                            <p className="text-[10px] text-[#D0C3D9]">
                              Filed on: {new Date(claim.created_at).toLocaleString()}
                            </p>
                          </div>

                          <div className="bg-[#140A1F] p-3.5 rounded-xl border border-[#C77DFF]/15 text-[11px] font-sans text-[#D0C3D9] space-y-1.5">
                            <p><strong>Claim Category:</strong> {claim.claim_type.toUpperCase()}</p>
                            <p><strong>Customer Email:</strong> {customerEmail}</p>
                            <p className="leading-relaxed"><strong>Statement:</strong> "{claimStatement}"</p>
                          </div>
                        </div>

                        {/* Video Lightbox trigger */}
                        <div className="lg:col-span-4 flex flex-col justify-center space-y-3">
                          <span className="font-extrabold text-[#FC2779] block uppercase tracking-wider text-[9px] border-b border-[#C77DFF]/15 pb-1">
                            Evidence Video file (Required for damage claims):
                          </span>
                          
                          {videoUrl ? (
                            <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#140A1F] border border-[#C77DFF]/20 flex flex-col items-center justify-center p-3 text-center">
                              <span className="text-[9px] font-bold text-[#C77DFF] uppercase tracking-widest mb-2 font-mono">Dispute Evidence MP4</span>
                              <button
                                onClick={() => setPlayingVideoUrl(videoUrl)}
                                className="px-4 py-2 bg-gradient-to-r from-purple-700 to-[#FC2779] text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform"
                              >
                                Play Evidence Video
                              </button>
                            </div>
                          ) : (
                            <div className="py-6 border border-dashed border-[#C77DFF]/20 rounded-2xl text-center text-[10px] text-[#D0C3D9]/60 font-semibold leading-relaxed">
                              ⚠️ No dispute verification video filed. Recommendation: Reject.
                            </div>
                          )}
                        </div>

                      {/* Operations controls */}
                      <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-[#FC2779] uppercase tracking-wider block">Dispute Verdict Status:</span>
                          <span className={`px-3 py-1 rounded-full border text-[9px] uppercase tracking-widest font-black inline-block ${
                            claim.status === "approved"
                              ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400"
                              : claim.status === "rejected"
                              ? "bg-red-950/20 border-red-500/30 text-red-400"
                              : "bg-amber-950/20 border-amber-500/30 text-amber-400 animate-pulse"
                          }`}>
                            {claim.status}
                          </span>
                        </div>

                        {claim.status === "pending" ? (
                          <div className="space-y-3">
                            <textarea
                              rows={2.5}
                              required
                              placeholder="Type resolution statement for client dashboard..."
                              value={resolutionNotes}
                              onChange={(e) => setResolutionNotes(e.target.value)}
                              className="w-full bg-[#140A1F] border border-[#C77DFF]/20 rounded-xl p-2.5 text-xs text-white placeholder-white/30 outline-none focus:border-[#FC2779]"
                            />

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => handleResolveClaim(claim.id, "approved")}
                                className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold uppercase tracking-wider rounded-lg shadow cursor-pointer transition-transform active:scale-95"
                              >
                                Approve & Refund
                              </button>
                              <button
                                onClick={() => handleResolveClaim(claim.id, "rejected")}
                                className="py-2 bg-red-600 hover:bg-red-500 text-white text-[9px] font-bold uppercase tracking-wider rounded-lg shadow cursor-pointer transition-transform active:scale-95"
                              >
                                Reject Claim
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-[#140A1F] p-3 rounded-xl border border-[#C77DFF]/15 text-[10px] text-[#D0C3D9] leading-relaxed">
                            <strong>Verdict Logs:</strong> "{claim.resolution_notes}"
                          </div>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 9. PROMO COUPONS TAB MODULE */}
          {activeTab === "coupons" && (
            <div className="space-y-6 animate-slide-in text-left">
              <div className="bg-white/[0.03] backdrop-blur-md border border-[#C77DFF]/20 rounded-3xl p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-xs md:text-sm font-extrabold uppercase tracking-widest text-[#FC2779] flex items-center gap-1.5">
                    <Sparkles size={16} /> Create Promotional Coupon
                  </h3>
                  <p className="text-[10px] text-[#D0C3D9] mt-1">Configure active promo codes to be used during checkout.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
                  <label className="space-y-1.5">
                    <span className="font-bold text-[#8E7A9C] uppercase tracking-wider text-[9px] block">Coupon Code *</span>
                    <input
                      type="text"
                      placeholder="e.g. EXTRA10"
                      value={newCoupon.code}
                      onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                      className="w-full bg-[#140A1F] border border-[#C77DFF]/20 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold outline-none focus:border-[#FC2779]"
                    />
                  </label>

                  <label className="space-y-1.5">
                    <span className="font-bold text-[#8E7A9C] uppercase tracking-wider text-[9px] block">Percent rate (1-100) *</span>
                    <input
                      type="number"
                      placeholder="10"
                      value={newCoupon.discount_percent}
                      onChange={(e) => setNewCoupon({ ...newCoupon, discount_percent: e.target.value })}
                      className="w-full bg-[#140A1F] border border-[#C77DFF]/20 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold outline-none focus:border-[#FC2779]"
                    />
                  </label>

                  <label className="space-y-1.5">
                    <span className="font-bold text-[#8E7A9C] uppercase tracking-wider text-[9px] block">Min Cart Value (₹)</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={newCoupon.min_cart_value}
                      onChange={(e) => setNewCoupon({ ...newCoupon, min_cart_value: e.target.value })}
                      className="w-full bg-[#140A1F] border border-[#C77DFF]/20 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold outline-none focus:border-[#FC2779]"
                    />
                  </label>

                  <button
                    onClick={handleAddCoupon}
                    className="sm:col-span-3 py-3 bg-gradient-to-r from-purple-700 to-[#FC2779] text-white text-xs font-black uppercase tracking-wider rounded-xl hover:opacity-90 shadow-md cursor-pointer transition-transform duration-300"
                  >
                    Add Coupon
                  </button>
                </div>
              </div>

              {/* Active Coupons display */}
              <div className="bg-white/[0.03] border border-[#C77DFF]/20 rounded-3xl p-6 sm:p-8 space-y-4">
                <span className="text-[10px] font-black text-[#FC2779] uppercase tracking-widest block border-b border-[#C77DFF]/15 pb-2">Active Store Coupons</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {adminCoupons.map((c, i) => (
                    <div key={i} className="p-4 bg-[#140A1F] border border-[#C77DFF]/15 rounded-2xl flex justify-between items-center relative overflow-hidden group">
                      <div className="space-y-1 text-left">
                        <strong className="text-sm font-mono text-white tracking-widest">{c.code}</strong>
                        <p className="text-[10px] text-[#D0C3D9]">
                          Discount: <span className="text-[#FC2779] font-bold">{c.discount_percent}% off</span>
                        </p>
                        {c.min_cart_value > 0 && (
                          <p className="text-[8px] text-[#8E7A9C]">Min value: ₹{c.min_cart_value}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteCoupon(c.code)}
                        className="p-1.5 rounded-lg bg-white/5 border border-red-500/20 text-red-400 hover:bg-red-500/10 cursor-pointer transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 10. REGISTERED USERS TAB */}
          {activeTab === "users" && (
            <div className="space-y-6 animate-slide-in text-left">
              <h2 className="text-xs md:text-sm font-extrabold uppercase tracking-widest text-[#FC2779] flex items-center gap-2">
                <Users size={14} className="text-[#FC2779]" />
                Customer Registry & Loyalty System
              </h2>

              <div className="bg-white/[0.03] border border-[#C77DFF]/20 rounded-3xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-sans text-white">
                    <thead className="bg-[#140A1F] border-b border-[#C77DFF]/20 text-[#FC2779] uppercase font-bold text-[9px] tracking-wider">
                      <tr>
                        <th className="p-4 text-left">Customer Profile</th>
                        <th className="p-4 text-left">Contact Details</th>
                        <th className="p-4 text-center">Skin Profile</th>
                        <th className="p-4 text-center">Tier Rank</th>
                        <th className="p-4 text-center">Loyalty Points</th>
                        <th className="p-4 text-center">Status</th>
                        <th className="p-4 text-center">Credentials Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C77DFF]/10 bg-[#140A1F]/30 font-semibold text-xs text-[#D0C3D9]">
                      {adminUsers && adminUsers.length > 0 ? (
                        adminUsers.map((cust) => (
                          <tr key={cust.email} className="hover:bg-purple-950/20 transition-colors border-b border-[#C77DFF]/10 text-white">
                            <td className="p-4 text-left flex items-center gap-3">
                              <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-[#140A1F] border border-[#C77DFF]/20 shrink-0 flex items-center justify-center font-bold text-[#FC2779]">
                                {cust.avatar ? <Image src={cust.avatar} alt={cust.name} fill className="object-cover" unoptimized /> : cust.name[0]}
                              </div>
                              <div className="space-y-0.5">
                                <span className="font-bold text-white text-sm block">{cust.name}</span>
                                {cust.bio && <span className="text-[10px] text-[#D0C3D9]/60 leading-tight line-clamp-1 max-w-[180px] block">{cust.bio}</span>}
                              </div>
                            </td>
                            <td className="p-4 text-left">
                              <span className="font-mono text-white block">{cust.email}</span>
                              <span className="font-mono text-[#D0C3D9]/65 text-[10px] block">{cust.phone}</span>
                            </td>
                            <td className="p-4 text-center capitalize">
                              <span className="px-2 py-0.5 rounded-full border border-[#C77DFF]/20 bg-[#140A1F] text-[9px] uppercase tracking-wider font-extrabold text-[#C77DFF]">
                                {cust.skin_type || "normal"}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <span className="px-2 py-0.5 rounded-full border border-[#FC2779]/20 bg-[#FC2779]/10 text-[8px] uppercase tracking-widest font-extrabold text-[#FC2779]">
                                {cust.loyalty_tier || "Bronze"}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <input
                                  type="number"
                                  defaultValue={cust.loyalty_points || 0}
                                  onBlur={(e) => {
                                    adminAdjustLoyaltyPoints(cust.email, parseInt(e.target.value) || 0);
                                  }}
                                  className="w-14 text-center border border-[#C77DFF]/20 rounded-md py-0.5 bg-[#140A1F] text-white focus:border-[#FC2779] outline-none text-[11px] font-bold"
                                />
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold border ${
                                cust.suspended 
                                  ? "bg-red-950/20 border-red-500/30 text-red-400" 
                                  : "bg-emerald-950/20 border-emerald-500/30 text-emerald-400"
                              }`}>
                                {cust.suspended ? "Suspended" : "Active"}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              {cust.suspended ? (
                                <button
                                  onClick={() => {
                                    adminUnsuspendUser(cust.email);
                                    alert(`Security credentials restored for ${cust.name}.`);
                                  }}
                                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] uppercase font-extrabold tracking-wider rounded-lg shadow cursor-pointer transition-all active:scale-95"
                                >
                                  Unsuspend
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    const confirm = window.confirm(`Suspend credentials for ${cust.name}? They will immediately lose vanity checkout privileges.`);
                                    if (confirm) {
                                      adminSuspendUser(cust.email);
                                      alert(`Account suspended.`);
                                    }
                                  }}
                                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-[9px] uppercase font-extrabold tracking-wider rounded-lg shadow cursor-pointer transition-all active:scale-95"
                                >
                                  Suspend
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-[#D0C3D9]/50">
                            No customers registered yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 11. SYSTEM CONFIG & GATEWAYS TAB */}
          {activeTab === "settings" && (
            <div className="bg-white/[0.03] backdrop-blur-md border border-[#C77DFF]/20 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 text-left animate-slide-in">
              <h2 className="text-xs md:text-sm font-extrabold uppercase tracking-widest text-[#FC2779] border-b border-[#C77DFF]/20 pb-3 flex items-center gap-2">
                <Sliders size={18} className="text-[#C77DFF]" />
                Store Operational Safeguards
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-[#D0C3D9]">
                
                {/* COD toggles */}
                <div className="p-5 rounded-2xl border border-[#C77DFF]/15 bg-[#140A1F] space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-white block">Enable Cash on Delivery (COD)</span>
                      <span className="text-[10px] text-[#D0C3D9]/60 leading-relaxed block mt-1">
                        Toggles whether COD shows at checkout. Recommended: KEEP ENABLED to mirror real setups.
                      </span>
                    </div>
                    <button
                      onClick={adminToggleCod}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                        settings.codEnabled ? "bg-[#FC2779]" : "bg-zinc-800"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          settings.codEnabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                  
                  {settings.codEnabled && (
                    <div className="text-[10px] text-[#FC2779] font-bold leading-relaxed border-t border-[#C77DFF]/15 pt-3 animate-pulse">
                      ✓ Real Production-Grade COD & OTP Verification Gateway active at checkout.
                    </div>
                  )}
                </div>

                {/* API Gateways */}
                <div className="p-5 rounded-2xl border border-[#C77DFF]/15 bg-[#140A1F] space-y-4 font-sans text-xs">
                  <span className="font-extrabold text-[#FC2779] block uppercase tracking-wider text-[9px] border-b border-[#C77DFF]/15 pb-1">Production Integrations</span>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-white">Supabase Database API:</span>
                      <span className="flex items-center gap-1 font-bold text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Online (Sync Active)
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-white">Email SMTP Server Gateway:</span>
                      <span className="flex items-center gap-1 font-bold text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Online (Gmail SMTP Production Gateway)
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-white">Shiprocket Logistics API:</span>
                      <span className="flex items-center gap-1 font-bold text-[#FC2779]">
                        <span className="w-2 h-2 rounded-full bg-[#FC2779] animate-pulse" />
                        Connected (Express Dispatch)
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </section>
      </div>

      {/* 🏷️ SHIPROCKET LABEL MODAL */}
      {labelModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setLabelModalOrder(null)} />
          <div className="relative bg-[#140A1F] border border-[#C77DFF]/30 rounded-[32px] p-6 shadow-2xl max-w-xl w-full mx-4 space-y-6 animate-slide-in text-left z-50">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-800 to-[#FC2779] rounded-t-[32px]" />
            
            <div className="space-y-1">
              <h3 className="text-base font-bold font-elegant text-white flex items-center gap-1.5">
                <Package className="text-[#FC2779]" size={20} />
                Shiprocket Airway Dispatch Label
              </h3>
              <p className="text-[10px] text-[#D0C3D9]">
                Order ID: {labelModalOrder.id} • Customer: {labelModalOrder.shipping_address.name}
              </p>
            </div>

            <div className="border border-[#C77DFF]/20 rounded-2xl overflow-hidden bg-[#080012]/30 p-2 h-[350px]">
              <iframe
                src={`/api/shipping?action=label&orderId=${labelModalOrder.id}&trackingId=${labelModalOrder.tracking_id || "SR-7182936"}`}
                className="w-full h-full border-0 rounded-xl"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setLabelModalOrder(null)}
                className="flex-1 py-3 rounded-xl border border-[#C77DFF]/20 text-xs font-semibold text-[#FC2779] hover:bg-white/5 cursor-pointer"
              >
                Close Label Window
              </button>
              <button
                type="button"
                onClick={() => {
                  const frame = document.querySelector("iframe");
                  if (frame) {
                    frame.contentWindow?.print();
                  } else {
                    window.print();
                  }
                }}
                className="flex-1 py-3 bg-gradient-to-r from-[#C77DFF] to-[#FC2779] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg cursor-pointer"
              >
                Print Label
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 🖼️ MODAL LIGHTBOX PLAYER */}
      {playingVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xs" onClick={() => setPlayingVideoUrl(null)} />
          <div className="relative bg-[#140A1F] border border-[#C77DFF]/30 rounded-[32px] p-3 shadow-2xl max-w-2xl w-full mx-4 aspect-video flex flex-col justify-between animate-slide-in z-50">
            <button
              onClick={() => setPlayingVideoUrl(null)}
              className="absolute -top-3 -right-3 p-2 rounded-full bg-[#FC2779] text-white shadow-lg border border-[#C77DFF]/30 z-10 cursor-pointer"
            >
              <X size={18} />
            </button>

            {playingVideoUrl.endsWith(".mp4") ? (
              <video controls autoPlay className="w-full h-full rounded-2xl object-cover">
                <source src={playingVideoUrl} type="video/mp4" />
                Your browser does not support HTML5 video player.
              </video>
            ) : (
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-[#080012] border border-[#C77DFF]/20">
                <Image
                  src={playingVideoUrl}
                  alt="Evidence Media"
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🚚 INLINE COURIER DISPATCH DIALOG */}
      {selectedShipOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setSelectedShipOrder(null)} />
          <form onSubmit={handleShipOrder} className="relative bg-[#140A1F] border border-[#C77DFF]/30 rounded-[32px] p-6 shadow-2xl max-w-sm w-full mx-4 space-y-6 animate-slide-in text-left z-50">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-800 to-[#FC2779] rounded-t-[32px]" />
            
            <div className="flex items-center gap-3 border-b border-[#C77DFF]/15 pb-3 text-white">
              <Package size={20} className="text-[#FC2779]" />
              <h3 className="text-base font-extrabold font-sans uppercase tracking-wider">
                Log Shipment details
              </h3>
            </div>

            <div className="space-y-4 text-xs font-sans text-[#D0C3D9]">
              <div>
                <label className="font-bold text-[#FC2779] uppercase tracking-wider text-[9px] block mb-1.5">Partner Courier *</label>
                <select
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full bg-[#080012] border border-[#C77DFF]/20 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold outline-none focus:border-[#FC2779] cursor-pointer"
                >
                  <option value="BlueDart">BlueDart Express</option>
                  <option value="Delhivery">Delhivery Logistics</option>
                  <option value="DTDC">DTDC Courier</option>
                  <option value="IndiaPost">India Post</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#FC2779] uppercase tracking-wider text-[9px] block mb-1.5">Tracking Code / Ref No. *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BDX-9184820129"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  className="w-full bg-[#080012] border border-[#C77DFF]/20 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold outline-none focus:border-[#FC2779]"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedShipOrder(null)}
                className="flex-1 py-3 rounded-xl border border-[#C77DFF]/20 text-xs font-semibold text-[#FC2779] text-center hover:bg-white/5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-[#C77DFF] to-[#FC2779] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg cursor-pointer"
              >
                Dispatch Order
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
}
