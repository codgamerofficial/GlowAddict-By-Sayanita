"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { useShop } from "@/context/ShopContext";
import { Mail, Lock, Sparkles, AlertCircle, ArrowRight, ShieldCheck, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const { signInWithEmail } = useShop();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await signInWithEmail(email, password);
      setSuccess("Access granted. Unlocking your skincare vault...");
      setTimeout(() => {
        router.push("/profile");
      }, 1200);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#120018] text-white relative font-sans overflow-hidden">
      {/* Dynamic background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#E056FD]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[#C77DFF]/5 rounded-full blur-[140px] pointer-events-none" />

      <Header />

      <main className="flex-1 flex flex-col md:grid md:grid-cols-12 relative z-10">
        {/* LEFT COLUMN: Luxury Editorial Campaign Showcase */}
        <div className="hidden md:flex md:col-span-5 lg:col-span-6 bg-gradient-to-br from-[#120018] via-[#240335] to-[#1C0028] border-r border-[#C77DFF]/10 flex-col justify-between p-12 lg:p-16 relative overflow-hidden select-none">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#C77DFF]/8 rounded-full blur-3xl pointer-events-none transform translate-x-1/2 -translate-y-1/2" />
          
          {/* Sayanita branding signature header */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full border border-[#C77DFF]/30 p-1 bg-white/5 flex items-center justify-center">
              <Image src="/logo.png" alt="Glow Addict Logo" fill className="object-cover" unoptimized />
            </div>
            <div>
              <span className="font-elegant font-bold tracking-widest text-[11px] uppercase text-white block">GLOW ADDICT</span>
              <span className="text-[8px] tracking-wider uppercase text-[#C77DFF] font-semibold block">BY SAYANITA</span>
            </div>
          </div>

          {/* Central Editorial Campaign Statement */}
          <div className="space-y-6 my-auto max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C77DFF]/10 border border-[#C77DFF]/20 text-[#C77DFF] text-[9px] uppercase tracking-wider font-bold animate-pulse">
              <Sparkles size={10} className="text-[#FF8DC7]" />
              The Luxury Skincare Experience
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-extrabold font-elegant leading-[1.1] text-white tracking-wide">
              Purity in every <span className="bg-gradient-to-r from-[#FF8DC7] to-[#C77DFF] bg-clip-text text-transparent">drop</span>, personalization in every routine.
            </h1>
            
            <p className="text-[12px] text-orchid-text-muted leading-relaxed font-medium">
              Step inside a sanctuary designed around clinical botany and custom skincare. Sign in to retrieve your private routine mappings, trace authentic orders, and engage directly with Sayanita.
            </p>

            {/* Micro highlights grid */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-[#C77DFF]/10">
              <div className="space-y-1">
                <span className="text-xl font-bold font-elegant bg-gradient-to-r from-[#FF8DC7] to-[#C77DFF] bg-clip-text text-transparent">2500+</span>
                <span className="text-[9px] text-orchid-text-muted/70 uppercase tracking-wider block font-bold">Custom Skin Profiles</span>
              </div>
              <div className="space-y-1">
                <span className="text-xl font-bold font-elegant bg-gradient-to-r from-[#FF8DC7] to-[#C77DFF] bg-clip-text text-transparent">100%</span>
                <span className="text-[9px] text-orchid-text-muted/70 uppercase tracking-wider block font-bold">Active Botanicals</span>
              </div>
            </div>
          </div>

          {/* Editorial footer signature */}
          <div className="text-[10px] text-orchid-text-muted/50 font-medium">
            &copy; 2026 Glow Addict by Sayanita. All Rights Reserved.
          </div>
        </div>

        {/* RIGHT COLUMN: Dewy Form Panel */}
        <div className="flex-1 md:col-span-7 lg:col-span-6 flex items-center justify-center p-6 sm:p-12 relative">
          <div className="w-full max-w-md bg-gradient-to-b from-[#2A093D]/40 to-[#1B0124]/80 border border-[#C77DFF]/15 rounded-[36px] p-8 sm:p-10 shadow-2xl backdrop-blur-lg relative overflow-hidden animate-slide-in">
            
            {/* Dewy glass sparkle dot */}
            <div className="absolute top-6 right-6 text-[#FF8DC7] animate-pulse">
              <Sparkles size={18} />
            </div>

            {/* Mobile Branding (visible only on small devices) */}
            <div className="md:hidden flex flex-col items-center space-y-2 mb-6">
              <div className="relative w-12 h-12 rounded-full border border-[#C77DFF]/25 overflow-hidden bg-white/5 flex items-center justify-center p-1.5">
                <Image src="/logo.png" alt="Glow Addict Logo" fill className="object-cover" unoptimized />
              </div>
              <h2 className="text-lg font-black font-elegant text-white tracking-widest uppercase">
                GLOW ADDICT
              </h2>
              <p className="text-[9px] text-[#C77DFF] tracking-wider uppercase font-semibold">
                By Sayanita
              </p>
            </div>

            {/* Heading text */}
            <div className="space-y-1.5 text-center md:text-left">
              <h3 className="text-2xl font-black font-elegant text-white tracking-wide">
                Welcome Back
              </h3>
              <p className="text-[11px] text-orchid-text-muted font-medium">
                Please enter your credentials to open your account dashboard.
              </p>
            </div>

            {/* Messages alerts */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl p-4 text-[11px] flex gap-2.5 items-start text-left mt-6 animate-pulse">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span className="leading-relaxed font-semibold">{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl p-4 text-[11px] flex gap-2.5 items-start text-left mt-6">
                <ShieldCheck size={15} className="shrink-0 mt-0.5" />
                <span className="leading-relaxed font-semibold">{success}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4 text-xs text-left mt-6">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#9F7AC2] uppercase tracking-wider block text-[9px]">Email Address</label>
                <div className="relative">
                  <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9F7AC2]" />
                  <input
                    type="email"
                    required
                    placeholder="name@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#C77DFF]/15 focus:border-[#E056FD] outline-none bg-[#1E0629] text-white transition-all font-sans placeholder-white/20 focus:shadow-[0_0_10px_rgba(224,86,253,0.15)]"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-[#9F7AC2] uppercase tracking-wider block text-[9px]">Password</label>
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Offline sandbox mode does not support automatic password resets. Enter master code 0909 during unboxing video verification, or reset directly ifSupabase is connected.");
                    }} 
                    className="text-[9px] text-[#FF8DC7] font-bold hover:underline tracking-wide"
                  >
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9F7AC2]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-[#C77DFF]/15 focus:border-[#E056FD] outline-none bg-[#1E0629] text-white transition-all font-sans placeholder-white/20 focus:shadow-[0_0_10px_rgba(224,86,253,0.15)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9F7AC2] hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-brand-gradient hover:bg-brand-gradient-hover text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 disabled:opacity-60 shadow-lg shadow-[#E056FD]/20 flex items-center justify-center gap-2 cursor-pointer mt-6 active:scale-95"
              >
                {loading ? "Verifying Credentials..." : (
                  <>
                    Sign In
                    <ArrowRight size={13} />
                  </>
                )}
              </button>
            </form>

            {/* Unboxing note banner */}
            <div className="mt-6 p-4 rounded-2xl bg-[#1E0629]/50 border border-[#C77DFF]/10 text-left space-y-1 text-[10px] text-orchid-text-muted leading-relaxed font-sans select-none">
              <span className="font-bold text-[#FF8DC7] uppercase tracking-wider block text-[8px] flex items-center gap-1">
                <ShieldCheck size={10} className="shrink-0" />
                The Purity Pledge & Anti-Abuse System
              </span>
              <p className="font-medium text-orchid-text-muted/80">
                Luxe products require absolute security. Normal customer accounts require unboxing videos for shipment resolution. Admins maintain total dashboard visibility.
              </p>
            </div>

            {/* Footer switcher */}
            <p className="text-[10px] text-orchid-text-muted/60 pt-6 text-center font-sans">
              Don't have a luxury account?{" "}
              <Link href="/signup" className="text-[#FF8DC7] font-extrabold hover:underline">
                Create one now
              </Link>
            </p>

          </div>
        </div>
      </main>
    </div>
  );
}
