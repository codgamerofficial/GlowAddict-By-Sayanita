"use client";

import React from "react";
import Link from "next/link";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-amethyst dark:bg-[#0c0314] text-white/90 border-t border-brand-rose/25 dark:border-brand-rose/5 py-12 mt-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 text-left text-xs">
        
        {/* Brand identity column */}
        <div className="space-y-4 md:col-span-1">
          <h3 className="text-base font-bold font-elegant tracking-widest text-brand-rose">Glow Addict</h3>
          <p className="text-[11px] text-white/70 max-w-xs leading-relaxed font-light">
            Indulge in 100% genuine, premium skincare from global brands. Curated with love, packaged with care, and priced within reach.
          </p>
        </div>

        {/* Explore Links column */}
        <div className="space-y-3.5">
          <h4 className="font-bold text-brand-rose uppercase tracking-wider text-[11px]">Explore Store</h4>
          <ul className="space-y-2 text-white/70 font-medium">
            <li>
              <Link href="/shop" className="hover:text-white hover:underline transition-all">Shop Skincare</Link>
            </li>
            <li>
              <Link href="/collections" className="hover:text-white hover:underline transition-all">Collections</Link>
            </li>
            <li>
              <Link href="/ai-skin-test" className="hover:text-white hover:underline transition-all">AI Skin Test</Link>
            </li>
            <li>
              <Link href="/wishlist" className="hover:text-white hover:underline transition-all">My Wishlist</Link>
            </li>
          </ul>
        </div>

        {/* Support & Policies Links column */}
        <div className="space-y-3.5">
          <h4 className="font-bold text-brand-rose uppercase tracking-wider text-[11px]">Policies & Trust</h4>
          <ul className="space-y-2 text-white/70 font-medium">
            <li>
              <Link href="/store-policy" className="hover:text-white hover:underline transition-all">Store Policy</Link>
            </li>
            <li>
              <Link href="/shipping-policy" className="hover:text-white hover:underline transition-all">Shipping Policy</Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="hover:text-white hover:underline transition-all">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white hover:underline transition-all">Terms & Conditions</Link>
            </li>
          </ul>
        </div>

        {/* Support details column */}
        <div className="space-y-3.5">
          <h4 className="font-bold text-brand-rose uppercase tracking-wider text-[11px]">Customer Care</h4>
          <ul className="space-y-2 text-white/70 font-medium">
            <li>
              <Link href="/about" className="hover:text-white hover:underline transition-all">About Sayanita</Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white hover:underline transition-all">Contact Us</Link>
            </li>
            <li>📧 Email: sayanitapayra@gmail.com</li>
            <li>💬 Instagram: @glow_addict_by_sayanita</li>
          </ul>
        </div>

      </div>

      {/* Trademark block */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/10 pt-6 mt-8 flex flex-col sm:flex-row justify-between items-center text-[10px] text-white/50">
        <p>© {new Date().getFullYear()} Glow Addict by Sayanita. Curated with premium girl's girl love.</p>
        <p className="mt-2 sm:mt-0 font-medium text-brand-rose/65">Authentic Global Skincare Storefront</p>
      </div>

    </footer>
  );
};
