"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export default function Terms() {
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
            <span className="text-[10px] font-bold text-brand-magenta uppercase tracking-wider">Glow Addict Legal Agreement</span>
            <h1 className="text-2xl sm:text-3xl font-elegant text-amethyst">
              Terms & Conditions
            </h1>
            <p className="text-[11px] text-foreground/50">Last updated: May 2026</p>
          </div>

          <div className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-sans space-y-5">
            <p>
              Welcome to Glow Addict by Sayanita. By browsing or purchasing skincare items from our store, you agree to comply with and be bound by the following Terms & Conditions.
            </p>

            <h3 className="text-sm font-bold text-amethyst uppercase tracking-wider pt-2">1. Transaction and Payment Terms</h3>
            <p>
              Glow Addict processes prepaid orders verified through manual UPI reference numbers or dynamic GPay QR codes. Buyers are solely obligated to input accurate 12-digit transaction numbers. Failures or fraud transactions are reported immediately and result in order cancellation.
            </p>

            <h3 className="text-sm font-bold text-amethyst uppercase tracking-wider pt-2">2. Accuracy of Skincare Specifications</h3>
            <p>
              We guarantee 100% genuine products. However, individual skincare routine outcomes vary depending on skin compatibility, hormonal levels, and climate. Customers are advised to utilize the **AI Skin Test** or seek a direct Instagram shade consultation prior to ordering.
            </p>

            <h3 className="text-sm font-bold text-amethyst uppercase tracking-wider pt-2">3. Buyer Unboxing Obligation</h3>
            <p>
              As outlined in our store policies, you strictly agree to film a continuous unboxing video of your parcel. Claims regarding damaged or missing items without this unedited video evidence are legally void.
            </p>

            <h3 className="text-sm font-bold text-amethyst uppercase tracking-wider pt-2">4. Intellectual Property</h3>
            <p>
              All logo assets, graphics, freebies creatives, and unique UI themes are intellectual properties of Glow Addict by Sayanita and Sayanita Payra.
            </p>
          </div>

        </section>

      </main>

      <Footer />
    </div>
  );
}
