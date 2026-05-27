"use client";

import React from "react";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Heart, Sparkles, ShieldCheck, Mail, ArrowRight } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fdfafb] mesh-gradient">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* Editorial Brand Intro */}
        <section className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-magenta">The Heart of Glow Addict</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-elegant text-amethyst">
            A Girl's Girl Promise
          </h1>
          <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed font-sans">
            Glow Addict by Sayanita was born from a simple realization: premium self-care shouldn't be an exclusive luxury. We believe every woman deserves to be celebrated, seen, and cherished.
          </p>
        </section>

        {/* Sayanita Photo & Message */}
        <section className="bg-white border border-brand-rose/25 rounded-3xl p-6 sm:p-10 shadow-md glow-card grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative overflow-hidden">
          
          <div className="absolute -right-20 -bottom-20 opacity-5 w-96 h-96 pointer-events-none">
            <Image src="/logo.png" alt="" fill className="object-contain" />
          </div>

          {/* Sayanita Avatar Frame Left */}
          <div className="md:col-span-5 flex flex-col items-center space-y-3">
            <div className="relative w-48 h-48 rounded-2xl overflow-hidden border-2 border-brand-rose/40 shadow-xs bg-zinc-50 flex items-center justify-center p-2">
              <Image
                src="/logo.png"
                alt="Sayanita Payra - Founder"
                fill
                className="object-contain p-3"
              />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold font-elegant text-amethyst">Sayanita Payra</h3>
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-magenta">Founder & Curator</span>
            </div>
          </div>

          {/* Founder Message Right */}
          <div className="md:col-span-7 space-y-4 text-left text-xs sm:text-sm leading-relaxed text-foreground/80 font-sans">
            <h4 className="text-base font-bold text-amethyst font-elegant flex items-center gap-1.5">
              Message from Sayanita
              <Sparkles size={16} className="text-brand-magenta" />
            </h4>
            <p className="italic font-light">
              "As a girl’s girl, I realized that many women adore the ritual of self-care, but the high price of authentic products often stands in the way."
            </p>
            <p className="italic font-light">
              "That’s why I created Glow Addict by Sayanita—an opportunity to indulge in genuine, premium skincare at a price within reach. With each order, I ensure you receive not just authentic products, but also the personalized attention you deserve. Every woman should feel celebrated, seen, and cherished—because your self-care journey matters."
            </p>
            <div className="pt-2">
              <a
                href="https://instagram.com/glow_addict_by_sayanita"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-magenta hover:underline"
              >
                Join our Instagram community
                <ArrowRight size={12} />
              </a>
            </div>
          </div>

        </section>

        {/* Brand Core Pillars */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          
          {/* Pillar 1 */}
          <div className="bg-white border border-brand-rose/20 rounded-2xl p-5 space-y-2.5 shadow-2xs glow-card">
            <div className="p-2.5 bg-brand-cream text-brand-magenta rounded-full inline-block">
              <ShieldCheck size={20} />
            </div>
            <h4 className="font-bold text-amethyst text-xs uppercase tracking-wider font-sans">100% Authenticity</h4>
            <p className="text-[11px] text-foreground/75 leading-relaxed font-sans">
              We import directly from official global manufacturer nodes. Absolutely zero copies, duplicates, or fake bottles. Guaranteed.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white border border-brand-rose/20 rounded-2xl p-5 space-y-2.5 shadow-2xs glow-card">
            <div className="p-2.5 bg-brand-cream text-brand-magenta rounded-full inline-block">
              <Heart size={20} />
            </div>
            <h4 className="font-bold text-amethyst text-xs uppercase tracking-wider font-sans">Curated Care</h4>
            <p className="text-[11px] text-foreground/75 leading-relaxed font-sans">
              Every package is wrapped cleanly with safe seals and includes custom accessories like handmade crochet gifts or lip shades.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white border border-brand-rose/20 rounded-2xl p-5 space-y-2.5 shadow-2xs glow-card">
            <div className="p-2.5 bg-brand-cream text-brand-magenta rounded-full inline-block">
              <Mail size={20} />
            </div>
            <h4 className="font-bold text-amethyst text-xs uppercase tracking-wider font-sans">Support Channel</h4>
            <p className="text-[11px] text-foreground/75 leading-relaxed font-sans">
              Direct founder consultations on Instagram and WhatsApp to match you with correct shade variants and skin-routine items.
            </p>
          </div>

        </section>

      </main>

      <Footer />
    </div>
  );
}
