"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ShieldCheck, AlertCircle, HelpCircle, ArrowLeft } from "lucide-react";

export default function StorePolicy() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fdfafb] mesh-gradient">
      <Header />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-left">
        
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-amethyst hover:text-brand-magenta transition-colors">
          <ArrowLeft size={14} />
          Return to Storefront
        </Link>

        <section className="bg-white border border-brand-rose/25 rounded-3xl p-6 sm:p-10 shadow-xs glow-card space-y-6">
          <div className="space-y-1.5 border-b border-brand-rose/20 pb-4">
            <span className="text-[10px] font-bold text-brand-magenta uppercase tracking-wider">Welcome to Glow Addict by Sayanita</span>
            <h1 className="text-2xl sm:text-3xl font-elegant text-amethyst">
              Official Store Policies
            </h1>
            <p className="text-[11px] text-foreground/50">Last updated: May 2026</p>
          </div>

          <div className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-sans space-y-6">
            
            {/* Policy item 1 */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-amethyst font-sans uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-brand-magenta shrink-0" />
                1. Product Authenticity Guarantee
              </h3>
              <p className="pl-5 leading-relaxed">
                We deal <strong>strictly and exclusively in 100% authentic and genuine products</strong>. Sayanita imports directly from verified manufacturers or official licensed global brand distributors. Glow Addict does not support or sell first-copy, fake, duplicate, or expired beauty items.
              </p>
            </div>

            {/* Policy item 2 */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-amethyst font-sans uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle size={16} className="text-brand-magenta shrink-0" />
                2. Return & Cancellation Policy
              </h3>
              <p className="pl-5 leading-relaxed">
                We maintain a strict <strong>No Return, No Exchange, and No Refund policy</strong>. Once an order payment is initiated and logged in our system, cancellations or order modifications (such as shades, variants, or items) are strictly not allowed. Please double check shades, product attributes, and skincare routine compatibility before placing your order.
              </p>
            </div>

            {/* Policy item 3 */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-amethyst font-sans uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle size={16} className="text-brand-magenta shrink-0" />
                3. Mandatory Unboxing Video
              </h3>
              <p className="pl-5 leading-relaxed text-brand-magenta font-semibold bg-brand-cream/60 p-4 rounded-xl border border-brand-rose/20">
                ⚠️ Continuous unboxing video is strictly mandatory in case of any damage or missing product claims during shipping transit. The unboxing video must be uncut, continuous, and show the sealed outer shipping label, box opening, and full product inspection. Videos showing signs of edit, cuts, or pre-opened boxes will be automatically disqualified from resolution.
              </p>
            </div>

            {/* Policy item 4 */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-amethyst font-sans uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-brand-magenta shrink-0" />
                4. Packaging & Hygiene Safeguards
              </h3>
              <p className="pl-5 leading-relaxed">
                All skincare formulas are packed carefully with proper safety wrapping, bubble envelopes, and hygiene safeguards. Minor outer packaging box shifts may occur depending on brand manufacturing updates and are beyond our control.
              </p>
            </div>

            {/* Policy item 5 */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-amethyst font-sans uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle size={16} className="text-brand-magenta shrink-0" />
                5. Communication Ethics
              </h3>
              <p className="pl-5 leading-relaxed">
                As a supportive beauty community, respectful, warm, and polite behavior is mutually expected between the buyer and the Glow Addict team during all shade consultations and support inquiries.
              </p>
            </div>

          </div>

        </section>

      </main>

      <Footer />
    </div>
  );
}
