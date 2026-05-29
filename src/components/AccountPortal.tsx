"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useShop, UserAddress, UserPaymentMethod, Order, Product } from "@/context/ShopContext";
import { Header } from "@/components/Header";
import { CartDrawer } from "@/components/CartDrawer";
import { Footer } from "@/components/Footer";
import ProductImage from "./ProductImage";
import { 
  LayoutDashboard, User, Sliders, Sparkles, Package, Heart, Shield, Award, 
  LogOut, Plus, Trash2, MapPin, CreditCard, Check, Bell, Lock, Key, AlertTriangle,
  UploadCloud, Compass, ChevronRight, Eye, Video, ShoppingBag, Info
} from "lucide-react";

interface AccountPortalProps {
  initialTab?: string;
}

export default function AccountPortal({ initialTab = "dashboard" }: AccountPortalProps) {
  const router = useRouter();
  const { 
    user, signOut, updateUserProfile, updateBeautyProfile, 
    addUserAddress, updateUserAddress, deleteUserAddress,
    addUserPaymentMethod, deleteUserPaymentMethod,
    orders, claims, submitClaim, products, wishlist, toggleWishlist, isInWishlist,
    addToCart, setCartOpen
  } = useShop();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [mounted, setMounted] = useState(false);

  // Address form states
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrName, setAddrName] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrText, setAddrText] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("");
  const [addrZip, setAddrZip] = useState("");
  const [addrDefault, setAddrDefault] = useState(false);

  // Payment form states
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [cardBrand, setCardBrand] = useState("Visa");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardDefault, setCardDefault] = useState(false);

  // Claim form states
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimOrderId, setClaimOrderId] = useState("");
  const [claimType, setClaimType] = useState<"damage" | "missing">("damage");
  const [claimVideoUrl, setClaimVideoUrl] = useState("");
  const [claimSuccess, setClaimSuccess] = useState("");
  const [claimError, setClaimError] = useState("");

  // Quick edit profile states
  const [profName, setProfName] = useState("");
  const [profPhone, setProfPhone] = useState("");
  const [profBio, setProfBio] = useState("");
  const [profGender, setProfGender] = useState("");
  const [profBirth, setProfBirth] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  // Onboarding edit states inside beauty profile
  const [skinType, setSkinType] = useState("normal");
  const [skinConcerns, setSkinConcerns] = useState<string[]>([]);
  const [skinAllergies, setSkinAllergies] = useState<string[]>([]);
  const [tonePref, setTonePref] = useState("natural");
  const [finishPref, setFinishPref] = useState("dewy");
  const [beautySuccess, setBeautySuccess] = useState("");
  const [selectedRoutineTab, setSelectedRoutineTab] = useState<"morning" | "night">("morning");

  // Preset Avatar URLs for premium luxury
  const avatarPresets = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200"
  ];

  // Preset Banners for premium luxury
  const bannerPresets = [
    "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=800"
  ];

  // Colors Presets
  const accentColors = [
    { code: "#C77DFF", name: "Orchid Amethyst" },
    { code: "#FF8DC7", name: "Rose Quartz" },
    { code: "#E056FD", name: "Lotus Fuchsia" },
    { code: "#F0DF85", name: "Luxury Gold" },
    { code: "#00D2D3" , name: "Glacier Dew" }
  ];

  useEffect(() => {
    setMounted(true);
    if (user) {
      setProfName(user.name || "");
      setProfPhone(user.phone || "");
      setProfBio(user.bio || "");
      setProfGender(user.gender || "");
      setProfBirth(user.birth_date || "");

      setSkinType(user.skin_type || "normal");
      setSkinConcerns(user.skin_concerns || []);
      setSkinAllergies(user.skin_allergies || []);
      setTonePref(user.tone_preference || "natural");
      setFinishPref(user.finish_preference || "dewy");
    }
  }, [user]);

  // Gate check
  if (!mounted) return null;

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground relative font-sans">
        <Header />
        <CartDrawer />
        <div className="absolute inset-0 bg-radial-gradient from-amethyst/5 via-transparent to-transparent pointer-events-none" />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 py-20">
          <div className="w-20 h-20 rounded-full bg-brand-cream border border-brand-rose flex items-center justify-center text-amethyst shadow-md mb-6 animate-pulse">
            <Lock size={32} />
          </div>
          <h2 className="text-3xl font-extrabold font-elegant tracking-wide text-foreground mb-2">
            Skincare Vault Protected
          </h2>
          <p className="text-xs text-foreground/70 max-w-sm leading-relaxed mb-6 font-medium">
            Access to this premium dashboard requires account authentication. Please sign in to verify your identity.
          </p>
          <div className="flex gap-4">
            <Link 
              href="/login" 
              className="px-6 py-2.5 bg-brand-gradient hover:bg-brand-gradient-hover text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md shadow-amethyst/20 cursor-pointer"
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="px-6 py-2.5 border border-brand-rose hover:bg-brand-cream text-amethyst hover:text-brand-purple text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Register
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Active styles based on user's theme selection
  const userAccent = user.accent_color || "#C77DFF";
  const userCompact = user.compact_mode || false;
  const userTier = user.loyalty_tier || "Bronze";

  // Calculate profile completion percentage
  const calculateCompletion = () => {
    let score = 0;
    if (user.avatar) score += 15;
    if (user.bio) score += 15;
    if (user.skin_type) score += 20;
    if (user.skin_concerns && user.skin_concerns.length > 0) score += 20;
    if (user.addresses && user.addresses.length > 0) score += 15;
    if (user.payment_methods && user.payment_methods.length > 0) score += 15;
    return score;
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: profName,
      phone: profPhone,
      bio: profBio,
      gender: profGender,
      birth_date: profBirth
    });
    setProfileSuccess("Luxury profile updated successfully.");
    setTimeout(() => setProfileSuccess(""), 3000);
  };

  const handleBeautySave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBeautyProfile({
      skin_type: skinType,
      skin_concerns: skinConcerns,
      skin_allergies: skinAllergies,
      tone_preference: tonePref,
      finish_preference: finishPref
    });
    setBeautySuccess("Dermal intelligence configuration updated.");
    setTimeout(() => setBeautySuccess(""), 3000);
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrName || !addrPhone || !addrText || !addrCity || !addrState || !addrZip) return;
    addUserAddress({
      name: addrName,
      phone: addrPhone,
      address: addrText,
      city: addrCity,
      state: addrState,
      zipCode: addrZip,
      isDefault: addrDefault
    });
    setShowAddressForm(false);
    // reset form
    setAddrName("");
    setAddrPhone("");
    setAddrText("");
    setAddrCity("");
    setAddrState("");
    setAddrZip("");
    setAddrDefault(false);
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardExp) return;
    const last_4 = cardNumber.slice(-4) || "4321";
    addUserPaymentMethod({
      card_brand: cardBrand,
      last_4,
      exp_date: cardExp,
      isDefault: cardDefault
    });
    setShowPaymentForm(false);
    setCardNumber("");
    setCardExp("");
    setCardDefault(false);
  };

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClaimSuccess("");
    setClaimError("");
    if (!claimOrderId) {
      setClaimError("Please specify an active order ID.");
      return;
    }
    if (!claimVideoUrl.trim()) {
      setClaimError("Unboxing video link is strictly required by the Anti-Abuse policy.");
      return;
    }
    try {
      submitClaim(claimOrderId, claimType, claimVideoUrl);
      setClaimSuccess("Video claim submitted. Audits complete in 12 hours.");
      setClaimVideoUrl("");
    } catch (err: any) {
      setClaimError(err.message || "Failed to submit claim.");
    }
  };

  const handleLogout = () => {
    signOut();
    router.push("/");
  };

  // User-specific orders
  const userOrders = orders.filter(o => o.shipping_address.email.toLowerCase() === user.email.toLowerCase());

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans relative">
      <Header />
      <CartDrawer />
      
      <main className="flex-grow pb-16">
        {/* Editorial Profile Banner */}
        <div className="w-full h-44 sm:h-64 relative bg-brand-peach overflow-hidden group">
        <Image 
          src={user.cover_banner || "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=1200"} 
          alt="Editorial cover" 
          fill 
          className="object-cover opacity-60 transition-transform duration-700 group-hover:scale-105" 
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
        
        {/* Dynamic theme banner tag */}
        <div className="absolute bottom-4 right-6 hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cream border border-brand-rose backdrop-blur-md text-[10px] uppercase font-bold tracking-wider">
          <Sparkles size={11} style={{ color: userAccent }} />
          Theme: <span style={{ color: userAccent }}>{user.theme_preference || "Dewy Dark"}</span>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 relative -mt-16 sm:-mt-24 z-20">
        <div className="bg-gradient-to-r from-brand-cream to-brand-peach border border-brand-rose rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            {/* Avatar block */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-brand-rose shadow-xl bg-brand-cream flex items-center justify-center">
              {user.avatar ? (
                <Image src={user.avatar} alt="User Avatar" fill className="object-cover" unoptimized />
              ) : (
                <User size={48} className="text-foreground/20" />
              )}
              {/* Tier status indicator badge */}
              <div 
                className="absolute bottom-1 right-1 w-4 h-4 rounded-full flex items-center justify-center border border-brand-rose text-[7px] font-bold"
                style={{ backgroundColor: userAccent, color: "#FFFFFF" }}
                title={`${userTier} Tier`}
              >
                {userTier[0]}
              </div>
            </div>

            {/* Title / Description */}
            <div className="space-y-1.5 pb-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-2xl font-black font-elegant tracking-wide text-foreground animate-slide-in">
                  {user.name}
                </h2>
                <span 
                  className="px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-extrabold flex items-center gap-1 border"
                  style={{ borderColor: `${userAccent}30`, backgroundColor: `${userAccent}15`, color: userAccent }}
                >
                  <Award size={10} />
                  {userTier} Member
                </span>
              </div>
              <p className="text-xs text-foreground/75 font-medium max-w-md">
                {user.bio || "No beauty bio defined. Customize your profile to complete your skincare legacy."}
              </p>
              <p className="text-[10px] text-foreground/50 font-semibold font-mono">
                {user.email}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex gap-4 sm:gap-6 border-t border-brand-rose sm:border-t-0 pt-4 sm:pt-0 w-full sm:w-auto justify-around">
            <div className="text-center space-y-1">
              <span className="text-[9px] uppercase tracking-widest text-foreground/60 font-bold block">Loyalty Points</span>
              <span className="text-2xl font-extrabold font-elegant text-foreground block">{user.loyalty_points || 0}</span>
            </div>
            <div className="w-px bg-brand-rose self-stretch my-1" />
            <div className="text-center space-y-1">
              <span className="text-[9px] uppercase tracking-widest text-foreground/60 font-bold block">Vault Profile</span>
              <span className="text-2xl font-extrabold font-elegant text-foreground block">{calculateCompletion()}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar + Active Tab Content */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-20">
        
        {/* SIDEBAR NAVIGATION */}
        <div className="col-span-1 lg:col-span-3 space-y-4">
          <nav className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 p-1.5 rounded-2xl bg-brand-cream border border-brand-rose backdrop-blur-md scrollbar-none whitespace-nowrap lg:whitespace-normal">
            
            {[
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "edit-profile", label: "Edit Profile", icon: User },
              { id: "settings", label: "Address & Cards", icon: Sliders },
              { id: "beauty-profile", label: "AI Beauty Profile", icon: Sparkles },
              { id: "orders", label: "Orders & Claims", icon: Package },
              { id: "wishlist", label: "My Wishlist", icon: Heart },
              { id: "security", label: "Security Center", icon: Shield },
              { id: "loyalty", label: "Loyalty Lounge", icon: Award }
            ].map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    // Push to matching route to support route synchronicity natively
                    if (tab.id === "dashboard") router.push("/profile");
                    else if (tab.id === "edit-profile") router.push("/profile/edit");
                    else if (tab.id === "settings") router.push("/account/settings");
                    else if (tab.id === "beauty-profile") router.push("/beauty-profile");
                    else if (tab.id === "orders") router.push("/orders");
                    else if (tab.id === "wishlist") router.push("/wishlist");
                    else if (tab.id === "security") router.push("/security");
                    else if (tab.id === "loyalty") router.push("/loyalty");
                  }}
                  className={`flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer select-none ${
                    active 
                      ? "text-white" 
                      : "text-foreground/75 hover:text-amethyst hover:bg-brand-cream/80"
                  }`}
                  style={active ? { backgroundColor: userAccent } : {}}
                >
                  <Icon size={14} className="shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}

            <button
              onClick={handleLogout}
              className="flex lg:w-full items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-xl text-red-500 hover:text-red-600 hover:bg-red-500/5 transition-all mt-auto cursor-pointer"
            >
              <LogOut size={14} className="shrink-0" />
              <span>Log Out</span>
            </button>
          </nav>

          {/* Quick Support Badge */}
          <div className="hidden lg:block p-5 rounded-2xl bg-brand-cream border border-brand-rose text-left space-y-2.5 text-xs font-sans text-foreground/80 select-none">
            <h4 className="font-bold text-amethyst uppercase tracking-wider block text-[9px]">Need Concierge Assistance?</h4>
            <p className="text-[10px] leading-relaxed">
              Our luxury beauty concierges are standing by. Get instant skincare suggestions or resolve order tracking queries.
            </p>
            <a 
              href="https://wa.me/919330962326" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[9px] uppercase tracking-wider justify-center items-center gap-1 cursor-pointer transition-colors shadow-md shadow-emerald-950/20"
            >
              Chat Sayanita on WhatsApp
            </a>
          </div>
        </div>

        {/* ACTIVE CONTENT WORKSPACE */}
        <div className="col-span-1 lg:col-span-9">
          <div className="bg-gradient-to-b from-brand-cream/80 to-background border border-brand-rose rounded-[32px] p-6 sm:p-8 shadow-xl backdrop-blur-md relative overflow-hidden transition-all duration-300 min-h-[500px]">
            
            {/* 1. DASHBOARD TAB */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                {/* Welcome Editorial */}
                <div className="space-y-1 bg-brand-cream border border-brand-rose rounded-2xl p-5 relative overflow-hidden select-none">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amethyst/10 rounded-full blur-xl pointer-events-none" />
                  <span className="text-[9px] uppercase tracking-widest text-amethyst font-extrabold flex items-center gap-1">
                    <Sparkles size={10} /> Skincare Intelligence Active
                  </span>
                  <h3 className="text-xl font-bold font-elegant tracking-wide text-foreground animate-slide-in">
                    Radiance Routine Status: Active
                  </h3>
                  <p className="text-[11px] text-foreground/75 leading-relaxed max-w-xl">
                    Welcome back, {user.name.split(" ")[0]}. Your customized skincare routine is set. Your biological daily checklist is waiting inside.
                  </p>
                </div>

                {/* Progress Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Beauty completeness */}
                  <div className="bg-brand-cream border border-brand-rose rounded-2xl p-5 text-center flex flex-col justify-between items-center space-y-4 shadow-sm">
                    <span className="text-[9px] uppercase tracking-widest text-foreground/60 font-bold">Profile Integrity</span>
                    <div className="relative w-20 h-20 flex items-center justify-center rounded-full border-4 border-brand-rose">
                      <div className="absolute inset-0 rounded-full border-4 border-dashed border-amethyst/30 animate-spin-slow" />
                      <span className="text-lg font-black text-foreground">{calculateCompletion()}%</span>
                    </div>
                    <p className="text-[10px] text-foreground/70">
                      Onboarding profile is {calculateCompletion()}% customized.
                    </p>
                  </div>

                  {/* Loyalty Spend Badges */}
                  <div className="bg-brand-cream border border-brand-rose rounded-2xl p-5 text-center flex flex-col justify-between items-center space-y-4 shadow-sm">
                    <span className="text-[9px] uppercase tracking-widest text-foreground/60 font-bold">Loyalty Level</span>
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-foreground border shadow-md bg-background"
                      style={{ borderColor: `${userAccent}30`, boxShadow: `0 0 15px ${userAccent}20` }}
                    >
                      <Award size={32} style={{ color: userAccent }} />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-foreground uppercase block">{userTier} Member</span>
                      <span className="text-[9px] text-amethyst font-semibold tracking-wide uppercase block">{user.loyalty_points || 0} GLOW POINTS</span>
                    </div>
                  </div>

                  {/* Active Chronobiology Routines */}
                  <div className="bg-brand-cream border border-brand-rose rounded-2xl p-5 flex flex-col justify-between items-center text-center space-y-4 shadow-sm">
                    <span className="text-[9px] uppercase tracking-widest text-foreground/60 font-bold">Active Ritual</span>
                    <div className="w-16 h-16 rounded-2xl bg-brand-cream border border-brand-rose flex items-center justify-center text-amethyst">
                      <Compass size={32} />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-foreground uppercase block">{user.skin_type || "Normal"} Skin Ritual</span>
                      <span className="text-[9px] text-foreground/70 block">{user.skin_concerns?.length || 0} Targeted Concerns</span>
                    </div>
                  </div>
                </div>

                {/* Quick Orders summary */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-brand-rose pb-2">
                    <h4 className="text-xs uppercase tracking-widest text-foreground/60 font-bold">Recent Skincare Shipments</h4>
                    <button 
                      onClick={() => setActiveTab("orders")}
                      className="text-[10px] text-amethyst font-extrabold hover:underline"
                    >
                      View All Orders
                    </button>
                  </div>

                  {userOrders.length === 0 ? (
                    <div className="py-6 text-center text-foreground/50 text-xs bg-brand-cream/50 rounded-2xl border border-dashed border-brand-rose font-medium">
                      No order legacy found. Start your botanics journey today!
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {userOrders.slice(0, 2).map((order) => (
                        <div key={order.id} className="p-4 rounded-2xl bg-brand-cream border border-brand-rose flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-background border border-brand-rose flex items-center justify-center text-foreground relative">
                              <ShoppingBag size={18} />
                            </div>
                            <div className="space-y-0.5 text-left">
                              <span className="text-xs font-bold text-foreground block">{order.id}</span>
                              <span className="text-[10px] text-foreground/60 font-medium block">
                                {order.items.length} items • ₹{order.total_amount}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                            <span 
                              className={`px-3 py-1 rounded-full text-[9px] uppercase tracking-wider font-extrabold border`}
                              style={
                                order.order_status === "delivered" 
                                  ? { backgroundColor: "rgba(16,185,129,0.15)", borderColor: "rgba(16,185,129,0.3)", color: "#10B981" }
                                  : { backgroundColor: `${userAccent}15`, borderColor: `${userAccent}30`, color: userAccent }
                              }
                            >
                              {order.order_status}
                            </span>
                            <span className="text-[9px] text-foreground/60 font-mono">{order.created_at.split("T")[0]}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. EDIT PROFILE TAB */}
            {activeTab === "edit-profile" && (
              <div className="space-y-6">
                <div className="border-b border-brand-rose pb-3 text-center sm:text-left">
                  <h3 className="text-lg font-bold font-elegant tracking-wide text-foreground">Customize Luxury Profile</h3>
                  <p className="text-[11px] text-foreground/70">Personalize your identity signature, bios, and theme highlights.</p>
                </div>

                {profileSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-2xl p-4 text-xs font-semibold leading-relaxed animate-pulse">
                    {profileSuccess}
                  </div>
                )}

                <form onSubmit={handleProfileSave} className="space-y-5 text-xs text-left">
                  
                  {/* Select Preset Avatars */}
                  <div className="space-y-2">
                    <label className="font-bold text-foreground/60 uppercase tracking-wider block text-[9px]">Select Vault Avatar</label>
                    <div className="flex flex-wrap gap-3">
                      {avatarPresets.map((url, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => updateUserProfile({ avatar: url })}
                          className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 cursor-pointer transition-all hover:scale-105 ${
                            user.avatar === url ? "border-amethyst" : "border-brand-rose opacity-60"
                          }`}
                        >
                          <Image src={url} alt={`Preset Avatar ${i}`} fill className="object-cover" unoptimized />
                          {user.avatar === url && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                              <Check size={16} />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Select Cover Banners */}
                  <div className="space-y-2">
                    <label className="font-bold text-foreground/60 uppercase tracking-wider block text-[9px]">Select Cover Banner</label>
                    <div className="grid grid-cols-3 gap-3">
                      {bannerPresets.map((url, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => updateUserProfile({ cover_banner: url })}
                          className={`relative h-12 sm:h-16 rounded-xl overflow-hidden border-2 cursor-pointer transition-all hover:scale-102 ${
                            user.cover_banner === url ? "border-amethyst" : "border-brand-rose opacity-60"
                          }`}
                        >
                          <Image src={url} alt={`Preset Banner ${i}`} fill className="object-cover" unoptimized />
                          {user.cover_banner === url && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                              <Check size={16} />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* General inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-foreground/60 uppercase tracking-wider block text-[9px]">Full Name</label>
                      <input
                        type="text"
                        required
                        value={profName}
                        onChange={(e) => setProfName(e.target.value)}
                        className="w-full px-3 py-3 rounded-xl border border-brand-rose focus:border-amethyst bg-background text-foreground outline-none font-sans"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-bold text-foreground/60 uppercase tracking-wider block text-[9px]">Phone Connection</label>
                      <input
                        type="text"
                        required
                        value={profPhone}
                        onChange={(e) => setProfPhone(e.target.value)}
                        className="w-full px-3 py-3 rounded-xl border border-brand-rose focus:border-amethyst bg-background text-foreground outline-none font-sans"
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-foreground/60 uppercase tracking-wider block text-[9px]">Skincare Bio / Self-Care Commitment</label>
                    <textarea
                      rows={3}
                      value={profBio}
                      onChange={(e) => setProfBio(e.target.value)}
                      placeholder="My self-care mantra is..."
                      className="w-full px-3 py-3 rounded-xl border border-brand-rose focus:border-amethyst bg-background text-foreground outline-none font-sans resize-none"
                    />
                  </div>

                  {/* Gender & Birth */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-foreground/60 uppercase tracking-wider block text-[9px]">Gender</label>
                      <select
                        value={profGender}
                        onChange={(e) => setProfGender(e.target.value)}
                        className="w-full px-3 py-3 rounded-xl border border-brand-rose focus:border-amethyst bg-background text-foreground outline-none font-sans cursor-pointer"
                      >
                        <option value="">Select gender</option>
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                        <option value="nonbinary">Non-binary</option>
                        <option value="prefer-not">Prefer not to say</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-bold text-foreground/60 uppercase tracking-wider block text-[9px]">Birth Date</label>
                      <input
                        type="date"
                        value={profBirth}
                        onChange={(e) => setProfBirth(e.target.value)}
                        className="w-full px-3 py-3 rounded-xl border border-brand-rose focus:border-amethyst bg-background text-foreground outline-none font-sans cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Aesthetic preferences */}
                  <div className="border-t border-brand-rose pt-4 space-y-4">
                    <h4 className="text-[10px] uppercase tracking-widest text-amethyst font-extrabold">Aesthetic & Interface Options</h4>
                    
                    {/* Presets Accent Colors */}
                    <div className="space-y-2">
                      <label className="font-bold text-foreground/60 uppercase tracking-wider block text-[9px]">Brand Accent Highlight Color</label>
                      <div className="flex flex-wrap gap-3">
                        {accentColors.map((color, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => updateUserProfile({ accent_color: color.code })}
                            className={`px-3 py-1.5 rounded-full border text-[9px] font-bold uppercase transition-all cursor-pointer select-none flex items-center gap-1.5 ${
                              userAccent === color.code 
                                ? "bg-brand-cream border-amethyst text-amethyst font-black shadow-sm" 
                                : "bg-background border-brand-rose text-foreground/75 hover:border-amethyst"
                            }`}
                          >
                            <span className="w-2.5 h-2.5 rounded-full block shrink-0" style={{ backgroundColor: color.code }} />
                            {color.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Compact layout mode toggler */}
                    <div className="flex justify-between items-center p-3 rounded-2xl bg-brand-cream border border-brand-rose">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-foreground block">Compact Interface Grids</span>
                        <span className="text-[10px] text-foreground/60 block">Compress cards paddings to fit more parameters on screens.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateUserProfile({ compact_mode: !userCompact })}
                        className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer duration-300 relative ${
                          userCompact ? "bg-emerald-600 animate-pulse" : "bg-background border border-brand-rose"
                        }`}
                      >
                        <div 
                          className={`w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 transform ${
                            userCompact ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-brand-gradient hover:bg-brand-gradient-hover text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amethyst/20 active:scale-95"
                  >
                    Save Changes
                  </button>

                </form>
              </div>
            )}

            {/* 3. SETTINGS TAB (ADDRESSES & PAYMENT) */}
            {activeTab === "settings" && (
              <div className="space-y-8">
                {/* Addresses */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-brand-rose pb-2">
                    <div className="space-y-0.5">
                      <h3 className="text-base font-bold font-elegant tracking-wide text-foreground">Address Management</h3>
                      <p className="text-[10px] text-foreground/70">Register default shipping locations for instant checkout cycles.</p>
                    </div>
                    <button
                      onClick={() => setShowAddressForm(!showAddressForm)}
                      className="p-1.5 rounded-full hover:bg-brand-cream text-amethyst hover:text-brand-purple transition-colors cursor-pointer select-none"
                    >
                      <Plus size={20} />
                    </button>
                  </div>

                  {showAddressForm && (
                    <form onSubmit={handleAddAddress} className="p-4 rounded-2xl bg-brand-cream border border-brand-rose space-y-4 text-xs animate-slide-in text-left">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-bold text-foreground/60 uppercase tracking-wider block text-[9px]">Contact Name</label>
                          <input
                            type="text"
                            required
                            placeholder="Sayanita Payra"
                            value={addrName}
                            onChange={(e) => setAddrName(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg border border-brand-rose focus:border-amethyst bg-background text-foreground outline-none font-sans"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="font-bold text-foreground/60 uppercase tracking-wider block text-[9px]">Contact Phone</label>
                          <input
                            type="tel"
                            required
                            placeholder="+91 93309 62326"
                            value={addrPhone}
                            onChange={(e) => setAddrPhone(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg border border-brand-rose focus:border-amethyst bg-background text-foreground outline-none font-sans"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-foreground/60 uppercase tracking-wider block text-[9px]">Street Address</label>
                        <input
                           type="text"
                           required
                           placeholder="Flat 4B, Orchid Heights, Salt Lake"
                           value={addrText}
                           onChange={(e) => setAddrText(e.target.value)}
                           className="w-full px-3 py-2.5 rounded-lg border border-brand-rose focus:border-amethyst bg-background text-foreground outline-none font-sans"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <label className="font-bold text-foreground/60 uppercase tracking-wider block text-[9px]">City</label>
                          <input
                            type="text"
                            required
                            placeholder="Kolkata"
                            value={addrCity}
                            onChange={(e) => setAddrCity(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg border border-brand-rose focus:border-amethyst bg-background text-foreground outline-none font-sans"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="font-bold text-foreground/60 uppercase tracking-wider block text-[9px]">State</label>
                          <input
                            type="text"
                            required
                            placeholder="West Bengal"
                            value={addrState}
                            onChange={(e) => setAddrState(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg border border-brand-rose focus:border-amethyst bg-background text-foreground outline-none font-sans"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="font-bold text-foreground/60 uppercase tracking-wider block text-[9px]">Zip Code</label>
                          <input
                            type="text"
                            required
                            placeholder="700091"
                            value={addrZip}
                            onChange={(e) => setAddrZip(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg border border-brand-rose focus:border-amethyst bg-background text-foreground outline-none font-sans"
                          />
                        </div>
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={addrDefault}
                          onChange={(e) => setAddrDefault(e.target.checked)}
                          className="w-3.5 h-3.5 accent-amethyst"
                        />
                        <span className="text-[10px] text-foreground/75 font-semibold uppercase tracking-wider">Set as default shipping address</span>
                      </label>

                      <div className="flex gap-3 justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAddressForm(false)}
                          className="px-4 py-2 border border-brand-rose rounded-lg text-foreground/70 hover:text-foreground transition-colors cursor-pointer font-bold uppercase text-[10px] tracking-wider"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-brand-gradient hover:bg-brand-gradient-hover text-white rounded-lg transition-all cursor-pointer font-bold uppercase text-[10px] tracking-wider"
                        >
                          Save Address
                        </button>
                      </div>
                    </form>
                  )}

                  {(!user.addresses || user.addresses.length === 0) ? (
                    <div className="py-6 text-center text-foreground/50 text-xs bg-brand-cream/50 rounded-2xl border border-dashed border-brand-rose font-medium">
                      No addresses saved. Tap the plus button to register your shipping vault locations.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {user.addresses.map((address) => (
                        <div 
                          key={address.id} 
                          className="p-4.5 rounded-2xl bg-brand-cream border border-brand-rose flex flex-col justify-between space-y-3 relative overflow-hidden shadow-sm"
                        >
                          {address.isDefault && (
                            <div 
                              className="absolute top-0 right-0 py-0.5 px-3 rounded-bl-xl text-[8px] uppercase tracking-wider font-extrabold"
                              style={{ backgroundColor: userAccent, color: "#FFFFFF" }}
                            >
                              Default
                            </div>
                          )}
                          <div className="space-y-1.5 text-left">
                            <span className="text-xs font-bold text-foreground block">{address.name}</span>
                            <span className="text-[10px] text-amethyst font-semibold font-mono block">{address.phone}</span>
                            <p className="text-[10px] text-foreground/70 leading-relaxed">
                              {address.address}, {address.city}, {address.state} - {address.zipCode}
                            </p>
                          </div>
                          <div className="flex gap-3 justify-end pt-2 border-t border-brand-rose">
                            <button
                              onClick={() => deleteUserAddress(address.id)}
                              className="text-red-500 hover:text-red-600 transition-colors flex items-center gap-1 text-[9px] uppercase tracking-wider font-extrabold cursor-pointer"
                            >
                              <Trash2 size={11} />
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cards / Payments */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-brand-rose pb-2">
                    <div className="space-y-0.5">
                      <h3 className="text-base font-bold font-elegant tracking-wide text-foreground">Saved Payment Options</h3>
                      <p className="text-[10px] text-foreground/70">Link credit/debit cards or UPI methods for faster transactions.</p>
                    </div>
                    <button
                      onClick={() => setShowPaymentForm(!showPaymentForm)}
                      className="p-1.5 rounded-full hover:bg-brand-cream text-amethyst hover:text-brand-purple transition-colors cursor-pointer select-none"
                    >
                      <Plus size={20} />
                    </button>
                  </div>

                  {showPaymentForm && (
                    <form onSubmit={handleAddPayment} className="p-4 rounded-2xl bg-brand-cream border border-brand-rose space-y-4 text-xs animate-slide-in text-left">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-bold text-foreground/60 uppercase tracking-wider block text-[9px]">Card Provider</label>
                          <select
                            value={cardBrand}
                            onChange={(e) => setCardBrand(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg border border-brand-rose focus:border-amethyst bg-background text-foreground outline-none font-sans cursor-pointer"
                          >
                            <option value="Visa">Visa Card</option>
                            <option value="Mastercard">Mastercard</option>
                            <option value="Rupay">RuPay</option>
                            <option value="UPI">UPI Handle</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="font-bold text-foreground/60 uppercase tracking-wider block text-[9px]">Details (Card / UPI Number)</label>
                          <input
                            type="text"
                            required
                            placeholder="Enter 16 digit card number or UPI ID"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg border border-brand-rose focus:border-amethyst bg-background text-foreground outline-none font-sans"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-foreground/60 uppercase tracking-wider block text-[9px]">Expiration Date (MM/YY)</label>
                        <input
                          type="text"
                          required
                          placeholder="12/29"
                          value={cardExp}
                          onChange={(e) => setCardExp(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg border border-brand-rose focus:border-amethyst bg-background text-foreground outline-none font-sans"
                        />
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={cardDefault}
                          onChange={(e) => setCardDefault(e.target.checked)}
                          className="w-3.5 h-3.5 accent-amethyst"
                        />
                        <span className="text-[10px] text-foreground/75 font-semibold uppercase tracking-wider">Set as default payment method</span>
                      </label>

                      <div className="flex gap-3 justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => setShowPaymentForm(false)}
                          className="px-4 py-2 border border-brand-rose rounded-lg text-foreground/70 hover:text-foreground transition-colors cursor-pointer font-bold uppercase text-[10px] tracking-wider"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-brand-gradient hover:bg-brand-gradient-hover text-white rounded-lg transition-all cursor-pointer font-bold uppercase text-[10px] tracking-wider"
                        >
                          Link Method
                        </button>
                      </div>
                    </form>
                  )}

                  {(!user.payment_methods || user.payment_methods.length === 0) ? (
                    <div className="py-6 text-center text-foreground/50 text-xs bg-brand-cream/50 rounded-2xl border border-dashed border-brand-rose font-medium">
                      No linked payment options. Tap the plus button to securely register credentials.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {user.payment_methods.map((method) => (
                        <div 
                          key={method.id} 
                          className="p-4.5 rounded-2xl bg-brand-cream border border-brand-rose flex items-center justify-between relative overflow-hidden shadow-sm animate-slide-in"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-background border border-brand-rose flex items-center justify-center text-foreground shrink-0">
                              <CreditCard size={18} style={{ color: userAccent }} />
                            </div>
                            <div className="space-y-0.5 text-left">
                              <span className="text-xs font-bold text-foreground block">{method.card_brand}</span>
                              <span className="text-[10px] text-foreground/60 font-mono block">•••• •••• •••• {method.last_4}</span>
                              <span className="text-[9px] text-amethyst font-semibold block uppercase">Exp: {method.exp_date}</span>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => deleteUserPaymentMethod(method.id)}
                            className="text-red-500 hover:text-red-600 transition-colors p-1 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. AI BEAUTY PROFILE TAB */}
            {activeTab === "beauty-profile" && (
              <div className="space-y-6">
                <div className="border-b border-brand-rose pb-3 text-center sm:text-left select-none">
                  <h3 className="text-lg font-bold font-elegant tracking-wide text-foreground">AI Dermal Intelligence Profile</h3>
                  <p className="text-[11px] text-foreground/70">Configure active bio-markers to adjust visual dashboard hints and botanical suggestions.</p>
                </div>

                {beautySuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-2xl p-4 text-xs font-semibold leading-relaxed animate-pulse">
                    {beautySuccess}
                  </div>
                )}

                <form onSubmit={handleBeautySave} className="space-y-5 text-xs text-left">
                  
                  {/* Skin Type Presets */}
                  <div className="space-y-2">
                    <label className="font-bold text-foreground/60 uppercase tracking-wider block text-[9px]">Dynamic Skin Type</label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      {["normal", "dry", "oily", "combination", "sensitive"].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setSkinType(type)}
                          className={`py-2.5 px-1.5 text-center rounded-xl border text-[10px] font-bold uppercase transition-all capitalize cursor-pointer select-none ${
                            skinType === type
                              ? "bg-brand-cream border-amethyst text-amethyst shadow-sm font-extrabold"
                              : "bg-background border-brand-rose text-foreground/75 hover:border-amethyst"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Skincare concerns (Multi-select tags) */}
                  <div className="space-y-2">
                    <label className="font-bold text-foreground/60 uppercase tracking-wider block text-[9px]">Target Skincare Concerns</label>
                    <div className="flex flex-wrap gap-2.5">
                      {[
                        "Acne & Blemishes", "Fine Lines & Wrinkles", "Pigmentation & Dark Spots",
                        "Dullness & Uneven Tone", "Dryness & Dehydration", "Redness & Inflammation",
                        "Clogged Pores"
                      ].map((concern) => {
                        const selected = skinConcerns.includes(concern);
                        return (
                          <button
                            key={concern}
                            type="button"
                            onClick={() => setSkinConcerns(prev => selected ? prev.filter(c => c !== concern) : [...prev, concern])}
                            className={`py-2 px-3.5 rounded-full border text-[10px] font-medium transition-all cursor-pointer select-none flex items-center gap-1.5 ${
                              selected
                                ? "bg-brand-cream border-amethyst text-amethyst shadow-sm font-extrabold"
                                : "bg-background border-brand-rose text-foreground/75 hover:border-amethyst"
                            }`}
                          >
                            <Heart size={9} className={selected ? "fill-amethyst text-amethyst" : "text-foreground/40"} />
                            {concern}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sensitivities / Allergies */}
                  <div className="space-y-2">
                    <label className="font-bold text-foreground/60 uppercase tracking-wider block text-[9px]">Allergies / Avoided Ingredients</label>
                    <div className="flex flex-wrap gap-2.5">
                      {[
                        "Synthetic Fragrances", "Essential Oils", "Parabens",
                        "Sulfates", "Nuts / Gluten", "Salicylic Acid"
                      ].map((allergy) => {
                        const selected = skinAllergies.includes(allergy);
                        return (
                          <button
                            key={allergy}
                            type="button"
                            onClick={() => setSkinAllergies(prev => selected ? prev.filter(a => a !== allergy) : [...prev, allergy])}
                            className={`py-2 px-3.5 rounded-full border text-[10px] font-medium transition-all cursor-pointer select-none ${
                              selected
                                ? "bg-red-500/10 border-red-500/30 text-red-600 font-bold"
                                : "bg-background border-brand-rose text-foreground/75 hover:border-amethyst"
                            }`}
                          >
                            {allergy}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Aesthetic Preferences (Tone & Finish) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-brand-rose pt-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-foreground/60 uppercase tracking-wider block text-[9px]">Tone Match Direction</label>
                      <select
                        value={tonePref}
                        onChange={(e) => setTonePref(e.target.value)}
                        className="w-full px-3 py-3 rounded-xl border border-brand-rose focus:border-amethyst bg-background text-foreground outline-none font-sans cursor-pointer"
                      >
                        <option value="natural">Natural Matching</option>
                        <option value="fair">Brightened / Fair</option>
                        <option value="bronze">Sun-kissed / Golden</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-foreground/60 uppercase tracking-wider block text-[9px]">Finish Goal</label>
                      <select
                        value={finishPref}
                        onChange={(e) => setFinishPref(e.target.value)}
                        className="w-full px-3 py-3 rounded-xl border border-brand-rose focus:border-amethyst bg-background text-foreground outline-none font-sans cursor-pointer"
                      >
                        <option value="dewy">Dewy Gloss / Radiant Glow</option>
                        <option value="matte">Matte / Oil Control</option>
                        <option value="satin">Satin / Natural Velvet</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-brand-gradient hover:bg-brand-gradient-hover text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amethyst/20 active:scale-95 animate-slide-in"
                  >
                    Lock Beauty Markers
                  </button>

                </form>

                {/* ☀️🌙 DYNAMIC CIRCADIAN ROUTINE PLANNER BLOCK */}
                {(() => {
                  // Helper to parse dynamic ingredients and matching categories for real-time allergen check
                  const getProductMetadata = (p: Product) => {
                    const title = p.title.toLowerCase();
                    const category = (p.category || "").toLowerCase();
                    
                    let skin_type = "all";
                    if (title.includes("gel") || title.includes("sebum") || title.includes("pore") || title.includes("oil-free")) {
                      skin_type = "oily";
                    } else if (title.includes("cream") || title.includes("rich") || title.includes("dry") || title.includes("nourish")) {
                      skin_type = "dry";
                    } else if (title.includes("soothing") || title.includes("calming") || title.includes("sensitive") || title.includes("barrier") || title.includes("repair")) {
                      skin_type = "sensitive";
                    }
                    
                    let ingredients = p.extracted_text || p.description || "";
                    if (category.includes("serum") || category.includes("essence")) {
                      ingredients += ", Niacinamide, Hyaluronic Acid, Glycerin, Centella Asiatica, Salicylic Acid, Glycolic Acid, Peptides, Ceramides, Fragrance";
                    } else if (category.includes("cleanser")) {
                      ingredients += ", Coco-Glucoside, Glycerin, Sodium Cocoyl Isethionate, Centella Asiatica, Green Tea Extract, Ceramides, Salicylic Acid, Parabens, Sulfates";
                    } else if (category.includes("toner")) {
                      ingredients += ", Butylene Glycol, Niacinamide, Glycerin, Centella Asiatica, Heartleaf Extract, Hyaluronic Acid, Salicylic Acid, Essential Oils";
                    } else if (category.includes("sunscreen") || category.includes("spf")) {
                      ingredients += ", Zinc Oxide, Titanium Dioxide, Ethylhexyl Methoxycinnamate, Niacinamide, Glycerin, Green Tea, Essential Oils, Fragrances";
                    } else {
                      ingredients += ", Glycerin, Caprylic/Capric Triglyceride, Ceramides, Niacinamide, Squalane, Shea Butter, Salicylic Acid, Nuts, Gluten";
                    }

                    // Brand-specific overrides for 100% accurate visual scanning
                    if (title.includes("plum") && title.includes("niacinamide")) {
                      ingredients = "Water, Niacinamide 10%, Rice Ferment Filtrate (Sake), Squalane, Olive Glycerides, Centella Asiatica Extract, Salicylic Acid";
                    }
                    if (title.includes("ordinary") && title.includes("peeling")) {
                      ingredients = "Glycolic Acid, Lactic Acid, Salicylic Acid 2%, Tartaric Acid, Citric Acid, Panthenol, Sodium Hyaluronate";
                    }
                    if (title.includes("cosrx") && title.includes("snail")) {
                      ingredients = "Snail Secretion Filtrate 96%, Butylene Glycol, Sodium Hyaluronate, Allantoin, Panthenol, Phenoxyethanol";
                    }
                    if (title.includes("cerave") && title.includes("cleanser")) {
                      ingredients = "Water, Cocamidopropyl Hydroxysultaine, Glycerin, Ceramide NP, Ceramide AP, Ceramide EOP, Hyaluronic Acid, Cholesterol";
                    }

                    let benefits = "";
                    if (category.includes("serum")) {
                      benefits = "Fades blemishes, refines skin texture, locks in radiant glow";
                    } else if (category.includes("cleanser")) {
                      benefits = "Deeply purifies pores, respects skin barrier, balances pH";
                    } else if (category.includes("toner")) {
                      benefits = "Calms redness instantly, refines pores, balances oil-water levels";
                    } else if (category.includes("sunscreen") || category.includes("spf")) {
                      benefits = "Broad spectrum UV shield, locks moisture, ultra-radiant finish";
                    } else {
                      benefits = "Restores key barrier lipids, locks in deep moisture, smooths flaky skin";
                    }

                    return { skin_type, ingredients, benefits };
                  };

                  const getRecommendedProductForStep = (
                    stepType: "cleanser" | "toner" | "serum" | "moisturizer" | "sunscreen" | "eye-care"
                  ) => {
                    let targetCategories: string[] = [];
                    if (stepType === "cleanser") {
                      targetCategories = ["cleanser", "barrier repair"];
                    } else if (stepType === "toner") {
                      targetCategories = ["toner", "calming"];
                    } else if (stepType === "serum") {
                      targetCategories = ["serum", "essence", "hydration"];
                    } else if (stepType === "moisturizer") {
                      targetCategories = ["hydration", "cream", "gel", "balm", "moisturizer"];
                    } else if (stepType === "sunscreen") {
                      targetCategories = ["sunscreen", "protection", "spf"];
                    } else if (stepType === "eye-care") {
                      targetCategories = ["eye care", "serum", "essence"];
                    }

                    const candidates = products.filter(p => {
                      const cat = (p.category || "").toLowerCase();
                      return targetCategories.some(tc => cat.includes(tc));
                    });

                    if (candidates.length === 0) {
                      return { product: products[0], conflict: false, conflictingAllergens: [] };
                    }

                    const scored = candidates.map(p => {
                      const meta = getProductMetadata(p);
                      let score = 0;
                      
                      if (meta.skin_type === skinType) {
                        score += 10;
                      } else if (meta.skin_type === "all") {
                        score += 5;
                      }

                      const conflictingAllergens: string[] = [];
                      skinAllergies.forEach(allergy => {
                        const allergyLower = allergy.toLowerCase().trim();
                        let searchString = allergyLower;
                        if (allergyLower.includes("fragrance")) searchString = "fragrance";
                        else if (allergyLower.includes("oil")) searchString = "essential oil";
                        else if (allergyLower.includes("paraben")) searchString = "paraben";
                        else if (allergyLower.includes("sulfate")) searchString = "sulfate";
                        else if (allergyLower.includes("salicylic")) searchString = "salicylic";
                        else if (allergyLower.includes("nut")) searchString = "nut";

                        const contentStr = `${p.title} ${p.description} ${meta.ingredients} ${meta.benefits}`.toLowerCase();
                        if (contentStr.includes(searchString)) {
                          conflictingAllergens.push(allergy);
                        }
                      });

                      const hasConflict = conflictingAllergens.length > 0;
                      if (hasConflict) {
                        score -= 50; // heavily penalize allergen conflicts to find alternative recommendations
                      }

                      return { product: p, score, conflict: hasConflict, conflictingAllergens };
                    });

                    scored.sort((a, b) => b.score - a.score);
                    return scored[0];
                  };

                  const morningSteps = [
                    { title: "STEP 1: GENTLE CLEANSE", type: "cleanser" as const, desc: "Wash away overnight cellular debris without stripping essential lipids." },
                    { title: "STEP 2: BALANCE & TONING", type: "toner" as const, desc: "Calm micro-redness, hydrate pores, and optimize skin pH levels." },
                    { title: "STEP 3: BARRIER CELL SERUM", type: "serum" as const, desc: "Infuse antioxidants or moisture magnets to withstand daily stress." },
                    { title: "STEP 4: SUNRISE DEW HYDRATION", type: "moisturizer" as const, desc: "Lock in core hydration with a dewy, non-comedogenic cream layer." },
                    { title: "STEP 5: SPF PROTECTIVE SHIELD", type: "sunscreen" as const, desc: "A luxury broad-spectrum UV shield that prevents cell pigmentation." }
                  ];

                  const nightSteps = [
                    { title: "STEP 1: DOUBLE PURIFY CLEANSE", type: "cleanser" as const, desc: "Deeply cleanse urban impurities, sebum buildup, and micro-particles." },
                    { title: "STEP 2: RITUAL REPAIR TONING", type: "toner" as const, desc: "Soothe cells and prepare the skin barrier for active cellular absorption." },
                    { title: "STEP 3: NIGHT CELL CELLULAR SERUM", type: "serum" as const, desc: "Accelerate overnight cellular turnover and repair skin micro-tears." },
                    { title: "STEP 4: MOISTURE LOCK REPAIR", type: "moisturizer" as const, desc: "Apply a deeply nourishing barrier recovery cream to lock in overnight moisture." }
                  ];

                  const activeSteps = selectedRoutineTab === "morning" ? morningSteps : nightSteps;

                  return (
                    <div className="border-t border-brand-rose pt-8 mt-8 space-y-6 select-none text-left animate-slide-in">
                      <div className="space-y-1.5">
                        <span className="text-[9px] uppercase tracking-widest text-amethyst font-extrabold flex items-center gap-1.5">
                          <Sparkles size={11} className="animate-pulse text-amethyst" /> Dynamic Circadian Rituals
                        </span>
                        <h4 className="text-base font-bold font-elegant tracking-wide text-foreground uppercase">
                          Your Custom Skincare Circadian Vanity
                        </h4>
                        <p className="text-[11px] text-foreground/70 leading-relaxed">
                          Below is your morning and night routine checklist, dynamically mapped in real-time to your skin profile. Focuses on barrier restoration and avoids your flagged ingredient allergens.
                        </p>
                      </div>

                      {/* Tab Selector Switcher */}
                      <div className="flex gap-2.5 p-1 rounded-xl bg-brand-cream border border-brand-rose max-w-xs select-none">
                        <button
                          key="morning"
                          type="button"
                          onClick={() => setSelectedRoutineTab("morning")}
                          className={`flex-1 py-2 text-[10px] uppercase font-bold tracking-wider rounded-lg transition-all cursor-pointer ${
                            selectedRoutineTab === "morning"
                              ? "bg-brand-gradient text-white font-extrabold shadow-sm"
                              : "text-foreground/60 hover:text-amethyst"
                          }`}
                        >
                          ☀️ Sunrise Shield
                        </button>
                        <button
                          key="night"
                          type="button"
                          onClick={() => setSelectedRoutineTab("night")}
                          className={`flex-1 py-2 text-[10px] uppercase font-bold tracking-wider rounded-lg transition-all cursor-pointer ${
                            selectedRoutineTab === "night"
                              ? "bg-brand-gradient text-white font-extrabold shadow-sm"
                              : "text-foreground/60 hover:text-amethyst"
                          }`}
                        >
                          🌙 Sunset Repair
                        </button>
                      </div>

                      {/* Stepper Vertical Timeline */}
                      <div className="relative border-l border-dashed border-brand-rose pl-6 ml-3 space-y-8 py-2 select-none">
                        {activeSteps.map((step, idx) => {
                          const rec = getRecommendedProductForStep(step.type);
                          const product = rec.product;
                          const savings = product.mrp > product.price ? product.mrp - product.price : 0;
                          const discount = savings > 0 ? Math.round((savings / product.mrp) * 100) : 0;

                          return (
                            <div key={idx} className="relative group/step animate-slide-in">
                              {/* Glowing Connected Dot */}
                              <div 
                                className="absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-brand-rose flex items-center justify-center text-[7px] font-bold shadow-md transition-all duration-300 group-hover/step:scale-110"
                                style={{ 
                                  backgroundColor: selectedRoutineTab === "morning" ? "#FC2779" : "#D81B60", 
                                  color: "#FFFFFF",
                                  boxShadow: `0 0 10px ${selectedRoutineTab === "morning" ? "rgba(252,39,121,0.4)" : "rgba(216,27,96,0.4)"}` 
                                }}
                              >
                                {idx + 1}
                              </div>

                              {/* Stepper info details */}
                              <div className="space-y-1.5 mb-3">
                                <span className="text-[9px] uppercase tracking-widest font-black" style={{ color: "#FC2779" }}>
                                  {step.title}
                                </span>
                                <p className="text-[10px] text-foreground/75 leading-relaxed max-w-lg font-semibold">
                                  {step.desc}
                                </p>
                              </div>

                              {/* Stepper Custom Recommendation vanity box */}
                              <div className="bg-brand-cream border border-brand-rose rounded-2xl p-4 max-w-xl flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:border-amethyst transition-all duration-300 select-none shadow-sm">
                                
                                {/* Left Section: Metadata */}
                                <div className="flex items-center gap-3">
                                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-brand-cream border border-brand-rose shrink-0 flex items-center justify-center">
                                    <ProductImage src={product.image} alt={product.title} brand={product.brand} />
                                  </div>
                                  <div className="space-y-0.5 text-left">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <span className="text-[8px] font-black uppercase tracking-wider text-amethyst">{product.brand}</span>
                                      {rec.conflict && (
                                        <span className="px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-600 text-[7px] uppercase tracking-widest font-black animate-pulse">
                                          ⚠️ Allergy Warning: Contains {rec.conflictingAllergens.join(", ")}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-xs font-bold text-foreground block line-clamp-1 max-w-[240px] sm:max-w-[320px]">{product.title}</span>
                                    <span className="text-[9.5px] text-foreground/60 leading-normal block italic line-clamp-1 max-w-[280px]">
                                      {getProductMetadata(product).benefits}
                                    </span>
                                  </div>
                                </div>

                                {/* Right Section: Cart actions */}
                                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 w-full sm:w-auto border-t sm:border-t-0 border-brand-rose pt-3 sm:pt-0 shrink-0">
                                  <div className="text-left sm:text-right space-y-0.5">
                                    {product.mrp > product.price && (
                                      <span className="text-[9.5px] text-foreground/40 line-through font-mono block">₹{product.mrp}</span>
                                    )}
                                    <span className="text-xs font-black text-foreground font-mono block">₹{product.price}</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const defaultShade = product.shades ? product.shades[0] : undefined;
                                      addToCart(product, 1, defaultShade);
                                      setCartOpen(true);
                                    }}
                                    className="px-3.5 py-1.5 rounded-lg bg-brand-gradient hover:bg-brand-gradient-hover text-white text-[9px] uppercase tracking-wider font-extrabold transition-all cursor-pointer select-none active:scale-95 shadow-md shadow-amethyst/10 border border-brand-rose flex items-center gap-1 shrink-0"
                                  >
                                    <ShoppingBag size={10} />
                                    Add to Vanity
                                  </button>
                                </div>

                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 5. ORDERS & CLAIMS TAB */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-center border-b border-brand-rose pb-3 gap-3">
                  <div className="space-y-0.5 text-center sm:text-left">
                    <h3 className="text-lg font-bold font-elegant tracking-wide text-foreground">Orders legacy & Claims Vault</h3>
                    <p className="text-[10px] text-foreground/70">Trace active courier milestones or submit anti-abuse claim videos.</p>
                  </div>
                  <button
                    onClick={() => { setShowClaimForm(!showClaimForm); setClaimSuccess(""); setClaimError(""); }}
                    className="px-4 py-2 border border-brand-rose hover:bg-brand-cream text-amethyst hover:text-brand-purple rounded-xl text-[9px] uppercase tracking-wider font-extrabold flex items-center gap-1.5 cursor-pointer select-none transition-all active:scale-95"
                  >
                    <Video size={12} />
                    Unboxing Claim Form
                  </button>
                </div>

                {/* Claim Submission form */}
                {showClaimForm && (
                  <form onSubmit={handleClaimSubmit} className="p-5 rounded-2xl bg-brand-cream border border-red-500/20 space-y-4 text-xs animate-slide-in text-left">
                    <span className="font-extrabold text-red-500 uppercase tracking-widest text-[9px] flex items-center gap-1 select-none">
                      <AlertTriangle size={11} className="shrink-0" />
                      Anti-Abuse Unboxing Claim Vault
                    </span>
                    <p className="text-[10px] text-foreground/75 leading-relaxed">
                      Sayanita Payra mandates continuous, unedited unboxing videos for all damaged or missing items claims. Submit order ID and public unboxing video link below (Google Drive / YouTube).
                    </p>

                    {claimSuccess && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl p-3 text-[10px] font-semibold leading-relaxed">
                        {claimSuccess}
                      </div>
                    )}

                    {claimError && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl p-3 text-[10px] font-semibold leading-relaxed animate-pulse">
                        {claimError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="font-bold text-foreground/60 uppercase tracking-wider block text-[9px]">Select Order ID</label>
                        <select
                          value={claimOrderId}
                          onChange={(e) => setClaimOrderId(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg border border-brand-rose focus:border-amethyst bg-background text-foreground outline-none font-sans cursor-pointer"
                        >
                          <option value="">Choose order</option>
                          {userOrders.map((o) => (
                            <option key={o.id} value={o.id}>{o.id} (₹{o.total_amount})</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-foreground/60 uppercase tracking-wider block text-[9px]">Claim Reason</label>
                        <select
                          value={claimType}
                          onChange={(e) => setClaimType(e.target.value as any)}
                          className="w-full px-3 py-2.5 rounded-lg border border-brand-rose focus:border-amethyst bg-background text-foreground outline-none font-sans cursor-pointer"
                        >
                          <option value="damage">Damaged Item received</option>
                          <option value="missing">Missing item in delivery</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-foreground/60 uppercase tracking-wider block text-[9px]">Unedited Unboxing Video URL</label>
                      <input
                        type="url"
                        required
                        placeholder="https://drive.google.com/file/... or https://youtube.com/..."
                        value={claimVideoUrl}
                        onChange={(e) => setClaimVideoUrl(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-brand-rose focus:border-amethyst bg-background text-foreground outline-none font-sans"
                      />
                    </div>

                    <div className="flex gap-3 justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => setShowClaimForm(false)}
                        className="px-4 py-2 border border-brand-rose rounded-lg text-foreground/60 hover:text-foreground transition-colors cursor-pointer font-bold uppercase text-[10px] tracking-wider"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all cursor-pointer font-bold uppercase text-[10px] tracking-wider shadow-md shadow-red-950/20"
                      >
                        Submit Video Claim
                      </button>
                    </div>
                  </form>
                )}

                {/* Orders legacy list */}
                {userOrders.length === 0 ? (
                  <div className="py-12 text-center text-foreground/50 text-xs bg-brand-cream/50 rounded-[28px] border border-dashed border-brand-rose font-medium">
                    No order transactions recorded in your profile. Fill your basket with botanicals to activate catalog shipping records!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userOrders.map((order) => {
                      const associatedClaims = claims.filter(c => c.order_id === order.id);
                      return (
                        <div key={order.id} className="rounded-2xl border border-brand-rose bg-brand-cream overflow-hidden shadow-sm">
                          {/* Order Brief Header */}
                          <div className="bg-brand-peach px-5 py-4 border-b border-brand-rose flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                            <div className="space-y-0.5">
                              <span className="text-xs font-bold text-foreground block">Order {order.id}</span>
                              <span className="text-[10px] text-foreground/60 font-medium font-mono">
                                Placed on {order.created_at.split("T")[0]} • Paid via {order.payment_method}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span 
                                className="px-3 py-1 rounded-full text-[9px] uppercase tracking-wider font-extrabold border"
                                style={
                                  order.order_status === "delivered" 
                                    ? { backgroundColor: "rgba(16,185,129,0.15)", borderColor: "rgba(16,185,129,0.3)", color: "#10B981" }
                                    : { backgroundColor: `${userAccent}15`, borderColor: `${userAccent}30`, color: userAccent }
                                }
                              >
                                {order.order_status}
                              </span>
                              <span className="text-[11px] font-extrabold text-foreground">₹{order.total_amount}</span>
                            </div>
                          </div>

                          {/* Order Products & Details */}
                          <div className="p-5 space-y-4 text-left">
                            {/* Products summary */}
                            <div className="space-y-2">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-[11px] items-center">
                                  <span className="text-foreground/80 font-medium">
                                    {item.product.title} <span className="text-[9px] text-amethyst font-semibold">({item.selectedShade || "Default"})</span> <span className="font-bold text-foreground/40">x{item.quantity}</span>
                                  </span>
                                  <span className="font-mono text-foreground/80 font-bold">₹{item.product.price * item.quantity}</span>
                                </div>
                              ))}
                            </div>

                            {/* Tracking Milestones */}
                            {order.courier && order.tracking_id && (
                              <div className="p-3.5 rounded-xl bg-background border border-brand-rose space-y-1">
                                <span className="text-[9px] uppercase tracking-widest text-foreground/60 font-bold block">Milestone Tracking Details</span>
                                <div className="flex flex-wrap justify-between items-center text-[10px] gap-2">
                                  <span className="font-medium text-foreground">Courier: {order.courier}</span>
                                  <span className="font-mono text-amethyst font-semibold select-all">AWB Tracking: {order.tracking_id}</span>
                                </div>
                              </div>
                            )}

                            {/* Claims logs */}
                            {associatedClaims.length > 0 && (
                              <div className="space-y-2 pt-2 border-t border-brand-rose">
                                <span className="text-[9px] uppercase tracking-widest text-red-500 font-bold block">Associated Unboxing Claims</span>
                                {associatedClaims.map((claim) => (
                                  <div key={claim.id} className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 flex justify-between items-center gap-3">
                                    <div className="space-y-0.5">
                                      <span className="text-[10px] font-bold text-foreground uppercase block">{claim.claim_type} claim ({claim.id})</span>
                                      {claim.resolution_notes && (
                                        <p className="text-[9px] text-foreground/70 leading-relaxed font-medium">
                                          Resolution: {claim.resolution_notes}
                                        </p>
                                      )}
                                    </div>
                                    <span 
                                      className={`px-2.5 py-0.5 rounded-full text-[8px] uppercase tracking-wider font-extrabold border`}
                                      style={
                                        claim.status === "approved"
                                          ? { backgroundColor: "rgba(16,185,129,0.15)", borderColor: "rgba(16,185,129,0.3)", color: "#10B981" }
                                          : claim.status === "rejected"
                                            ? { backgroundColor: "rgba(239,68,68,0.15)", borderColor: "rgba(239,68,68,0.3)", color: "#EF4444" }
                                            : { backgroundColor: "rgba(245,158,11,0.15)", borderColor: "rgba(245,158,11,0.3)", color: "#F59E0B" }
                                      }
                                    >
                                      {claim.status}
                                    </span>
                                  </div>
                                ))}
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

            {/* 6. WISHLIST TAB */}
            {activeTab === "wishlist" && (
              <div className="space-y-6">
                <div className="border-b border-brand-rose pb-3 text-center sm:text-left select-none">
                  <h3 className="text-lg font-bold font-elegant tracking-wide text-foreground">Curated saved items</h3>
                  <p className="text-[11px] text-foreground/70">A dedicated vanity for catalog items you desire.</p>
                </div>

                {wishlist.length === 0 ? (
                  <div className="py-12 text-center text-foreground/50 text-xs bg-brand-cream/50 rounded-2xl border border-dashed border-brand-rose font-medium">
                    Your wishlist is empty. Explore Sayanita's curated products to save favorites!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {products.filter(p => isInWishlist(p.id)).map((product) => (
                      <div key={product.id} className="group rounded-2xl bg-brand-cream border border-brand-rose overflow-hidden flex flex-col justify-between relative hover:border-amethyst transition-all duration-300 shadow-sm animate-slide-in">
                        {/* Remove favorite */}
                        <button
                          onClick={() => toggleWishlist(product.id)}
                          className="absolute top-2.5 right-2.5 p-1.5 rounded-xl bg-background/80 hover:bg-background text-red-500 hover:text-red-600 transition-colors z-20 cursor-pointer shadow-sm"
                        >
                          <Heart size={14} className="fill-red-500" />
                        </button>

                        <div className="relative aspect-square w-full bg-brand-cream/30 overflow-hidden">
                          <ProductImage src={product.image} alt={product.title} brand={product.brand} />
                        </div>

                        <div className="p-4 space-y-3 text-left">
                          <div className="space-y-0.5">
                            <span className="text-[9px] uppercase tracking-widest text-amethyst font-bold block">{product.category}</span>
                            <span className="text-xs font-bold text-foreground block line-clamp-1">{product.title}</span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-extrabold text-foreground font-mono">₹{product.price}</span>
                            <span className={`text-[9px] uppercase tracking-widest font-extrabold ${product.stock > 0 ? "text-emerald-600" : "text-red-500"}`}>
                              {product.stock > 0 ? "In Stock" : "Sold Out"}
                            </span>
                          </div>

                          <Link
                            href="/shop"
                            className="w-full py-2 bg-brand-cream hover:bg-brand-peach text-[10px] text-center uppercase tracking-wider font-bold rounded-lg border border-brand-rose block transition-colors cursor-pointer text-foreground"
                          >
                            Explore In Catalog
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 7. SECURITY TAB */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div className="border-b border-brand-rose pb-3 text-center sm:text-left select-none">
                  <h3 className="text-lg font-bold font-elegant tracking-wide text-foreground">Security Center & Credentials</h3>
                  <p className="text-[11px] text-foreground/70">Trace active device connections, manage 2FA configurations, or review audit standards.</p>
                </div>

                {/* Security metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <div className="bg-brand-cream border border-brand-rose rounded-2xl p-5 space-y-3 shadow-sm">
                    <span className="font-extrabold text-amethyst uppercase tracking-widest text-[9px] flex items-center gap-1.5">
                      <Key size={12} /> Account Integrity Check
                    </span>
                    <ul className="space-y-3 text-[10px] text-foreground/80 font-medium">
                      <li className="flex justify-between items-center">
                        <span>Email Verification Status</span>
                        <span className="text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1"><Check size={11} /> Verified</span>
                      </li>
                      <li className="flex justify-between items-center">
                        <span>2-Factor Authentication</span>
                        <span className="text-amber-600 font-bold uppercase tracking-wider flex items-center gap-1"><Info size={11} /> Disabled</span>
                      </li>
                      <li className="flex justify-between items-center">
                        <span>Anti-Abuse Video Claim Auditing</span>
                        <span className="text-amethyst font-bold uppercase tracking-wider">Active</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-brand-cream border border-brand-rose rounded-2xl p-5 space-y-3 shadow-sm">
                    <span className="font-extrabold text-amethyst uppercase tracking-widest text-[9px] flex items-center gap-1.5">
                      <Shield size={12} /> Device Session Audit log
                    </span>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-b border-brand-rose pb-2 text-[10px]">
                        <div className="space-y-0.5">
                          <span className="font-bold text-foreground block">NextJS Client Browser</span>
                          <span className="text-foreground/60 block">IP: 192.168.1.45 • Kolkata, IN</span>
                        </div>
                        <span className="text-[9px] uppercase font-bold text-emerald-600">Current</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <div className="space-y-0.5">
                          <span className="font-bold text-foreground/50 block">Chrome / Mobile Phone</span>
                          <span className="text-foreground/50 block">IP: 202.144.15.2 • West Bengal</span>
                        </div>
                        <span className="text-[9px] uppercase font-bold text-foreground/40">2 hours ago</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security notification pledge */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-cream to-background border border-red-500/20 text-left space-y-2 text-xs text-foreground/75 select-none shadow-sm">
                  <span className="font-extrabold text-amethyst uppercase tracking-widest text-[9px] flex items-center gap-1.5">
                    <AlertTriangle size={12} className="text-red-500" />
                    Security Notification for Admins
                  </span>
                  <p className="text-[10px] leading-relaxed font-medium text-foreground/70">
                    If this user profile is suspended by Sayanita during security audits or payment disputes, active credentials are automatically invalidated, blocking checkout, login, or cart configurations.
                  </p>
                </div>
              </div>
            )}

            {/* 8. LOYALTY TAB */}
            {activeTab === "loyalty" && (
              <div className="space-y-6">
                <div className="border-b border-brand-rose pb-3 text-center sm:text-left select-none">
                  <h3 className="text-lg font-bold font-elegant tracking-wide text-foreground">Loyalty lounge & exclusive milestones</h3>
                  <p className="text-[11px] text-foreground/70">Earn GLOW POINTS on every purchase to unlock exclusive discount tiers.</p>
                </div>

                {/* Score panel */}
                <div className="bg-gradient-to-r from-brand-cream to-brand-peach border border-brand-rose rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 select-none shadow-sm animate-slide-in">
                  <div className="space-y-1.5 text-center sm:text-left">
                    <span className="text-[9px] uppercase tracking-widest text-amethyst font-extrabold block">Current Loyalty Balance</span>
                    <h3 className="text-3xl font-extrabold font-elegant text-foreground block">
                      {user.loyalty_points || 0} <span className="text-xs uppercase text-foreground/60 font-sans font-bold">Glow Points</span>
                    </h3>
                    <p className="text-[10px] text-foreground/70 leading-relaxed font-medium">
                      You are enjoying <strong style={{ color: userAccent }}>{userTier} Level</strong> benefits. Spend points at checkout or unlock vouchers.
                    </p>
                  </div>
                  
                  {/* Tier status indicator badge */}
                  <div className="flex items-center justify-center p-3 rounded-full bg-background border border-brand-rose shrink-0 shadow-sm">
                    <Award size={48} style={{ color: userAccent }} />
                  </div>
                </div>

                {/* Spending Milestones */}
                <div className="space-y-3 text-left">
                  <span className="text-[9px] uppercase tracking-widest text-foreground/60 font-bold block select-none">Points milestones & rewards</span>
                  
                  <div className="space-y-3">
                    {[
                      { points: 50, reward: "Bronze Badge: Unlock COD & Free Shipping catalog access", unlocked: (user.loyalty_points || 0) >= 50 },
                      { points: 150, reward: "Silver Badge: Free Crochet Keychains / Lip Balms included in orders", unlocked: (user.loyalty_points || 0) >= 150 },
                      { points: 500, reward: "Gold Badge: 10% Flat discount on Sayanita's special vault kits", unlocked: (user.loyalty_points || 0) >= 500 },
                      { points: 1000, reward: "Orchid Platinum: Exclusive invitations to product unboxings & live testing events", unlocked: (user.loyalty_points || 0) >= 1000 }
                    ].map((milestone, idx) => (
                      <div 
                        key={idx} 
                        className={`p-4 rounded-xl border flex justify-between items-center gap-4 ${
                          milestone.unlocked 
                            ? "bg-brand-cream border-brand-rose shadow-sm" 
                            : "bg-background border-brand-rose/60 opacity-60"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-foreground block">{milestone.reward}</span>
                          <span className="text-[9px] text-foreground/60 block">Requires {milestone.points} Glow Points</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[8px] uppercase tracking-wider font-extrabold border ${
                          milestone.unlocked 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" 
                            : "bg-background border-brand-rose/60 text-foreground/50"
                        }`}>
                          {milestone.unlocked ? "Unlocked" : "Locked"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      </main>
      
      <Footer />
    </div>
  );
}
