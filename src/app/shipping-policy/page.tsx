"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Truck, ShieldAlert, ArrowLeft } from "lucide-react";

export default function ShippingPolicy() {
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
            <span className="text-[10px] font-bold text-brand-magenta uppercase tracking-wider">Glow Addict Courier Logistics</span>
            <h1 className="text-2xl sm:text-3xl font-elegant text-amethyst">
              Shipping & Delivery Policy
            </h1>
            <p className="text-[11px] text-foreground/50">Last updated: May 2026</p>
          </div>

          <div className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-sans space-y-6">
            
            {/* Policy item 1 */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-amethyst font-sans uppercase tracking-wider flex items-center gap-1.5">
                <Truck size={16} className="text-brand-magenta shrink-0" />
                1. Delivery Timeframe
              </h3>
              <p className="pl-5 leading-relaxed">
                Standard delivery and courier transit time typically takes **approximately 4 to 15 business days** from order date. This timeframe varies depending on product availability, global importing queues, and courier shipping nodes.
              </p>
            </div>

            {/* Policy item 2 */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-amethyst font-sans uppercase tracking-wider flex items-center gap-1.5">
                <Truck size={16} className="text-brand-magenta shrink-0" />
                2. Shipping Rates & Free Delivery
              </h3>
              <ul className="list-disc pl-10 space-y-1.5 font-sans">
                <li>Orders **below ₹799** will incur a flat shipping and handling charge of **₹39**.</li>
                <li>Orders **above ₹799** are eligible for **FREE DELIVERY** across India!</li>
              </ul>
            </div>

            {/* Policy item 3 */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-amethyst font-sans uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert size={16} className="text-brand-magenta shrink-0" />
                3. Delays & Unforeseen Events
              </h3>
              <p className="pl-5 leading-relaxed">
                While we process and package all skincare items within 24 hours of payment verification, potential courier delays due to harsh weather conditions, local cargo issues, major national festivals, or unforeseen logistical limitations are beyond our direct control. We appreciate your patience.
              </p>
            </div>

            {/* Policy item 4 */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-amethyst font-sans uppercase tracking-wider flex items-center gap-1.5">
                <Truck size={16} className="text-brand-magenta shrink-0" />
                4. Tracking & Courier Partners
              </h3>
              <p className="pl-5 leading-relaxed">
                We partner with leading Indian logistics aggregators (such as Shiprocket, Delhivery, Pickrr). Once Sayanita verifies your prepaid UPI reference ID, packages are dispatched and a **dynamic tracking ID is instantly linked in your customer dashboard**.
              </p>
            </div>

          </div>

        </section>

      </main>

      <Footer />
    </div>
  );
}
