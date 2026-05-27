"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Mail, MessageCircle, Send, ShieldCheck } from "lucide-react";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setName("");
      setEmail("");
      setMessage("");
      setSubmitted(false);
      alert("Inquiry successfully logged! Sayanita will respond to your email shortly.");
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfafb] mesh-gradient">
      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* Intro */}
        <section className="text-center max-w-xl mx-auto space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-magenta">Always Here For You</span>
          <h1 className="text-3xl sm:text-4xl font-elegant text-amethyst">
            Contact Support & Consultations
          </h1>
          <p className="text-xs sm:text-sm text-foreground/60 leading-relaxed font-sans">
            Need shade-matching advice? Have queries about order statuses or shipping guidelines? Sayanita is personally available across official channels.
          </p>
        </section>

        {/* Channels + Form */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left: Contact Channels */}
          <div className="md:col-span-5 space-y-6">
            <h2 className="text-sm font-bold font-sans uppercase tracking-wider text-amethyst border-b border-brand-rose/25 pb-3">
              Official Channels
            </h2>

            <div className="space-y-4 text-xs font-sans">
              
              {/* WhatsApp */}
              <a 
                href="https://wa.me/918509326600?text=Hi%20Sayanita!%20I'm%20shopping%20on%20Glow%20Addict%20and%20need%20assistance."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-brand-rose/20 hover:border-brand-magenta transition-all glow-card"
              >
                <div className="p-2.5 bg-green-50 text-green-500 rounded-full shrink-0">
                  <MessageCircle size={20} />
                </div>
                <div className="text-left">
                  <span className="font-bold text-amethyst block">Founder's WhatsApp</span>
                  <span className="text-[10px] text-foreground/50 block mt-0.5">+91 85093 26600</span>
                </div>
              </a>

              {/* Instagram */}
              <a 
                href="https://instagram.com/glow_addict_by_sayanita"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-brand-rose/20 hover:border-brand-magenta transition-all glow-card"
              >
                <div className="p-2.5 bg-pink-50 text-pink-500 rounded-full shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                </div>
                <div className="text-left">
                  <span className="font-bold text-amethyst block">Instagram Account</span>
                  <span className="text-[10px] text-foreground/50 block mt-0.5">@glow_addict_by_sayanita</span>
                </div>
              </a>

              {/* Email */}
              <a 
                href="mailto:sayanitapayra@gmail.com"
                className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-brand-rose/20 hover:border-brand-magenta transition-all glow-card"
              >
                <div className="p-2.5 bg-blue-50 text-blue-500 rounded-full shrink-0">
                  <Mail size={20} />
                </div>
                <div className="text-left">
                  <span className="font-bold text-amethyst block">Direct Support Email</span>
                  <span className="text-[10px] text-foreground/50 block mt-0.5">sayanitapayra@gmail.com</span>
                </div>
              </a>

            </div>

            {/* Shield Check banner */}
            <div className="flex gap-2 items-start text-left bg-brand-cream/50 p-4 rounded-2xl border border-brand-rose/15 text-[10px] text-foreground/75">
              <ShieldCheck size={16} className="text-brand-magenta shrink-0 mt-0.5" />
              <p className="leading-relaxed font-sans">
                <strong>Authenticity Pledge:</strong> We deal only in 100% genuine and verified global skincare formulas. Glow Addict does not support or sell first-copy/fake items.
              </p>
            </div>

          </div>

          {/* Right: Contact Form */}
          <div className="md:col-span-7 bg-white border border-brand-rose/25 rounded-3xl p-6 sm:p-8 shadow-xs glow-card space-y-4">
            <h2 className="text-sm font-bold font-sans uppercase tracking-wider text-amethyst border-b border-brand-rose/20 pb-3">
              Drop Sayanita an Inquiry
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs text-left">
              
              <div className="space-y-1">
                <label className="font-semibold text-foreground/75 block">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Sen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-brand-rose/30 focus:border-brand-magenta outline-hidden bg-[#fdfafb]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground/75 block">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ananya@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-brand-rose/30 focus:border-brand-magenta outline-hidden bg-[#fdfafb]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground/75 block">Your Inquiry / Skincare Concern</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Ask Sayanita about lip mask shades, toner routines, or custom combo gifting..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-brand-rose/30 focus:border-brand-magenta outline-hidden bg-[#fdfafb] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitted}
                className="w-full py-3 bg-brand-gradient hover:bg-brand-gradient-hover text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 shadow-xs flex items-center justify-center gap-1.5"
              >
                <Send size={12} />
                {submitted ? "Sending Inquiry..." : "Submit Inquiry"}
              </button>

            </form>
          </div>

        </section>

      </main>

      <Footer />
    </div>
  );
}
