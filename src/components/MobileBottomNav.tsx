"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useShop } from "@/context/ShopContext";
import { Home, ShoppingBag, Sparkles, Heart, User, Sun, Moon } from "lucide-react";

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const { wishlist, theme, toggleTheme } = useShop();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Shop", href: "/shop", icon: ShoppingBag },
    { label: "AI Test", href: "/ai-skin-test", icon: Sparkles, highlight: true },
    { label: "Wishlist", href: "/wishlist", icon: Heart, count: wishlist.length },
    { label: "Orders", href: "/dashboard", icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-[#120018]/90 backdrop-blur-lg border-t border-brand-rose/25 dark:border-[#C77DFF]/15 px-4 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] flex justify-between items-center shadow-lg">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-2xl transition-all duration-300 relative ${
              item.highlight
                ? "text-brand-magenta dark:text-brand-magenta scale-105"
                : isActive
                ? "text-amethyst dark:text-foreground scale-102"
                : "text-foreground/50 dark:text-foreground/45"
            }`}
          >
            <div className={`relative p-1.5 rounded-full ${item.highlight ? "bg-brand-rose/65 dark:bg-brand-rose/10 border border-brand-rose/40 animate-pulse" : ""}`}>
              <Icon size={18} className={isActive && !item.highlight ? "stroke-[2.5px]" : "stroke-[2px]"} />
              
              {/* Badge for counts */}
              {item.count !== undefined && item.count > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-brand-gradient text-[8px] font-bold text-white ring-1 ring-white dark:ring-[#120018]">
                  {item.count}
                </span>
              )}
            </div>
            
            <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5 font-sans scale-90">
              {item.label}
            </span>

            {/* Active Line indicator */}
            {isActive && !item.highlight && (
              <span className="absolute bottom-0 h-0.75 w-4 bg-brand-gradient rounded-full" />
            )}
          </Link>
        );
      })}

      {/* Tiny floating theme switcher in mobile nav */}
      <button
        onClick={toggleTheme}
        className="flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-2xl text-foreground/50 dark:text-foreground/45 cursor-pointer"
        aria-label="Toggle theme"
      >
        <div className="p-1.5">
          {theme === "dark" ? (
            <Sun size={18} className="text-yellow-400" />
          ) : (
            <Moon size={18} className="text-amethyst" />
          )}
        </div>
        <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5 font-sans scale-90">
          Theme
        </span>
      </button>
    </div>
  );
};
