"use client";

import { useEffect } from "react";

/**
 * Applies the user's saved theme preference immediately after mount.
 * Uses CSS @media prefers-color-scheme as the default in globals.css,
 * then overrides with the user's explicit localStorage choice.
 */
export function ThemeInit() {
  useEffect(() => {
    // 1. Initialize Theme Preferences
    try {
      const savedTheme = localStorage.getItem("glow_theme");
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch {
      /* SSR / localStorage unavailable — ignore */
    }

    // 2. Global Unhandled Rejection Safeguard
    const handleRejection = (event: PromiseRejectionEvent) => {
      const msg = event.reason?.message || "";
      const name = event.reason?.name || "";
      
      if (
        msg.includes("Failed to fetch") || 
        name === "TypeError" || 
        msg.includes("network error") ||
        msg.includes("NetworkError") ||
        msg.includes("refresh_token_not_found")
      ) {
        // Prevent background offline/ad-blocker Supabase failures from displaying stack traces in console
        event.preventDefault();
      }
    };

    window.addEventListener("unhandledrejection", handleRejection);
    return () => {
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return null;
}
