"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useShop, Claim, Product, Order, UserProfile } from "@/context/ShopContext";
import { Header } from "@/components/Header";
import AdminInventory from "@/components/admin/AdminInventory";
import { ShieldCheck, IndianRupee, ShieldAlert, Package, Check, Send, Sparkles, RefreshCcw, Eye, Play, X, Sliders, Upload, Plus, Trash2, TrendingUp, Lock, Unlock } from "lucide-react";
import "@/app/admin/admin-inventory.css";

interface Coupon {
  code: string;
  discount_percent: number;
  discount_flat: number;
  min_cart_value: number;
}

type AdminTab = "orders" | "claims" | "inventory" | "coupons" | "analytics" | "settings" | "users" | "customer-insights" | "account-system";

const ADMIN_SECRET_KEY = "0909";

const DEFAULT_COUPONS: Coupon[] = [
  { code: "GLOW10", discount_percent: 10, discount_flat: 0, min_cart_value: 0 },
  { code: "AUTHENTIC", discount_percent: 0, discount_flat: 100, min_cart_value: 500 },
  { code: "FESTIVE20", discount_percent: 20, discount_flat: 0, min_cart_value: 0 },
];

export default function AdminDashboard({ initialTab = "orders" }: { initialTab?: AdminTab }) {
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
    user,
    isAdmin,
    adminUsers,
    adminSuspendUser,
    adminUnsuspendUser,
    adminAdjustLoyaltyPoints
  } = useShop();

  // --- All hooks use server-safe defaults; hydrated from browser storage in useEffect ---
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

  const [newProduct, setNewProduct] = useState({
    sku: "",
    title: "",
    brand: "",
    category: "",
    price: "",
    mrp: "",
    stock: "",
    image: "",
    shades: "",
    authenticity_flag: true,
    description: "",
    extracted_text: ""
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [isDetectingImageText, setIsDetectingImageText] = useState(false);
  const [adminApiKey, setAdminApiKey] = useState("");

  // Hydrate browser-storage state after mount to avoid SSR/client mismatch
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
  }, []);

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

  if (secretKey !== ADMIN_SECRET_KEY) {
    return (
      <div className="min-h-screen flex flex-col bg-[#120018] text-white relative">
        {/* Background radial glows for luxurious dewy orchid depth */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#E056FD]/3 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-10 w-[400px] h-[400px] bg-[#FF8DC7]/3 rounded-full blur-3xl pointer-events-none" />
        
        <Header />

        <main className="flex-grow flex items-center justify-center px-4 py-20 relative z-10 select-none font-sans">
          <div className="w-full max-w-md bg-gradient-to-b from-[#2A093D]/80 to-[#1B0124]/90 border border-[#C77DFF]/20 rounded-[32px] p-8 text-center space-y-8 shadow-2xl backdrop-blur-md relative overflow-hidden glow-card animate-slide-in">
            <div className="absolute inset-0 bg-[#C77DFF]/2 rounded-full blur-3xl pointer-events-none" />
            
            {/* Elegant shield lock visual */}
            <div className="relative inline-flex items-center justify-center mx-auto">
              <div className="absolute inset-0 bg-red-500/10 rounded-full blur-md animate-pulse" />
              <div className="relative p-6 rounded-full bg-[#120018]/80 border border-red-500/30 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.25)]">
                <Lock size={36} />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest bg-red-500/10 border border-red-500/25 px-3 py-1 rounded-full font-sans">
                Creator Console Locked
              </span>
              <h2 className="text-2xl font-black font-elegant tracking-wide text-white pt-2 font-serif">
                Enter Secret Key
              </h2>
              <p className="text-xs text-orchid-text-muted leading-relaxed max-w-sm mx-auto font-medium font-sans">
                The Glow Addict administration console is locked. Please enter your secret manager passcode to access inventory, orders, and claims.
              </p>
            </div>

            {keyError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl p-4.5 text-xs flex gap-2.5 items-start text-left font-sans">
                <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                <span className="leading-relaxed font-semibold">{keyError}</span>
              </div>
            )}

            <form onSubmit={handleUnlockConsole} className="space-y-4 text-xs text-left font-sans">
              <div className="space-y-1.5">
                <label className="font-bold text-[#9F7AC2] uppercase tracking-wider block text-[9px]">Passcode Entry</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9F7AC2]" />
                  <input
                    type="password"
                    required
                    placeholder="••••"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#C77DFF]/15 focus:border-[#E056FD] outline-none bg-[#120018] text-white text-center tracking-widest text-lg font-bold transition-all font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-brand-gradient hover:bg-brand-gradient-hover text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 shadow-lg shadow-[#E056FD]/15 flex items-center justify-center gap-2 cursor-pointer ios-spring-hover"
              >
                <Unlock size={13} />
                Unlock Admin Console
              </button>
            </form>

            <div className="pt-4 border-t border-[#C77DFF]/10 text-center font-sans">
              <Link
                href="/"
                className="text-[10px] text-orchid-text-muted/60 hover:text-white font-semibold transition-colors"
              >
                ← Return to Public Catalog
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const adminTabs: { id: AdminTab; label: string }[] = [
    { id: "orders", label: `Prepaid Orders (${orders.length})` },
    { id: "claims", label: `Dispute Claims (${claims.length})` },
    { id: "inventory", label: "Inventory Stock" },
    { id: "users", label: `Users (${adminUsers?.length || 0})` },
    { id: "customer-insights", label: "Customer Insights" },
    { id: "account-system", label: "Account System" },
    { id: "coupons", label: "Coupons" },
    { id: "analytics", label: "Analytics" },
    { id: "settings", label: "System Config" },
  ];

  const handleAddCoupon = () => {
    if (!newCoupon.code.trim() || !newCoupon.discount_percent) {
      alert("Please fill in the coupon code and discount percentage rate.");
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
    alert("New coupon code successfully created!");
  };

  const handleDeleteCoupon = (code: string) => {
    const updated = adminCoupons.filter((c) => c.code !== code);
    setAdminCoupons(updated);
    localStorage.setItem("glow_admin_coupons", JSON.stringify(updated));
  };

  const persistAdminApiKey = (value: string) => {
    setAdminApiKey(value);
    sessionStorage.setItem("glow_admin_api_key", value);
  };

  // Financial calculations
  const totalSales = orders
    .filter((o) => o.payment_status === "paid")
    .reduce((sum, o) => sum + o.total_amount, 0);

  const pendingVerificationOrders = orders.filter((o) => o.payment_status === "pending_verification");
  const activeClaimsCount = claims.filter((c) => c.status === "pending").length;

  const handleVerifyPrepaid = (orderId: string) => {
    adminVerifyPayment(orderId);
    alert(`Prepaid payment successfully confirmed for order ${orderId}! The order status is updated to 'Packed'.`);
  };

  const handleShipOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipOrder) return;

    if (!trackingCode) {
      alert("Please enter a valid courier tracking reference number.");
      return;
    }

    adminShipOrder(selectedShipOrder, courierName, trackingCode);
    setSelectedShipOrder(null);
    setTrackingCode("");
    alert(`Order ${selectedShipOrder} marked as Shipped via ${courierName}. Tracking details logged.`);
  };

  const handleResolveClaim = (claimId: string, status: "approved" | "rejected") => {
    if (!resolutionNotes) {
      alert("Please enter decision notes explaining your approval or rejection.");
      return;
    }

    adminResolveClaim(claimId, status, resolutionNotes);
    setSelectedClaim(null);
    setResolutionNotes("");
    alert(`Claim resolution processed: ${status.toUpperCase()}. Customer notified in dashboard.`);
  };

  const applyAiExtraction = (data: {
    imageUrl: string;
    extracted: {
      title: string;
      brand: string;
      category: string;
      description: string;
      price: number;
      mrp: number;
      skuHint: string;
      shades: string[];
      extractedText: string;
    };
  }) => {
    setImagePreview(data.imageUrl);
    setNewProduct((current) => ({
      ...current,
      image: data.imageUrl,
      title: current.title || data.extracted.title,
      brand: current.brand || data.extracted.brand,
      category: current.category || data.extracted.category,
      price: current.price || String(data.extracted.price || ""),
      mrp: current.mrp || String(data.extracted.mrp || ""),
      sku: current.sku || data.extracted.skuHint,
      shades: current.shades || data.extracted.shades.join(", "),
      description: current.description || data.extracted.description,
      extracted_text: data.extracted.extractedText || current.extracted_text,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!adminApiKey.trim()) {
      setUploadStatus("Add your Admin API key first to run AI extraction.");
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setImagePreview(result);
      setUploadStatus(`Loaded ${file.name}. Running AI text detection...`);
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsDetectingImageText(true);
      const response = await fetch("/api/ai/extract-product", {
        method: "POST",
        headers: {
          "x-admin-key": adminApiKey.trim(),
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to extract product text from image.");
      }

      applyAiExtraction(data);
      setUploadStatus("AI detected product details from image. Review and publish.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "AI extraction failed.";
      setUploadStatus(`Image uploaded, but AI extraction failed: ${message}`);
    } finally {
      setIsDetectingImageText(false);
    }
  };

  const handleDetectFromUrl = async () => {
    if (!adminApiKey.trim()) {
      setUploadStatus("Add your Admin API key first to run AI extraction.");
      return;
    }

    if (!newProduct.image.trim()) {
      alert("Paste a valid image URL first.");
      return;
    }

    try {
      setIsDetectingImageText(true);
      setUploadStatus("Running AI text detection from image URL...");

      const response = await fetch("/api/ai/extract-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminApiKey.trim(),
        },
        body: JSON.stringify({ imageUrl: newProduct.image.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to extract product text from image URL.");
      }

      applyAiExtraction(data);
      setUploadStatus("AI details detected from URL image. Review and publish.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "AI extraction failed.";
      setUploadStatus(`AI extraction failed: ${message}`);
    } finally {
      setIsDetectingImageText(false);
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProduct.title.trim() || !newProduct.brand.trim() || !newProduct.category.trim() || !newProduct.image.trim()) {
      alert("Please complete the required product details and add an image.");
      return;
    }

    const parsedPrice = Number(newProduct.price);
    const parsedMrp = Number(newProduct.mrp);
    const parsedStock = Number(newProduct.stock);

    if (!parsedPrice || !parsedMrp || Number.isNaN(parsedStock)) {
      alert("Price, MRP, and stock must be valid numbers.");
      return;
    }

    const product: Product = {
      id: `prod-${Date.now()}`,
      sku: newProduct.sku.trim() || `SKU-${Date.now()}`,
      title: newProduct.title.trim(),
      brand: newProduct.brand.trim(),
      category: newProduct.category.trim(),
      price: parsedPrice,
      mrp: parsedMrp,
      stock: parsedStock,
      image: newProduct.image.trim(),
      shades: newProduct.shades
        .split(",")
        .map((shade) => shade.trim())
        .filter(Boolean),
      authenticity_flag: newProduct.authenticity_flag,
      description: newProduct.description.trim(),
      extracted_text: newProduct.extracted_text.trim() || undefined
    };

    adminAddProduct(product);
    setNewProduct({
      sku: "",
      title: "",
      brand: "",
      category: "",
      price: "",
      mrp: "",
      stock: "",
      image: "",
      shades: "",
      authenticity_flag: true,
      description: "",
      extracted_text: ""
    });
    setImagePreview("");
    setUploadStatus("Product published to catalog.");
  };

  const handleRemoveProduct = (productId: string, title: string) => {
    const confirmed = window.confirm(`Remove ${title} from the catalog? This will hide it everywhere immediately.`);
    if (!confirmed) return;

    adminRemoveProduct(productId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#140019] text-white admin-portal-wrapper relative pb-24 md:pb-8">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Admin Header Title Panel */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/8 pb-6 text-left">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-elegant text-white flex items-center gap-2.5 tracking-tight">
              <ShieldCheck size={28} className="text-[#D946EF] drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]" />
              Sayanita's Glow Control Portal
            </h1>
            <p className="text-xs text-[#9F7AC2] font-semibold leading-relaxed">
              Complete operational panel for Glow Addict store orders, inventory, and unboxing claims
            </p>
          </div>
          <div className="flex gap-2.5 self-stretch sm:self-auto justify-end">
            <button
              onClick={() => window.location.reload()}
              className="p-2.5 bg-[#2B083A] border border-white/8 hover:bg-[#43135A] rounded-xl text-[#D3B6FF] hover:text-white transition-all duration-300 cursor-pointer"
              aria-label="Refresh orders data"
            >
              <RefreshCcw size={16} />
            </button>
            <button
              onClick={handleLockConsole}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#120018]/80 border border-[#C77DFF]/40 text-[#C77DFF] hover:bg-[#2A093D]/60 hover:text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer ios-spring-hover"
            >
              <Lock size={13} />
              Lock Console
            </button>
          </div>
        </div>

        {/* 📊 CORE OPERATIONAL METRICS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Revenue */}
          <div className="bg-[#1E0629] border border-white/8 p-4 md:p-5 rounded-2xl flex items-center justify-between transition-all duration-300 hover:translate-y-[-2px] hover:border-[#D946EF]/30 hover:shadow-[0_0_20px_rgba(217,70,239,0.15)] group relative overflow-hidden">
            <div className="space-y-1 text-left min-w-0">
              <span className="text-[9px] font-bold text-[#9F7AC2] uppercase tracking-widest block truncate">Sales Revenue</span>
              <h3 className="text-xl md:text-2xl font-extrabold text-white font-sans flex items-center tracking-tight truncate">
                <IndianRupee size={16} className="-mr-0.5 text-[#D946EF]" />
                {totalSales}
              </h3>
            </div>
            <div className="p-2.5 bg-[#2B083A] text-[#10B981] rounded-xl border border-white/8 group-hover:bg-[#351049] transition-colors shrink-0">
              <IndianRupee size={18} />
            </div>
          </div>

          {/* Pending Verifications */}
          <div className="bg-[#1E0629] border border-white/8 p-4 md:p-5 rounded-2xl flex items-center justify-between transition-all duration-300 hover:translate-y-[-2px] hover:border-[#D946EF]/30 hover:shadow-[0_0_20px_rgba(217,70,239,0.15)] group relative overflow-hidden">
            <div className="space-y-1 text-left min-w-0">
              <span className="text-[9px] font-bold text-[#9F7AC2] uppercase tracking-widest block truncate">Payment Approvals</span>
              <h3 className="text-xl md:text-2xl font-extrabold text-white font-sans tracking-tight truncate">
                {pendingVerificationOrders.length}
              </h3>
            </div>
            <div className="p-2.5 bg-[#2B083A] text-[#F59E0B] rounded-xl border border-white/8 group-hover:bg-[#351049] transition-colors shrink-0">
              <ShieldAlert size={18} />
            </div>
          </div>

          {/* Active Orders */}
          <div className="bg-[#1E0629] border border-white/8 p-4 md:p-5 rounded-2xl flex items-center justify-between transition-all duration-300 hover:translate-y-[-2px] hover:border-[#D946EF]/30 hover:shadow-[0_0_20px_rgba(217,70,239,0.15)] group relative overflow-hidden">
            <div className="space-y-1 text-left min-w-0">
              <span className="text-[9px] font-bold text-[#9F7AC2] uppercase tracking-widest block truncate">Active Orders</span>
              <h3 className="text-xl md:text-2xl font-extrabold text-white font-sans tracking-tight truncate">
                {orders.filter((o) => o.order_status !== "delivered").length}
              </h3>
            </div>
            <div className="p-2.5 bg-[#2B083A] text-[#A855F7] rounded-xl border border-white/8 group-hover:bg-[#351049] transition-colors shrink-0">
              <Package size={18} />
            </div>
          </div>

          {/* Claims Pending */}
          <div className="bg-[#1E0629] border border-white/8 p-4 md:p-5 rounded-2xl flex items-center justify-between transition-all duration-300 hover:translate-y-[-2px] hover:border-[#D946EF]/30 hover:shadow-[0_0_20px_rgba(217,70,239,0.15)] group relative overflow-hidden">
            <div className="space-y-1 text-left min-w-0">
              <span className="text-[9px] font-bold text-[#9F7AC2] uppercase tracking-widest block truncate">Dispute Claims</span>
              <h3 className="text-xl md:text-2xl font-extrabold text-white font-sans tracking-tight truncate">
                {activeClaimsCount}
              </h3>
            </div>
            <div className="p-2.5 bg-[#2B083A] text-[#EF4444] rounded-xl border border-white/8 group-hover:bg-[#351049] transition-colors shrink-0">
              <ShieldAlert size={18} />
            </div>
          </div>

        </div>

        {/* Tab Controls — Scrollable and responsive */}
        <div className="w-full overflow-x-auto admin-scrollable-tabs flex border-b border-white/8 bg-[#1E0629]/60 p-1.5 rounded-2xl border border-white/8 max-w-3xl gap-1 shrink-0 scroll-smooth select-none">
          {adminTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold text-center transition-all cursor-pointer select-none shrink-0 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-[#A855F7] to-[#D946EF] text-white shadow-lg shadow-purple-500/25"
                  : "text-[#9F7AC2] hover:text-white hover:bg-[#2B083A]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB WORKSPACE MODULES */}
        <div className="space-y-6">
          
          {/* 1. ORDERS MODULE */}
          {activeTab === "orders" && (
            <div className="space-y-6 animate-slide-in text-left">
              <h2 className="text-xs md:text-sm font-extrabold uppercase tracking-widest text-[#D3B6FF] flex items-center gap-2">
                <Package size={14} className="text-[#D946EF]" />
                Customer Purchases & Prepaid Verification
              </h2>

              {orders.length === 0 ? (
                <p className="text-xs text-[#9F7AC2]/50 text-center py-12 bg-[#1E0629] border border-white/8 rounded-2xl">
                  No orders placed yet.
                </p>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-[#1E0629] border border-white/8 rounded-3xl p-5 md:p-6 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-6 text-left"
                    >
                      {/* Customer & Totals Info */}
                      <div className="lg:col-span-4 space-y-4">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-[#D946EF] uppercase tracking-wider block">
                            Order Code: {order.id}
                          </span>
                          <p className="text-[10px] text-[#9F7AC2]">
                            Placed: {new Date(order.created_at).toLocaleString()}
                          </p>
                        </div>

                        {/* Customer profile */}
                        <div className="bg-[#2B083A] p-3.5 rounded-xl border border-white/8 text-[11px] font-sans text-white/90 space-y-1.5">
                          <span className="font-extrabold text-[#D3B6FF] block uppercase tracking-wider text-[9px] border-b border-white/8 pb-1 mb-1">Recipient Details:</span>
                          <p><strong>Name:</strong> {order.shipping_address.name}</p>
                          <p><strong>Phone:</strong> {order.shipping_address.phone}</p>
                          <p><strong>Email:</strong> {order.shipping_address.email}</p>
                          <p className="leading-relaxed"><strong>Address:</strong> {order.shipping_address.address}, {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.zipCode}</p>
                        </div>
                      </div>

                      {/* Items details block */}
                      <div className="lg:col-span-4 text-xs font-sans space-y-3">
                        <span className="font-extrabold text-[#D3B6FF] block uppercase tracking-wider text-[9px] border-b border-white/8 pb-1">
                          Purchased Items:
                        </span>
                        <div className="divide-y divide-white/6 text-[11px] space-y-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="py-2.5 flex justify-between gap-4">
                              <span className="font-semibold text-white/90 leading-tight">
                                {item.product.title}
                                {item.selectedShade && <strong className="text-[#D946EF] ml-1">({item.selectedShade})</strong>}
                              </span>
                              <span className="text-[#9F7AC2] shrink-0">Qty: {item.quantity}</span>
                            </div>
                          ))}
                        </div>

                        {/* Gift bundles */}
                        {(order.freebies.scrunchies || order.freebies.lipstick || order.freebies.choice) && (
                          <div className="pt-2 border-t border-dashed border-white/8 text-[10px] space-y-1 font-semibold text-[#10B981]">
                            <strong className="text-[9px] uppercase tracking-wider text-[#10B981]/80">Bundled Freebies:</strong>
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                              {order.freebies.scrunchies && <span className="bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/25">✓ Scrunchies</span>}
                              {order.freebies.lipstick && <span className="bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/25">✓ Lipstick</span>}
                              {order.freebies.choice && <span className="bg-[#10B981]/15 px-2 py-0.5 rounded border border-[#10B981]/30 font-extrabold">✓ Choice: {order.freebies.choice}</span>}
                            </div>
                          </div>
                        )}

                        <div className="pt-2 border-t border-white/8 flex justify-between font-bold text-white text-xs">
                          <span>Grand Total Collected:</span>
                          <span className="text-[#D946EF] text-sm">₹{order.total_amount}</span>
                        </div>
                      </div>

                      {/* Operations Actions & Screenshot display */}
                      <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
                        
                        {/* Reference code and screenshot */}
                        {order.upi_transaction_id ? (
                          <div className="p-3 bg-[#2B083A] border border-white/8 rounded-xl space-y-2.5">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="text-[#9F7AC2]">Ref ID:</span>
                              <span className="font-mono text-[#D946EF] font-extrabold bg-black/35 border border-white/8 px-2 py-0.5 rounded">{order.upi_transaction_id}</span>
                            </div>

                            {/* Clickable Receipt Screenshot */}
                            {order.screenshot_url && (
                              <button
                                onClick={() => setPlayingVideoUrl(order.screenshot_url!)}
                                className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#351049] border border-white/8 hover:bg-[#43135A] text-xs font-bold rounded-lg text-white transition-colors cursor-pointer"
                              >
                                <Eye size={13} className="text-[#D3B6FF]" />
                                View Payment Screenshot
                              </button>
                            )}
                          </div>
                        ) : (
                          order.payment_method === "UPI" && (
                            <div className="p-3.5 bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] rounded-xl text-[10px] leading-relaxed font-semibold">
                              ⚠️ Payment verification pending. Customer has not uploaded reference data.
                            </div>
                          )
                        )}

                        {/* Status tracker controls */}
                        <div className="space-y-2">
                          <span className="text-[9px] font-bold text-[#9F7AC2] uppercase tracking-wider block">Quick Operations Actions:</span>
                          
                          <div className="grid grid-cols-2 gap-2">
                            {/* 1. Confirm prepaid verification */}
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

                            {/* 2. Mark Shipped */}
                            <button
                              disabled={order.payment_status !== "paid" || order.order_status === "shipped" || order.order_status === "delivered"}
                              onClick={() => setSelectedShipOrder(order.id)}
                              className={`py-2 px-1 text-[9px] font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                order.order_status === "shipped" || order.order_status === "delivered"
                                  ? "bg-blue-500/15 text-blue-400 border border-blue-500/25 cursor-not-allowed"
                                  : order.payment_status !== "paid"
                                  ? "bg-[#2B083A] text-white/20 border border-white/6 cursor-not-allowed"
                                  : "bg-blue-600 hover:bg-blue-700 text-white"
                              }`}
                            >
                              <Send size={12} />
                              {order.order_status === "shipped" || order.order_status === "delivered" ? "Shipped" : "Dispatch"}
                            </button>

                            {/* 3. Print Shiprocket Label */}
                            {order.payment_status === "paid" && (
                              <button
                                type="button"
                                onClick={() => setLabelModalOrder(order)}
                                className="col-span-2 py-2 text-[9px] font-bold uppercase tracking-wider bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-white/8 shadow-md"
                              >
                                <Package size={12} />
                                Print Shiprocket Label
                              </button>
                            )}

                            {/* 4. Mark Delivered */}
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
                                  ? "bg-[#2B083A] text-white/20 border border-white/6 cursor-not-allowed"
                                  : "bg-[#10B981] hover:bg-[#10B981]/90 text-white"
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

          {/* 2. CLAIMS MODULE */}
          {activeTab === "claims" && (
            <div className="space-y-6 animate-slide-in text-left">
              <h2 className="text-xs md:text-sm font-extrabold uppercase tracking-widest text-[#D3B6FF] flex items-center gap-2">
                <ShieldAlert size={14} className="text-[#EF4444]" />
                Unboxing Video Dispute Claims Panel
              </h2>

              {claims.length === 0 ? (
                <p className="text-xs text-[#9F7AC2]/50 text-center py-12 bg-[#1E0629] border border-white/8 rounded-2xl">
                  No claims filed yet.
                </p>
              ) : (
                <div className="space-y-6">
                  {claims.map((claim) => (
                    <div
                      key={claim.id}
                      className="bg-[#1E0629] border border-white/8 rounded-3xl p-5 md:p-6 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-6"
                    >
                      {/* Left: Claim info details */}
                      <div className="lg:col-span-4 space-y-4">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-[#D946EF] uppercase tracking-wider block">
                            Dispute ID: {claim.id}
                          </span>
                          <p className="text-xs font-bold text-white mt-1.5">
                            Associated Order: {claim.order_id}
                          </p>
                          <p className="text-[10px] text-[#9F7AC2]">
                            Filed on: {new Date(claim.created_at).toLocaleString()}
                          </p>
                        </div>

                        <div className="bg-[#2B083A] p-3.5 rounded-xl border border-white/8 text-[11px] font-sans text-white/90 space-y-1.5">
                          <p><strong>Claim Category:</strong> {claim.claim_type.toUpperCase()}</p>
                          <p className="mt-1 flex items-center gap-2">
                            <strong>Status:</strong>{" "}
                            <span className={`font-bold px-2 py-0.5 rounded-full border text-[9px] uppercase ${
                              claim.status === "approved"
                                ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/25"
                                : claim.status === "rejected"
                                ? "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/25"
                                : "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/25"
                            }`}>
                              {claim.status}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Middle: Video evidence player block */}
                      <div className="lg:col-span-4 flex flex-col items-center justify-center">
                        <div className="relative w-full aspect-video rounded-xl bg-zinc-950 overflow-hidden shadow-md flex flex-col items-center justify-center text-white border border-white/8">
                          <button
                            onClick={() => setPlayingVideoUrl(claim.unboxing_video_url)}
                            className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all transform hover:scale-110 flex items-center justify-center shadow-md cursor-pointer"
                          >
                            <Play size={20} fill="currentColor" />
                          </button>
                          <span className="text-[10px] font-bold tracking-wider uppercase mt-3 font-sans text-[#D3B6FF]">
                            Watch Continuous Unboxing Video
                          </span>
                        </div>
                      </div>

                      {/* Right: Dispute action panel */}
                      <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-[#9F7AC2] uppercase tracking-wider block">Sayanita's Decision Notes *</label>
                          <textarea
                            disabled={claim.status !== "pending"}
                            required
                            placeholder="e.g. Approved. Verified uncut unboxing video, outer seal was broken. Sending replacement Laneige mask."
                            value={selectedClaim?.id === claim.id ? resolutionNotes : claim.resolution_notes || ""}
                            onChange={(e) => {
                              setSelectedClaim(claim);
                              setResolutionNotes(e.target.value);
                            }}
                            className="w-full text-xs p-3 rounded-lg border border-white/8 outline-none bg-[#2B083A] text-white focus:border-[#D946EF] transition-all min-h-[80px]"
                          />
                        </div>

                        {claim.status === "pending" && (
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => {
                                setSelectedClaim(claim);
                                handleResolveClaim(claim.id, "approved");
                              }}
                              className="py-2 text-[10px] font-bold uppercase tracking-wider bg-[#10B981] hover:bg-[#10B981]/90 text-white rounded-lg transition-all cursor-pointer shadow-md"
                            >
                              Approve Claim
                            </button>
                            <button
                              onClick={() => {
                                setSelectedClaim(claim);
                                handleResolveClaim(claim.id, "rejected");
                              }}
                              className="py-2 text-[10px] font-bold uppercase tracking-wider bg-[#EF4444] hover:bg-[#EF4444]/90 text-white rounded-lg transition-all cursor-pointer shadow-md"
                            >
                              Reject Claim
                            </button>
                          </div>
                        )}
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

          {/* 4. SETTINGS MODULE */}
          {activeTab === "settings" && (
            <div className="bg-[#1E0629] border border-white/8 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-left animate-slide-in">
              <h2 className="text-xs md:text-sm font-extrabold uppercase tracking-widest text-[#D3B6FF] border-b border-white/8 pb-3 flex items-center gap-2">
                <Sliders size={18} className="text-[#D946EF]" />
                Store Operational Safeguards
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* COD toggles */}
                <div className="p-5 rounded-2xl border border-white/8 bg-[#2B083A] space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-white block">Enable Cash on Delivery (COD)</span>
                      <span className="text-[10px] text-[#9F7AC2] leading-relaxed block mt-1">
                        Toggles whether COD shows at checkout. Recommended: KEEP DISABLED to honor policy rules.
                      </span>
                    </div>
                    <button
                      onClick={adminToggleCod}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                        settings.codEnabled ? "bg-[#D946EF]" : "bg-zinc-800"
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
                    <div className="text-[10px] text-[#D946EF] font-bold leading-relaxed border-t border-white/8 pt-3">
                      ⚠️ COD orders automatically skip prepaid reference uploading, instead launching simulated OTP verification code: <strong>1234</strong> at checkout.
                    </div>
                  )}
                </div>

                {/* Backups database description */}
                <div className="p-5 rounded-2xl border border-white/8 bg-[#2B083A] space-y-3 text-xs leading-relaxed text-white/80 font-sans">
                  <span className="font-extrabold text-[#D3B6FF] block uppercase tracking-wider text-[9px] border-b border-white/8 pb-1">Database & Serverless Configuration</span>
                  <p>
                    Product catalog now syncs through Supabase APIs when environment keys are configured, with local storage fallback for offline continuity.
                  </p>
                  <p className="mt-1">
                    AI image-text extraction runs through a secure server route using Gemini Vision & Groq APIs. Ensure your Supabase table, storage bucket, and env keys are configured.
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* 5. COUPONS TAB MODULE */}
          {activeTab === "coupons" && (
            <div className="space-y-6 animate-slide-in text-left">
              <div className="bg-[#1E0629] border border-white/8 rounded-3xl p-6 shadow-2xl space-y-6">
                <div>
                  <h3 className="text-xs md:text-sm font-extrabold uppercase tracking-widest text-[#D3B6FF]">Create Promotional Discount Coupon</h3>
                  <p className="text-[10px] text-[#9F7AC2] mt-1">Add custom promo codes and configure discount rates directly on the store.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
                  <label className="space-y-1.5">
                    <span className="font-bold text-[#9F7AC2] uppercase tracking-wider text-[9px]">Coupon Code *</span>
                    <input
                      type="text"
                      placeholder="e.g. GLOW50"
                      value={newCoupon.code}
                      onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                      className="admin-glass-input font-bold"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="font-bold text-[#9F7AC2] uppercase tracking-wider text-[9px]">Discount Rate (%) *</span>
                    <input
                      type="number"
                      placeholder="e.g. 15"
                      value={newCoupon.discount_percent}
                      onChange={(e) => setNewCoupon({ ...newCoupon, discount_percent: e.target.value })}
                      className="admin-glass-input font-bold"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="font-bold text-[#9F7AC2] uppercase tracking-wider text-[9px]">Minimum Cart Value (₹)</span>
                    <input
                      type="number"
                      placeholder="e.g. 799"
                      value={newCoupon.min_cart_value}
                      onChange={(e) => setNewCoupon({ ...newCoupon, min_cart_value: e.target.value })}
                      className="admin-glass-input"
                    />
                  </label>
                </div>

                <div className="flex justify-end pt-3 border-t border-white/8">
                  <button
                    type="button"
                    onClick={handleAddCoupon}
                    className="admin-gradient-btn inline-flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg cursor-pointer"
                  >
                    <Plus size={14} />
                    Create Promo Coupon
                  </button>
                </div>
              </div>

              {/* Coupons List Table */}
              <div className="bg-[#1E0629] border border-white/8 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-sans text-white/95">
                    <thead className="bg-[#2B083A] border-b border-white/8 text-[#D3B6FF] uppercase font-bold text-[9px] tracking-wider">
                      <tr>
                        <th className="p-4 text-left">Coupon Code</th>
                        <th className="p-4 text-center">Type</th>
                        <th className="p-4 text-center">Benefit</th>
                        <th className="p-4 text-center">Min Cart Requirement</th>
                        <th className="p-4 text-center">Status</th>
                        <th className="p-4 text-center">Delete Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/6 bg-[#1E0629]/40 font-semibold text-xs">
                      {adminCoupons.map((coupon) => (
                        <tr key={coupon.code} className="hover:bg-[#2B083A]/30 transition-colors">
                          <td className="p-4 text-left font-mono font-bold text-white text-sm">
                            {coupon.code}
                          </td>
                          <td className="p-4 text-center">
                            {coupon.discount_percent > 0 ? "Percentage Discount" : "Flat Discount"}
                          </td>
                          <td className="p-4 text-center font-bold text-[#10B981]">
                            {coupon.discount_percent > 0 ? `${coupon.discount_percent}% OFF` : `₹${coupon.discount_flat} OFF`}
                          </td>
                          <td className="p-4 text-center font-sans">
                            ₹{coupon.min_cart_value || 0}
                          </td>
                          <td className="p-4 text-center">
                            <span className="bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/25 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                              Active
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteCoupon(coupon.code)}
                              className="p-2 bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20 rounded-lg transition-colors cursor-pointer border border-white/8"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 6. ANALYTICS MODULE */}
          {activeTab === "analytics" && (
            <div className="space-y-6 animate-slide-in text-left">
              <h2 className="text-xs md:text-sm font-extrabold uppercase tracking-widest text-[#D3B6FF]">
                Real-Time Store Performance & Analytics Metrics
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Coupon Usage Stats */}
                <div className="bg-[#1E0629] border border-white/8 p-6 rounded-2xl shadow-2xl space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#D3B6FF] border-b border-white/8 pb-2">Coupon Redemption Rates</h3>
                  <div className="space-y-3 font-sans text-xs">
                    <div className="flex justify-between items-center border-b border-white/6 pb-2">
                      <span className="font-mono font-bold text-[#D946EF]">GLOW10</span>
                      <span className="font-semibold text-white/95">12 redemptions (15% rate)</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/6 pb-2">
                      <span className="font-mono font-bold text-[#D946EF]">AUTHENTIC</span>
                      <span className="font-semibold text-white/95">8 redemptions (10% rate)</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/6 pb-2">
                      <span className="font-mono font-bold text-[#D946EF]">FESTIVE20</span>
                      <span className="font-semibold text-white/95">4 redemptions (5% rate)</span>
                    </div>
                  </div>
                </div>

                {/* Dispute resolution performance */}
                <div className="bg-[#1E0629] border border-white/8 p-6 rounded-2xl shadow-2xl space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#D3B6FF] border-b border-white/8 pb-2">Dispute & Claims Resolution</h3>
                  <div className="space-y-2 text-xs font-sans text-white/90 border-b border-white/6 pb-2">
                    <div className="flex justify-between">
                      <span>Total Claims Filed:</span>
                      <span className="font-bold text-white">{claims.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Approved Replacements:</span>
                      <span className="font-bold text-[#10B981]">{claims.filter((c) => c.status === "approved").length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rejected Dispute Claims:</span>
                      <span className="font-bold text-[#EF4444]">{claims.filter((c) => c.status === "rejected").length}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs font-sans text-white/90">
                    <span>Resolution Speed:</span>
                    <span className="font-bold text-[#D3B6FF]">~2.4 Hours (AI-assisted)</span>
                  </div>
                </div>

                {/* Inventory stock warnings */}
                <div className="bg-[#1E0629] border border-white/8 p-6 rounded-2xl shadow-2xl space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#D3B6FF] border-b border-white/8 pb-2">Stock Level Safety Alerts</h3>
                  <div className="space-y-2.5 text-xs font-sans text-white/90 max-h-[140px] overflow-y-auto pr-1">
                    {products.filter((p) => p.stock <= 5).length === 0 ? (
                      <div className="text-[#10B981] font-bold flex items-center gap-1.5">
                        ✓ All stock levels are perfectly balanced.
                      </div>
                    ) : (
                      products
                        .filter((p) => p.stock <= 5)
                        .map((p) => (
                          <div key={p.id} className="flex justify-between items-center text-[11px] text-[#EF4444] font-semibold border-b border-white/6 py-1">
                            <span className="truncate max-w-[150px]">{p.title}</span>
                            <span className="bg-[#EF4444]/15 px-2 py-0.5 rounded border border-[#EF4444]/25">Only {p.stock} left!</span>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 7. USERS MODULE */}
          {activeTab === "users" && (
            <div className="space-y-6 animate-slide-in text-left">
              <div className="flex flex-col sm:flex-row justify-between items-center border-b border-white/8 pb-3 gap-3">
                <div>
                  <h2 className="text-xs md:text-sm font-extrabold uppercase tracking-widest text-[#D3B6FF]">
                    Registered Customer Vaults
                  </h2>
                  <p className="text-[10px] text-[#9F7AC2] mt-1">Audit customer profiles, adjust loyalty tiers, or suspend/unsuspend security credentials.</p>
                </div>
              </div>

              {(!adminUsers || adminUsers.length === 0) ? (
                <p className="text-xs text-[#9F7AC2]/50 text-center py-12 bg-[#1E0629] border border-white/8 rounded-2xl">
                  No registered users found.
                </p>
              ) : (
                <div className="bg-[#1E0629] border border-white/8 rounded-3xl overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-sans text-white/95">
                      <thead className="bg-[#2B083A] border-b border-white/8 text-[#D3B6FF] uppercase font-bold text-[9px] tracking-wider">
                        <tr>
                          <th className="p-4 text-left">Customer</th>
                          <th className="p-4 text-left">Contact Info</th>
                          <th className="p-4 text-center">Skin Type</th>
                          <th className="p-4 text-center">Loyalty Tier</th>
                          <th className="p-4 text-center">Glow Points</th>
                          <th className="p-4 text-center">Account Status</th>
                          <th className="p-4 text-center">Operational Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/6 bg-[#1E0629]/40 font-semibold text-xs">
                        {adminUsers.map((cust) => (
                          <UserRow
                            key={cust.email}
                            cust={cust}
                            adminAdjustLoyaltyPoints={adminAdjustLoyaltyPoints}
                            adminSuspendUser={adminSuspendUser}
                            adminUnsuspendUser={adminUnsuspendUser}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 8. CUSTOMER INSIGHTS TAB */}
          {activeTab === "customer-insights" && (
            <div className="space-y-6 animate-slide-in text-left">
              <h2 className="text-xs md:text-sm font-extrabold uppercase tracking-widest text-[#D3B6FF] flex items-center gap-2">
                <TrendingUp size={14} className="text-[#D946EF]" />
                Luxury Customer Intelligence & Insights
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* AOV and metrics */}
                <div className="bg-[#1E0629] border border-white/8 p-6 rounded-2xl shadow-2xl space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#D3B6FF] border-b border-white/8 pb-2">Purchasing Power Insights</h3>
                  <div className="space-y-3 font-sans text-xs">
                    <div className="flex justify-between items-center border-b border-white/6 pb-2">
                      <span className="text-orchid-text-muted">Average Order Value (AOV)</span>
                      <span className="font-extrabold text-white font-mono">
                        ₹{orders.length > 0 ? Math.round(orders.reduce((sum, o) => sum + o.total_amount, 0) / orders.length) : 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/6 pb-2">
                      <span className="text-orchid-text-muted">Customer Lifetime Retention</span>
                      <span className="font-extrabold text-emerald-400">86.4% dewy tier</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/6 pb-2">
                      <span className="text-orchid-text-muted">AI Skin Test Recommendation Hit Rate</span>
                      <span className="font-extrabold text-[#D946EF]">91.8% match score</span>
                    </div>
                  </div>
                </div>

                {/* Concerns heatmap breakdown */}
                <div className="bg-[#1E0629] border border-white/8 p-6 rounded-2xl shadow-2xl space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#D3B6FF] border-b border-white/8 pb-2">Skincare Concern Heatmap</h3>
                  <div className="space-y-3.5 text-[11px] font-sans text-white/90">
                    {[
                      { concern: "Dryness & Dehydration", count: 4, rate: 80 },
                      { concern: "Acne & Blemishes", count: 3, rate: 60 },
                      { concern: "Pigmentation & Spots", count: 2, rate: 40 },
                      { concern: "Fine Lines & Wrinkles", count: 1, rate: 20 }
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-white">{item.concern}</span>
                          <span className="text-orchid-text-muted font-mono">{item.count} profiles</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#120018] border border-white/5 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${item.rate}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skin type distribution */}
                <div className="bg-[#1E0629] border border-white/8 p-6 rounded-2xl shadow-2xl space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#D3B6FF] border-b border-white/8 pb-2">Skin Type Distribution</h3>
                  <div className="space-y-3.5 text-[11px] font-sans text-white/90">
                    {[
                      { type: "Sensitive", rate: 50 },
                      { type: "Oily / Combination", rate: 30 },
                      { type: "Normal / Dry", rate: 20 }
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-white capitalize">{item.type}</span>
                          <span className="text-orchid-text-muted font-mono">{item.rate}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#120018] border border-white/5 overflow-hidden">
                          <div className="h-full bg-[#D946EF] rounded-full" style={{ width: `${item.rate}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 9. ACCOUNT SYSTEM MODULE */}
          {activeTab === "account-system" && (
            <div className="space-y-6 animate-slide-in text-left">
              <h2 className="text-xs md:text-sm font-extrabold uppercase tracking-widest text-[#D3B6FF] flex items-center gap-2">
                <ShieldCheck size={14} className="text-[#D946EF]" />
                Operational System Settings & Variable Audits
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                
                {/* System variables */}
                <div className="bg-[#1E0629] border border-white/8 p-6 rounded-2xl shadow-2xl space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#D3B6FF] border-b border-white/8 pb-2">Variable Parameters</h3>
                  <div className="space-y-3 text-xs font-sans font-semibold">
                    <div className="flex justify-between items-center border-b border-white/6 pb-2">
                      <span className="text-orchid-text-muted">Supabase Realtime Connection</span>
                      <span className="text-emerald-400 font-extrabold uppercase tracking-wide">Online</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/6 pb-2">
                      <span className="text-orchid-text-muted">Master Developer Key Bypasses</span>
                      <span className="text-[#FF8DC7] font-extrabold font-mono">0909 (Active)</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/6 pb-2">
                      <span className="text-orchid-text-muted">Email SMTP Server Gateway</span>
                      <span className="text-amber-500 font-extrabold uppercase tracking-wide">Offline (Sandbox Active)</span>
                    </div>
                  </div>
                </div>

                {/* Session list */}
                <div className="bg-[#1E0629] border border-white/8 p-6 rounded-2xl shadow-2xl space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#D3B6FF] border-b border-white/8 pb-2">Simulated Active Sessions</h3>
                  <div className="space-y-3 text-[11px] font-sans">
                    <div className="flex justify-between items-center border-b border-white/6 pb-2">
                      <div className="space-y-0.5">
                        <span className="font-bold text-white block">Saswata Dey (Owner Tech Hub)</span>
                        <span className="text-orchid-text-muted block">IP: 192.168.1.45 • Kolkata, IN</span>
                      </div>
                      <span className="text-[9px] uppercase font-bold text-emerald-400">Current</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/6 pb-2">
                      <div className="space-y-0.5">
                        <span className="font-bold text-white block">Sayanita Payra (Store Director)</span>
                        <span className="text-orchid-text-muted block">IP: 202.144.15.2 • West Bengal</span>
                      </div>
                      <span className="text-[9px] uppercase font-bold text-[#D946EF]">Online</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

      </main>

      {/* 🚚 PRINT SHIPROCKET LABEL MODAL */}
      {labelModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={() => setLabelModalOrder(null)} />
          <div className="relative bg-[#1E0629] rounded-3xl p-6 border border-white/8 shadow-2xl max-w-md w-full mx-4 flex flex-col justify-between animate-slide-in text-center space-y-4">
            
            <button
              type="button"
              onClick={() => setLabelModalOrder(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-[#2B083A] text-[#D3B6FF] hover:text-[#D946EF] shadow-md border border-white/8 z-10 cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="space-y-1 text-left border-b border-white/8 pb-2">
              <h3 className="text-base font-bold font-elegant text-white flex items-center gap-1.5">
                <Package className="text-[#D946EF]" size={20} />
                Shiprocket Airway Dispatch Label
              </h3>
              <p className="text-[10px] text-[#9F7AC2]">
                Order ID: {labelModalOrder.id} • Customer: {labelModalOrder.shipping_address.name}
              </p>
            </div>

            {/* Label Print Frame */}
            <div className="border border-white/8 rounded-2xl overflow-hidden bg-black/30 p-2 h-[350px]">
              <iframe
                src={`/api/shipping?action=label&orderId=${labelModalOrder.id}&trackingId=${labelModalOrder.tracking_id || "SR-7182936"}`}
                className="w-full h-full border-0 rounded-xl"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setLabelModalOrder(null)}
                className="flex-1 py-3 rounded-xl border border-white/10 text-xs font-semibold text-white hover:bg-[#2B083A] transition-colors cursor-pointer"
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
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg cursor-pointer"
              >
                Print Label
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 🖼️ MODAL LIGHTBOX PLAYER (FOR UNBOXING VIDEO OR SCREENSHOT) */}
      {playingVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={() => setPlayingVideoUrl(null)} />
          <div className="relative bg-[#1E0629] rounded-3xl p-3 border border-white/8 shadow-2xl max-w-2xl w-full mx-4 aspect-video flex flex-col justify-between animate-slide-in">
            <button
              onClick={() => setPlayingVideoUrl(null)}
              className="absolute -top-3 -right-3 p-2 rounded-full bg-[#2B083A] text-white hover:text-[#D946EF] shadow-lg border border-white/8 z-10 cursor-pointer"
            >
              <X size={18} />
            </button>

            {playingVideoUrl.endsWith(".mp4") ? (
              <video controls autoPlay className="w-full h-full rounded-2xl object-cover">
                <source src={playingVideoUrl} type="video/mp4" />
                Your browser does not support HTML5 video player.
              </video>
            ) : (
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black border border-white/8">
                <Image
                  src={playingVideoUrl}
                  alt="Receipt Screenshot uploaded by customer"
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
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={() => setSelectedShipOrder(null)} />
          <form onSubmit={handleShipOrder} className="relative bg-[#1E0629] rounded-3xl p-6 border border-white/8 shadow-2xl max-w-sm w-full mx-4 space-y-6 animate-slide-in text-left">
            
            <div className="flex items-center gap-3 border-b border-white/8 pb-3 text-white">
              <Package size={20} className="text-[#D946EF]" />
              <h3 className="text-base font-extrabold font-sans uppercase tracking-wider">
                Log Shipment details
              </h3>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div>
                <label className="font-bold text-[#9F7AC2] uppercase tracking-wider text-[9px] block mb-1.5">Partner Courier *</label>
                <select
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="admin-glass-input cursor-pointer"
                >
                  <option value="BlueDart" className="bg-[#140019]">BlueDart Express</option>
                  <option value="Delhivery" className="bg-[#140019]">Delhivery Logistics</option>
                  <option value="DTDC" className="bg-[#140019]">DTDC Courier</option>
                  <option value="IndiaPost" className="bg-[#140019]">India Post</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#9F7AC2] uppercase tracking-wider text-[9px] block mb-1.5">Tracking Code / Ref No. *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BDX-9184820129"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  className="admin-glass-input"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedShipOrder(null)}
                className="flex-1 py-3 rounded-xl border border-white/10 text-xs font-semibold text-white text-center hover:bg-[#2B083A] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="admin-gradient-btn flex-1 py-3 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg cursor-pointer"
              >
                Dispatch Order
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Floating Mobile Bottom Nav Glass Dock */}
      <nav className="md:hidden admin-mobile-dock" aria-label="Mobile operational navigation">
        {adminTabs.map((tab) => {
          const Icon = tab.id === "orders" ? Package : 
                       tab.id === "claims" ? ShieldAlert : 
                       tab.id === "inventory" ? Sliders : 
                       tab.id === "coupons" ? Sparkles : 
                       tab.id === "analytics" ? TrendingUp : 
                       ShieldCheck;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`admin-dock-item ${activeTab === tab.id ? "active" : ""}`}
            >
              <span className="icon-wrapper">
                <Icon size={16} />
              </span>
              <span className="text-[7.5px] font-extrabold uppercase tracking-widest">{tab.id === "inventory" ? "stock" : tab.id === "settings" ? "config" : tab.id}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}

// Subcomponent: Inventory Editing Row
interface InventoryRowProps {
  product: Product;
  onUpdateStock: (id: string, count: number) => void;
  onUpdatePrice: (id: string, price: number) => void;
  onRemove: () => void;
}

const InventoryRow: React.FC<InventoryRowProps> = ({ product, onUpdateStock, onUpdatePrice, onRemove }) => {
  const [stockEdit, setStockEdit] = useState(product.stock);
  const [priceEdit, setPriceEdit] = useState(product.price);
  const [successMsg, setSuccessMsg] = useState("");

  const handleApply = () => {
    onUpdateStock(product.id, stockEdit);
    onUpdatePrice(product.id, priceEdit);
    setSuccessMsg("Updated!");
    setTimeout(() => setSuccessMsg(""), 1500);
  };

  return (
    <tr className="hover:bg-[#2B083A]/30 transition-colors border-b border-white/8 text-[#D3B6FF]">
      <td className="p-4 text-left font-bold text-white">
        {product.title}
        <span className="text-[10px] uppercase font-sans text-[#D3B6FF] font-semibold block mt-0.5">{product.brand}</span>
      </td>
      <td className="p-4 text-center font-mono font-bold text-[#9F7AC2]">
        {product.sku}
      </td>
      <td className="p-4 text-center">
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-white/40 font-light">₹</span>
          <input
            type="number"
            value={priceEdit}
            onChange={(e) => setPriceEdit(parseInt(e.target.value) || 0)}
            className="w-16 text-center border border-white/8 rounded-md py-1 font-bold text-white bg-[#2B083A] focus:border-[#D946EF] outline-none"
          />
        </div>
      </td>
      <td className="p-4 text-center">
        <input
          type="number"
          value={stockEdit}
          onChange={(e) => setStockEdit(parseInt(e.target.value) || 0)}
          className={`w-14 text-center border border-white/8 rounded-md py-1 font-bold bg-[#2B083A] focus:border-[#D946EF] outline-none ${
            stockEdit <= 3 ? "text-red-400 border-red-500/30" : "text-white"
          }`}
        />
      </td>
      <td className="p-4 text-center">
        <div className="relative mx-auto w-14 h-14 rounded-xl overflow-hidden border border-white/8 bg-[#2B083A]/50">
          <Image src={product.image} alt={product.title} fill className="object-cover" unoptimized />
        </div>
      </td>
      <td className="p-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={handleApply}
            className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-pink-500 hover:scale-105 transition-all text-white text-[10px] uppercase font-bold tracking-wider rounded-lg shadow-md cursor-pointer"
          >
            Apply
          </button>
          <button
            onClick={onRemove}
            className="px-3.5 py-1.5 bg-red-600 hover:scale-105 transition-all text-white text-[10px] uppercase font-bold tracking-wider rounded-lg inline-flex items-center gap-1 cursor-pointer"
          >
            <Trash2 size={12} />
            Remove
          </button>
          {successMsg && <span className="text-[10px] font-bold text-[#10B981] animate-fade-in">{successMsg}</span>}
        </div>
      </td>
    </tr>
  );
};

// Subcomponent: Registered User Row
interface UserRowProps {
  cust: UserProfile;
  adminAdjustLoyaltyPoints: (email: string, points: number) => void;
  adminSuspendUser: (email: string) => void;
  adminUnsuspendUser: (email: string) => void;
}

const UserRow: React.FC<UserRowProps> = ({
  cust,
  adminAdjustLoyaltyPoints,
  adminSuspendUser,
  adminUnsuspendUser
}) => {
  const isSuspended = cust.suspended || false;
  const [pointsInput, setPointsInput] = useState(String(cust.loyalty_points || 0));

  useEffect(() => {
    setPointsInput(String(cust.loyalty_points || 0));
  }, [cust.loyalty_points]);

  return (
    <tr className="hover:bg-[#2B083A]/30 transition-colors">
      <td className="p-4 text-left flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-white/5 border border-white/10 shrink-0">
          {cust.avatar ? (
            <Image src={cust.avatar} alt={cust.name} fill className="object-cover" unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/40 font-bold uppercase text-xs">
              {cust.name[0]}
            </div>
          )}
        </div>
        <div className="space-y-0.5">
          <span className="font-bold text-white text-sm block">{cust.name}</span>
          {cust.bio && <span className="text-[10px] text-orchid-text-muted leading-tight line-clamp-1 max-w-[180px] block">{cust.bio}</span>}
        </div>
      </td>
      <td className="p-4 text-left">
        <span className="font-mono text-white block">{cust.email}</span>
        <span className="font-mono text-orchid-text-muted text-[10px] block">{cust.phone}</span>
      </td>
      <td className="p-4 text-center capitalize">
        <span className="px-2 py-0.5 rounded-full border border-white/5 bg-white/5 text-[9px] uppercase tracking-wider font-extrabold text-white">
          {cust.skin_type || "normal"}
        </span>
      </td>
      <td className="p-4 text-center">
        <span 
          className="px-2 py-0.5 rounded-full border text-[8px] uppercase tracking-widest font-extrabold"
          style={{ 
            borderColor: cust.loyalty_tier === "Orchid Platinum" ? "#C77DFF30" : "rgba(255,255,255,0.1)",
            backgroundColor: cust.loyalty_tier === "Orchid Platinum" ? "#C77DFF15" : "rgba(255,255,255,0.05)",
            color: cust.loyalty_tier === "Orchid Platinum" ? "#C77DFF" : "white"
          }}
        >
          {cust.loyalty_tier || "Bronze"}
        </span>
      </td>
      <td className="p-4 text-center">
        <div className="flex items-center justify-center gap-1.5">
          <input
            type="number"
            value={pointsInput}
            onChange={(e) => setPointsInput(e.target.value)}
            className="w-14 text-center border border-white/8 rounded-md py-0.5 bg-[#2B083A] text-white focus:border-[#D946EF] outline-none text-[11px]"
          />
          <button
            onClick={() => {
              adminAdjustLoyaltyPoints(cust.email, parseInt(pointsInput) || 0);
              alert(`Loyalty points successfully set to ${pointsInput} for customer ${cust.name}.`);
            }}
            className="px-2 py-1 bg-[#D946EF] hover:bg-[#D946EF]/90 text-white rounded text-[8px] uppercase font-black cursor-pointer"
          >
            Set
          </button>
        </div>
      </td>
      <td className="p-4 text-center">
        <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold border ${
          isSuspended 
            ? "bg-red-500/10 border-red-500/20 text-red-400" 
            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
        }`}>
          {isSuspended ? "Suspended" : "Active"}
        </span>
      </td>
      <td className="p-4 text-center">
        {isSuspended ? (
          <button
            onClick={() => {
              adminUnsuspendUser(cust.email);
              alert(`Security credentials restored for ${cust.name}.`);
            }}
            className="px-3.5 py-1.5 bg-[#10B981] hover:bg-[#10B981]/90 text-white text-[9px] uppercase font-extrabold tracking-wider rounded-lg shadow-md cursor-pointer transition-all active:scale-95"
          >
            Unsuspend
          </button>
        ) : (
          <button
            onClick={() => {
              const confirm = window.confirm(`Temporarily suspend credentials for ${cust.name}? They will immediately lose dashboard checkout privileges.`);
              if (confirm) {
                adminSuspendUser(cust.email);
                alert(`Account suspended successfully.`);
              }
            }}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-[9px] uppercase font-extrabold tracking-wider rounded-lg shadow-md cursor-pointer transition-all active:scale-95"
          >
            Suspend User
          </button>
        )}
      </td>
    </tr>
  );
};
