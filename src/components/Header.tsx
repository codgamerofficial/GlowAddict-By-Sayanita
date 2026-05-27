"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useShop } from "@/context/ShopContext";
import { ShoppingBag, Menu, X, User, ShieldAlert, Heart, Sparkles, Sun, Moon } from "lucide-react";

export const Header: React.FC = () => {
  const { cart, setCartOpen, wishlist, theme, toggleTheme, user, isAdmin } = useShop();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => pathname === path;

  const cartItemsCount = cart.reduce((count, item) => count + item.quantity, 0);

  const linkClass = (path: string) => 
    `relative text-[11px] font-extrabold uppercase tracking-widest transition-all duration-300 py-1.5 flex flex-col items-center group ${
      isActive(path)
        ? "text-brand-magenta dark:text-[#E056FD]"
        : "text-foreground/80 dark:text-orchid-text-muted hover:text-brand-magenta dark:hover:text-white"
    }`;

  const dotIndicator = (path: string) =>
    isActive(path) ? (
      <span className="absolute -bottom-1 h-1.5 w-1.5 rounded-full bg-brand-magenta dark:bg-[#E056FD] shadow-[0_0_8px_#E056FD]" />
    ) : (
      <span className="absolute -bottom-1 h-1.5 w-0 rounded-full bg-brand-magenta dark:bg-[#E056FD] group-hover:w-1.5 transition-all duration-300" />
    );

  return (
    <header className="sticky top-0 z-40 w-full bg-white/70 dark:bg-[#120018]/65 backdrop-blur-md border-b border-brand-rose/25 dark:border-[#C77DFF]/10 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand Identity */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-12 h-12 overflow-hidden rounded-full border border-brand-rose/50 dark:border-[#C77DFF]/20 bg-white dark:bg-white/10 group-hover:scale-105 transition-transform duration-300">
                <Image
                  src="/logo.png"
                  alt="Glow Addict by Sayanita"
                  fill
                  sizes="48px"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-semibold tracking-wider font-elegant text-amethyst dark:text-foreground">
                  Glow Addict
                </span>
                <span className="text-[10px] tracking-widest uppercase font-sans text-brand-magenta dark:text-brand-magenta/90 -mt-1 font-medium">
                  by Sayanita
                </span>
              </div>
            </Link>
          </div>
 
          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex space-x-8 items-center select-none">
            <Link href="/shop" className={linkClass("/shop")}>
              Shop Catalog
              {dotIndicator("/shop")}
            </Link>
            <Link href="/collections" className={linkClass("/collections")}>
              Collections
              {dotIndicator("/collections")}
            </Link>
            <Link
              href="/ai-skin-test"
              className={`text-[11px] font-extrabold uppercase tracking-widest transition-all duration-300 flex items-center gap-1.5 px-4.5 py-1.5 rounded-full border shadow-2xs hover:scale-102 ${
                isActive("/ai-skin-test")
                  ? "bg-[#2A093D] border-[#E056FD] text-[#E056FD]"
                  : "bg-brand-cream/80 dark:bg-[#2A093D]/30 border-brand-rose/50 dark:border-[#C77DFF]/15 text-amethyst dark:text-[#C77DFF] hover:border-brand-magenta hover:text-brand-magenta dark:hover:text-white"
              }`}
            >
              <Sparkles size={11} className={isActive("/ai-skin-test") ? "text-[#E056FD]" : "text-brand-magenta"} />
              AI Skin Test
            </Link>
            <Link href="/dashboard" className={linkClass("/dashboard")}>
              <span className="flex items-center gap-1">
                <User size={13} />
                My Orders
              </span>
              {dotIndicator("/dashboard")}
            </Link>
            <Link href="/admin" className={linkClass("/admin")}>
              <span className="flex items-center gap-1">
                <ShieldAlert size={13} />
                Admin
              </span>
              {dotIndicator("/admin")}
            </Link>
          </nav>
 
          {/* Interactive Utility Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full text-foreground/90 hover:text-brand-magenta hover:bg-brand-cream dark:hover:bg-brand-cream/10 transition-all duration-300 group cursor-pointer"
              aria-label="Toggle visual theme"
            >
              {!mounted ? (
                <div className="w-5 h-5" />
              ) : theme === "dark" ? (
                <Sun size={20} className="group-hover:rotate-45 transition-transform duration-500 text-yellow-400" />
              ) : (
                <Moon size={20} className="group-hover:-rotate-12 transition-transform duration-500 text-amethyst" />
              )}
            </button>
 
            {/* Wishlist Button */}
            <Link
              href="/wishlist"
              className="relative p-2.5 rounded-full text-foreground/90 hover:text-brand-magenta hover:bg-brand-cream dark:hover:bg-brand-cream/10 transition-all duration-300 group"
              aria-label="Open wishlist"
            >
              <Heart size={20} className="group-hover:scale-110 transition-transform duration-300" />
              {mounted && wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-gradient text-[10px] font-bold text-white ring-2 ring-white dark:ring-[#120018]">
                  {wishlist.length}
                </span>
              )}
            </Link>
 
            {/* Bag Button */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2.5 rounded-full text-foreground/90 hover:text-brand-magenta hover:bg-brand-cream dark:hover:bg-brand-cream/10 transition-all duration-300 group cursor-pointer"
              aria-label="Open shopping cart"
              id="btn-cart-toggle"
            >
              <ShoppingBag size={20} className="group-hover:scale-110 transition-transform duration-300" />
              {mounted && cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-gradient text-[10px] font-bold text-white ring-2 ring-white dark:ring-[#120018] animate-pulse">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden rounded-full text-foreground/90 hover:bg-brand-cream dark:hover:bg-brand-cream/10 transition-colors duration-200 cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-[#120018]/95 border-b border-brand-rose/20 dark:border-brand-rose/10 py-4 px-6 animate-slide-in">
          <div className="flex flex-col space-y-3 text-xs uppercase tracking-wider font-bold">
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="text-foreground/90 hover:text-brand-magenta py-2 border-b border-brand-rose/10 dark:border-brand-rose/5"
            >
              Shop Catalog
            </Link>
            <Link
              href="/collections"
              onClick={() => setMobileMenuOpen(false)}
              className="text-foreground/90 hover:text-brand-magenta py-2 border-b border-brand-rose/10"
            >
              Collections
            </Link>
            <Link
              href="/ai-skin-test"
              onClick={() => setMobileMenuOpen(false)}
              className="text-brand-magenta py-2 border-b border-brand-rose/10 flex items-center gap-1.5"
            >
              <Sparkles size={14} />
              AI Skin Test
            </Link>
            <Link
              href="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="text-foreground/90 hover:text-brand-magenta py-2 border-b border-brand-rose/10 flex items-center gap-1.5"
            >
              <Heart size={14} />
              My Wishlist ({wishlist.length})
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="text-foreground/90 hover:text-brand-magenta py-2 border-b border-brand-rose/10 flex items-center gap-1.5"
            >
              <User size={14} />
              My Orders & Claims
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="text-amethyst hover:text-brand-magenta py-2 flex items-center gap-1.5"
            >
              <ShieldAlert size={14} />
              Admin Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
