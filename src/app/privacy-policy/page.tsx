"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
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
            <span className="text-[10px] font-bold text-brand-magenta uppercase tracking-wider">Glow Addict Compliance</span>
            <h1 className="text-2xl sm:text-3xl font-elegant text-amethyst">
              Privacy Policy
            </h1>
            <p className="text-[11px] text-foreground/50">Last updated: May 2026</p>
          </div>

          <div className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-sans space-y-5">
            <p>
              At Glow Addict by Sayanita, we are deeply committed to protecting your privacy. This Privacy Policy details how we collect, safeguard, and verify your personal data when shopping on our platform.
            </p>

            <h3 className="text-sm font-bold text-amethyst uppercase tracking-wider pt-2">1. Information We Collect</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Contact Details:</strong> Your name, phone number, shipping address, and email for courier logistics and checkout.</li>
              <li><strong>AI Skin Test Selfie:</strong> Selfie photos uploaded to our AI Skin Analyzer. These are routed securely to Google Gemini APIs for analysis and are **never stored permanently**.</li>
              <li><strong>Payment Evidence:</strong> UPI transaction reference numbers and payment screenshots uploaded to verify prepayments.</li>
            </ul>

            <h3 className="text-sm font-bold text-amethyst uppercase tracking-wider pt-2">2. How We Protect Your Data</h3>
            <p>
              Your data is stored securely in encrypted Supabase database instances. Payment screenshots and unboxing videos are stored in secure buckets accessible strictly by the admin team to confirm fulfillment claims.
            </p>

            <h3 className="text-sm font-bold text-amethyst uppercase tracking-wider pt-2">3. Third-Party Integrations</h3>
            <p>
              We share shipping addresses exclusively with verified Indian logistics networks (e.g. Shiprocket) to execute parcel delivery. We never sell, trade, or rent your database records to advertising agencies.
            </p>
          </div>

        </section>

      </main>

      <Footer />
    </div>
  );
}
