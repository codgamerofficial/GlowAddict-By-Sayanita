"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useShop, Order } from "@/context/ShopContext";
import { Header } from "@/components/Header";
import { CartDrawer } from "@/components/CartDrawer";
import { 
  ShieldCheck, 
  Truck, 
  Clock, 
  PackageCheck, 
  AlertCircle, 
  FileVideo, 
  CheckCircle2, 
  ChevronRight, 
  HelpCircle,
  User,
  LogOut,
  Lock
} from "lucide-react";

export default function CustomerDashboard() {
  const { orders, claims, submitClaim, user, signOut } = useShop();

  // Active claim forms
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [claimType, setClaimType] = useState<"damage" | "missing">("damage");
  const [videoSelected, setVideoSelected] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [claimSubmittedId, setClaimSubmittedId] = useState<string | null>(null);

  // Filter orders by authenticated user's email dynamically for strict data privacy
  const userOrders = orders.filter(
    (order) =>
      order.shipping_address?.email?.toLowerCase() === (user?.email || "").toLowerCase()
  );

  const userClaims = claims.filter((claim) =>
    userOrders.some((order) => order.id === claim.order_id)
  );

  const buildWhatsAppMessage = (order: Order) => {
    const itemsText = order.items
      .map(
        (item) =>
          `• ${item.product.title} ${
            item.selectedShade ? `[Shade: ${item.selectedShade}]` : ""
          } (Qty: ${item.quantity})`
      )
      .join("\n");

    const freebiesList: string[] = [];
    if (order.freebies.scrunchies) freebiesList.push("Free Hair Scrunchies 🌸");
    if (order.freebies.lipstick) freebiesList.push("Free Elegant Lipstick 💄");
    if (order.freebies.choice) freebiesList.push(`Choice Premium Gift: ${order.freebies.choice} 🎁`);
    const freebiesText = freebiesList.length > 0 ? freebiesList.map((f) => `- ${f}`).join("\n") : "None";

    const msg = `✨ *Glow Addict by Sayanita — Order Receipt* ✨

*Order ID:* ${order.id}
*Date:* ${new Date(order.created_at).toLocaleDateString()}

*Customer Details:*
- Name: ${order.shipping_address.name}
- Phone: ${order.shipping_address.phone}

*Shipping Address:*
${order.shipping_address.address}, ${order.shipping_address.city}, ${order.shipping_address.state} - ${order.shipping_address.zipCode}

*Items Ordered:*
${itemsText}

*Unlocked Freebies:*
${freebiesText}

*Grand Total:* ₹${order.total_amount}
*Payment Channel:* ${order.payment_method}
*Payment Status:* ${order.payment_status === "paid" ? "Paid (Verified)" : "Pending Verification"}${order.upi_transaction_id ? `\n*UPI Transaction ID:* ${order.upi_transaction_id}` : ""}

🌸 Connect with Sayanita regarding my order! 🌸`;

    return encodeURIComponent(msg);
  };

  const triggerWhatsAppRedirect = (order: Order) => {
    const text = buildWhatsAppMessage(order);
    const waUrl = `https://wa.me/918509326600?text=${text}`;
    window.open(waUrl, "_blank");
  };

  const getOrderStatusStep = (status: Order["order_status"]) => {
    switch (status) {
      case "created": return 1;
      case "packed": return 2;
      case "shipped": return 3;
      case "delivered": return 4;
      default: return 1;
    }
  };

  const handleOpenClaimModal = (orderId: string) => {
    setSelectedOrderId(orderId);
    setVideoSelected(false);
    setClaimSubmittedId(null);
  };

  const handleCreateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) return;

    if (!videoSelected || !videoFile) {
      alert("A continuous unboxing video is strictly required to process damage/missing claims.");
      return;
    }

    setUploadingVideo(true);
    try {
      const formData = new FormData();
      formData.append("file", videoFile);
      formData.append("claimId", selectedOrderId);

      const res = await fetch("/api/upload/unboxing-video", {
        method: "POST",
        body: formData,
      });

      let videoUrl = "https://www.w3schools.com/html/mov_bbb.mp4";
      if (res.ok) {
        const data = await res.json();
        videoUrl = data.url;
      }

      submitClaim(selectedOrderId, claimType, videoUrl);
      setClaimSubmittedId(selectedOrderId);
      setTimeout(() => {
        setSelectedOrderId(null);
        setClaimSubmittedId(null);
      }, 2000);
    } catch {
      alert("Failed to upload video. Please try again.");
    } finally {
      setUploadingVideo(false);
    }
  };

  // STRICT PRIVACY GATE: If user is not logged in, render a stunning locked visual interface
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#120018] text-white selection:bg-[#C77DFF]/30 selection:text-white font-sans">
        <Header />
        <CartDrawer />
        <main className="flex-grow flex items-center justify-center px-4 py-20 relative overflow-hidden">
          {/* Decorative luxury glows */}
          <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-[#C77DFF]/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-[#FF8DC7]/10 rounded-full blur-[130px] pointer-events-none" />
          
          <div className="w-full max-w-lg bg-[#2A093D]/60 backdrop-blur-md border border-[#C77DFF]/20 rounded-3xl p-8 sm:p-12 text-center space-y-8 relative shadow-2xl animate-fade-in glow-card">
            {/* Glowing lock ring */}
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute inset-0 bg-[#C77DFF]/20 rounded-full blur-md animate-pulse" />
              <div className="relative p-6 rounded-full bg-[#120018]/80 border border-[#C77DFF]/30 text-[#C77DFF]">
                <Lock size={36} />
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-elegant tracking-wide font-serif text-white">
                Routine Portal Locked
              </h1>
              <p className="text-xs sm:text-sm text-[#C77DFF]/80 leading-relaxed font-sans max-w-md mx-auto">
                Your skin barrier journey is personal. Sign in to your verified Glow Addict account to trace your orders, manage delivery rituals, and unlock your personalized unboxing portal.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link
                href="/login"
                className="flex-1 py-3 px-6 text-center text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#C77DFF] via-[#7B2CBF] to-[#E0AAFF] rounded-xl transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.97] hover:shadow-[0_0_20px_rgba(199,125,255,0.4)] cursor-pointer ios-spring-hover"
              >
                Sign In to Your Ritual
              </Link>
              <Link
                href="/signup"
                className="flex-1 py-3 px-6 text-center text-xs font-bold uppercase tracking-wider text-[#C77DFF] bg-[#120018]/80 border border-[#C77DFF]/40 rounded-xl hover:bg-[#2A093D]/60 hover:text-white transition-all duration-300 cursor-pointer ios-spring-hover"
              >
                Create New Profile
              </Link>
            </div>

            <div className="pt-6 border-t border-[#C77DFF]/10 flex items-center justify-center gap-1.5 text-xs text-[#C77DFF]/60 font-sans">
              <ShieldCheck size={14} />
              <span>100% Secure SSL Sayanita Verification Guarantee</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#120018] text-white selection:bg-[#C77DFF]/30 selection:text-white font-sans">
      <Header />
      <CartDrawer />

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Header Card */}
        <div className="bg-[#2A093D]/40 backdrop-blur-md border border-[#C77DFF]/20 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden shadow-xl glow-card">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#C77DFF]/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-4 text-left">
            <div className="p-3.5 rounded-full bg-[#120018] border border-[#C77DFF]/30 text-[#C77DFF] hidden sm:block">
              <User size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#C77DFF] uppercase tracking-widest bg-[#C77DFF]/15 px-2.5 py-0.5 rounded-md font-sans border border-[#C77DFF]/20">
                  Ritual Tier Member
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-elegant tracking-wide text-white mt-1 font-serif">
                Welcome back, {user.name || "Skin Lover"}
              </h1>
              <p className="text-xs text-[#C77DFF]/70 font-sans mt-0.5">
                Trace your authenticated premium skincare orders and submit claims • <span className="text-white font-semibold">{user.email}</span>
              </p>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <Link
              href="/"
              className="flex-1 sm:flex-initial text-center px-5 py-2.5 bg-gradient-to-r from-[#C77DFF] via-[#7B2CBF] to-[#E0AAFF] hover:shadow-[0_0_15px_rgba(199,125,255,0.4)] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer ios-spring-hover"
            >
              Shop More Skincare
            </Link>
            <button
              onClick={() => signOut()}
              className="px-4 py-2.5 bg-[#120018]/80 border border-[#C77DFF]/40 text-[#C77DFF] hover:bg-[#2A093D]/60 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ios-spring-hover active:scale-[0.97]"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>

        {/* Orders Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Orders list and timeline */}
          <div className="lg:col-span-8 space-y-6">
            <h2 className="text-sm font-bold font-sans uppercase tracking-wider text-[#C77DFF] border-b border-[#C77DFF]/20 pb-3 text-left">
              Your Orders Timeline ({userOrders.length})
            </h2>

            {userOrders.length === 0 ? (
              <div className="bg-[#2A093D]/40 border border-[#C77DFF]/20 rounded-3xl p-12 text-center space-y-4 glow-card backdrop-blur-md">
                <div className="p-4 rounded-full bg-[#120018] text-[#C77DFF] inline-block border border-[#C77DFF]/20">
                  <Clock size={40} />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-elegant text-white font-serif">No Skincare Orders Yet</h3>
                  <p className="text-xs text-[#C77DFF]/80 max-w-xs mx-auto mt-1 leading-relaxed">
                    Your dressing table is waiting. Discover 100% genuine skincare formulas starting from ₹39 shipping!
                  </p>
                </div>
                <Link
                  href="/"
                  className="px-6 py-2.5 rounded-full text-xs font-semibold bg-gradient-to-r from-[#C77DFF] to-[#E0AAFF] text-white hover:shadow-[0_0_15px_rgba(199,125,255,0.3)] transition-all duration-300 inline-block ios-spring-hover"
                >
                  Browse Catalog
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {userOrders.map((order) => {
                  const step = getOrderStatusStep(order.order_status);
                  const orderClaim = userClaims.find((c) => c.order_id === order.id);

                  return (
                    <div
                      key={order.id}
                      className="bg-[#2A093D]/30 border border-[#C77DFF]/20 rounded-3xl p-6 sm:p-8 shadow-xs glow-card space-y-6 backdrop-blur-xs text-left"
                    >
                      {/* Order info details */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#C77DFF]/15 pb-4">
                        <div className="space-y-0.5 text-left">
                          <span className="text-[10px] font-bold text-[#E056FD] uppercase tracking-wider">
                            Order Code: {order.id}
                          </span>
                          <p className="text-[10px] text-[#C77DFF]/60">
                            Placed on: {new Date(order.created_at).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                            order.payment_status === "paid"
                              ? "bg-green-950/40 text-green-400 border-green-800"
                              : order.payment_status === "pending_verification"
                              ? "bg-yellow-950/40 text-yellow-400 border-yellow-800"
                              : "bg-red-950/40 text-red-400 border-red-800"
                          }`}>
                            Payment: {order.payment_status.replace("_", " ")}
                          </span>

                          <span className="text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#120018] text-[#C77DFF] border border-[#C77DFF]/30">
                            Method: {order.payment_method}
                          </span>
                        </div>
                      </div>

                      {/* Items details */}
                      <div className="space-y-2.5 text-xs text-white/80 text-left">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center py-1 border-b border-[#C77DFF]/5 last:border-0 pb-2">
                            <span className="font-semibold text-white">
                              {item.product.title} <span className="text-[10px] text-[#E056FD] font-normal">({item.product.brand})</span>
                              {item.selectedShade && <span className="text-[10px] font-bold text-[#C77DFF] ml-1.5">• Shade: {item.selectedShade}</span>}
                            </span>
                            <span className="font-medium text-[#C77DFF]/80">
                              Qty: {item.quantity} • ₹{item.product.price * item.quantity}
                            </span>
                          </div>
                        ))}

                        {/* Freebies display */}
                        {(order.freebies.scrunchies || order.freebies.lipstick || order.freebies.choice) && (
                          <div className="mt-2.5 pt-2.5 border-t border-dashed border-[#C77DFF]/20 space-y-1">
                            <span className="text-[10px] font-bold text-[#E056FD] uppercase tracking-wider flex items-center gap-1 font-sans">
                              🎁 Packaged Freebies Included:
                            </span>
                            <div className="flex flex-wrap gap-2 text-[10px] text-green-400 font-semibold pt-1">
                              {order.freebies.scrunchies && <span className="bg-green-950/30 border border-green-800 px-2 py-0.5 rounded-md">✓ Hair Scrunchies</span>}
                              {order.freebies.lipstick && <span className="bg-green-950/30 border border-green-800 px-2 py-0.5 rounded-md">✓ Elegant Lipstick</span>}
                              {order.freebies.choice && <span className="bg-green-950/30 border border-green-800 px-2 py-0.5 rounded-md">✓ Tier Choice: {order.freebies.choice}</span>}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Grand total calculations */}
                      <div className="flex justify-between items-center text-xs border-t border-[#C77DFF]/15 pt-4 text-[#C77DFF] font-semibold">
                        <span>Grand Total (Delivery included):</span>
                        <span className="text-sm font-bold text-white">₹{order.total_amount}</span>
                      </div>

                      {/* 🚀 HORIZONTAL TIMELINE WORKSPACE */}
                      <div className="pt-2">
                        <div className="relative">
                          {/* Connecting Line */}
                          <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#120018] -translate-y-1/2 z-0 rounded-full" />
                          <div
                            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-[#C77DFF] to-[#E056FD] -translate-y-1/2 z-0 transition-all duration-500 rounded-full"
                            style={{ width: `${(step - 1) * 33.33}%` }}
                          />

                          {/* Steps Grid */}
                          <div className="relative z-10 flex justify-between">
                            {[
                              { label: "Created", icon: Clock },
                              { label: "Paid", icon: CheckCircle2 },
                              { label: "Packed", icon: PackageCheck },
                              { label: "Shipped", icon: Truck }
                            ].map((s, idx) => {
                              const StepIcon = s.icon;
                              const isActive = step >= idx + 1;

                              return (
                                <div key={idx} className="flex flex-col items-center space-y-1">
                                  <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center transition-colors duration-300 bg-[#120018] ${
                                    isActive
                                      ? "border-[#E056FD] text-[#E056FD] shadow-[0_0_10px_rgba(224,86,253,0.3)]"
                                      : "border-[#C77DFF]/20 text-[#C77DFF]/30"
                                  }`}>
                                    <StepIcon size={16} />
                                  </div>
                                  <span className={`text-[9px] font-bold uppercase tracking-wider ${
                                    isActive ? "text-white font-extrabold" : "text-[#C77DFF]/40 font-medium"
                                  }`}>
                                    {s.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Shipped tracking info details */}
                      {order.order_status === "shipped" && order.courier && (
                        <div className="bg-[#120018]/60 p-4 rounded-xl border border-[#C77DFF]/20 text-xs text-left space-y-1">
                          <span className="font-bold text-[#C77DFF] uppercase tracking-wide text-[10px] block">
                            🚚 Shipping & Courier Details:
                          </span>
                          <p className="text-[11px] text-white/75 leading-relaxed font-sans">
                            Partner Courier: <strong>{order.courier}</strong> • Tracking ID:{" "}
                            <span className="bg-[#120018] border border-[#C77DFF]/30 px-2 py-0.5 rounded-md font-mono text-[#E056FD] font-semibold">
                              {order.tracking_id}
                            </span>
                          </p>
                          <p className="text-[9px] text-[#C77DFF]/50">
                            Please check updates on courier's official tracking portal. Usually takes 3-5 days.
                          </p>
                        </div>
                      )}

                      {/* Claims resolving actions */}
                      {orderClaim ? (
                        <div className="bg-yellow-950/20 p-4 rounded-2xl border border-yellow-800/50 text-xs text-left space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-white flex items-center gap-1.5">
                              <AlertCircle size={14} className="text-[#E056FD]" />
                              Damage Dispute Claim Registered
                            </span>
                            <span className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                              orderClaim.status === "approved"
                                ? "bg-green-950/30 text-green-400 border-green-800"
                                : orderClaim.status === "rejected"
                                ? "bg-red-950/30 text-red-400 border-red-800"
                                : "bg-yellow-950/30 text-yellow-400 border-yellow-800"
                            }`}>
                              Status: {orderClaim.status}
                            </span>
                          </div>
                          
                          <p className="text-[11px] text-[#C77DFF]/80 font-sans leading-relaxed">
                            Claim Type: <strong>{orderClaim.claim_type.toUpperCase()}</strong> • Logged: {new Date(orderClaim.created_at).toLocaleDateString()}
                          </p>
                          
                          {orderClaim.resolution_notes && (
                            <div className="bg-[#120018]/80 p-2.5 rounded-lg border border-[#C77DFF]/20 text-[11px] text-[#C77DFF] italic mt-1 font-serif">
                              Sayanita's response: "{orderClaim.resolution_notes}"
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="border-t border-[#C77DFF]/15 pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                          <p className="text-[10px] text-[#C77DFF]/60 leading-relaxed font-sans text-left max-w-sm">
                            {order.order_status === "delivered"
                              ? "Did your shipment contain damages or missing items? Submit a dispute claim within 48 hours. Continuous unboxing video required."
                              : "Need custom delivery arrangements or want to follow up with Sayanita? Click below to chat."
                            }
                          </p>
                          <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                            <button
                              onClick={() => triggerWhatsAppRedirect(order)}
                              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#25D366] hover:bg-[#128C7E] rounded-xl transition-all duration-300 shadow-xs cursor-pointer ios-spring-hover"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
                              Share on WhatsApp
                            </button>

                            {order.order_status === "delivered" && (
                              <button
                                onClick={() => handleOpenClaimModal(order.id)}
                                className="px-4 py-2 text-xs font-bold text-[#E056FD] bg-[#120018] border border-[#C77DFF]/40 hover:bg-[#C77DFF]/10 rounded-xl transition-all duration-300 cursor-pointer ios-spring-hover"
                              >
                                Register Claim
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Strict Policies FAQ panel */}
          <div className="lg:col-span-4 bg-[#2A093D]/30 border border-[#C77DFF]/20 rounded-3xl p-6 sm:p-8 shadow-xs glow-card space-y-6 text-left backdrop-blur-xs">
            <h2 className="text-sm font-bold font-sans uppercase tracking-wider text-white border-b border-[#C77DFF]/20 pb-3 flex items-center gap-1.5 font-serif">
              <ShieldCheck size={16} className="text-[#E056FD]" />
              Policy Quick Guides
            </h2>

            <div className="space-y-4 text-xs font-sans text-[#C77DFF]/80 leading-relaxed">
              
              <div className="space-y-1">
                <span className="font-bold text-white flex items-center gap-1">
                  <ChevronRight size={14} className="text-[#E056FD]" />
                  Prepaid Payment Confirmations
                </span>
                <p className="pl-3.5 text-[11px] text-[#C77DFF]/70">
                  Sayanita verifies all dynamic UPI references against bank records. Once verified (usually under 2-3 hours), status updates to <strong>Paid</strong> and packages enter packing.
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-white flex items-center gap-1">
                  <ChevronRight size={14} className="text-[#E056FD]" />
                  Cancellation Ban
                </span>
                <p className="pl-3.5 text-[11px] text-[#C77DFF]/70">
                  "Once an order is confirmed, cancellation is not allowed." This prevents stock locks and operational waste on premium imported skincare.
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-white flex items-center gap-1">
                  <ChevronRight size={14} className="text-[#E056FD]" />
                  Continuous Unboxing Video Rule
                </span>
                <p className="pl-3.5 text-[11px] text-[#C77DFF]/70">
                  Unboxing videos must show the outer shipping label, box seal opening, and all products checked continuous. Uncut videos are legally mandatory for refund claims.
                </p>
              </div>

              {/* Quick WhatsApp Support button */}
              <div className="pt-2 border-t border-[#C77DFF]/20 text-center">
                <a
                  href="https://wa.me/918900000000?text=Hi%20Sayanita!%20I'm%20having%20an%20issue%20with%20tracking%20my%20order%20on%20Glow%20Addict."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 bg-[#25D366] text-white text-xs font-semibold rounded-xl hover:bg-[#128C7E] transition-all ios-spring-hover"
                >
                  <HelpCircle size={15} />
                  Ask Sayanita on WhatsApp
                </a>
              </div>

            </div>
          </div>

        </div>

        {/* Brand Story Section - The Self-Care Commitment */}
        <div className="bg-[#2A093D]/30 border border-[#C77DFF]/15 rounded-3xl p-8 sm:p-12 relative overflow-hidden text-left space-y-6 glow-card backdrop-blur-xs">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-gradient-to-r from-[#C77DFF]/5 to-[#FF8DC7]/5 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="max-w-3xl mx-auto space-y-6 text-center">
            <div className="inline-block p-[1px] bg-gradient-to-r from-[#C77DFF] via-[#7B2CBF] to-[#E0AAFF] rounded-full">
              <div className="px-3.5 py-1 bg-[#120018] rounded-full text-[10px] font-extrabold uppercase tracking-widest text-[#C77DFF]">
                The Self-Care Commitment
              </div>
            </div>
            
            <h3 className="text-3xl sm:text-4xl font-elegant tracking-wide text-white leading-tight font-serif italic">
              "Your skin barrier is the shield of your soul."
            </h3>
            
            <div className="h-0.5 w-16 bg-gradient-to-r from-[#C77DFF] to-[#E0AAFF] mx-auto" />
            
            <p className="text-sm sm:text-base text-[#C77DFF]/80 leading-relaxed font-serif tracking-wide max-w-2xl mx-auto">
              Skincare is not about quick fixes; it is an intimate daily covenant you make with yourself. When Sayanita designed the Glow Addict philosophy, it was built on a single, uncompromising promise: that every drops, every pad, and every mist should feed your cellular integrity. By tracking your routine on this dashboard, you are not just waiting for a shipment—you are dedicating a continuous space for your skin’s biological circadian repair.
            </p>
            
            <p className="text-xs text-[#C77DFF]/60 font-sans tracking-wide">
              — SAYANITA PAYRA, FOUNDER OF GLOW ADDICT
            </p>
          </div>
        </div>

      </main>

      {/* 📹 DAMAGE/MISSING CLAIM SUBMISSION MODAL SCREEN */}
      {selectedOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrderId(null)} />
          <div className="relative bg-[#2A093D] rounded-3xl p-6 sm:p-8 border border-[#C77DFF]/30 shadow-2xl max-w-md w-full mx-4 space-y-6 glow-card animate-slide-in text-left">
            
            <div className="flex items-center gap-3 border-b border-[#C77DFF]/20 pb-3">
              <div className="p-2 bg-[#120018] text-[#E056FD] rounded-full border border-[#C77DFF]/20">
                <AlertCircle size={20} />
              </div>
              <h3 className="text-lg font-bold font-elegant text-white font-serif">
                File Skincare Damage Claim
              </h3>
            </div>

            {claimSubmittedId === selectedOrderId ? (
              <div className="py-10 text-center space-y-4">
                <div className="flex justify-center text-green-400">
                  <CheckCircle2 size={48} className="animate-bounce" />
                </div>
                <h4 className="text-sm font-bold text-white">Claim Logged Successfully!</h4>
                <p className="text-[11px] text-[#C77DFF]/60">
                  Sayanita is reviewing your unboxing video evidence. Status updates will log inside this panel shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateClaim} className="space-y-4 text-xs font-sans text-white">
                
                {/* Claim Type */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#C77DFF] block">Select Dispute Issue *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setClaimType("damage")}
                      className={`py-2 rounded-lg border font-semibold text-center transition-all cursor-pointer ${
                        claimType === "damage"
                          ? "bg-gradient-to-r from-[#C77DFF] to-[#E056FD] text-white border-transparent"
                          : "bg-[#120018] text-[#C77DFF] border-[#C77DFF]/30 hover:bg-[#120018]/60"
                      }`}
                    >
                      💥 Damaged Product
                    </button>
                    <button
                      type="button"
                      onClick={() => setClaimType("missing")}
                      className={`py-2 rounded-lg border font-semibold text-center transition-all cursor-pointer ${
                        claimType === "missing"
                          ? "bg-gradient-to-r from-[#C77DFF] to-[#E056FD] text-white border-transparent"
                          : "bg-[#120018] text-[#C77DFF] border-[#C77DFF]/30 hover:bg-[#120018]/60"
                      }`}
                    >
                      🔍 Missing Item
                    </button>
                  </div>
                </div>

                {/* Video Evidence */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#C77DFF] block">
                    Upload Continuous Unboxing Video *
                  </label>
                  <div className="relative border border-dashed border-[#C77DFF]/50 bg-[#120018] hover:bg-[#120018]/60 transition-colors p-6 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer">
                      <input
                        type="file"
                        accept="video/*"
                        required
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            setVideoFile(f);
                            setVideoSelected(true);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    <FileVideo size={24} className="text-[#E056FD] animate-pulse" />
                    <span className="text-xs font-semibold text-white mt-1.5">
                      {videoSelected ? "✓ Continuous Video attached" : "Click to select uncut unboxing video"}
                    </span>
                    <span className="text-[9px] text-[#C77DFF]/60 mt-0.5">MP4, MOV up to 50MB (Unedited video only)</span>
                  </div>
                  <p className="text-[9px] text-[#E056FD] font-semibold leading-normal">
                    ⚠️ Policy reminder: The unboxing video must capture box label, outer seal, and complete open in a single continuous shot. Edited/cut videos are automatically disqualified.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrderId(null)}
                    className="flex-1 py-2.5 rounded-xl border border-[#C77DFF]/40 text-xs font-semibold text-[#C77DFF] hover:bg-[#120018] transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingVideo}
                    className="flex-1 py-2.5 bg-gradient-to-r from-[#C77DFF] to-[#E056FD] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs disabled:opacity-60 cursor-pointer ios-spring-hover"
                  >
                    {uploadingVideo ? "Uploading Video..." : "Submit Dispute Evidence"}
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
