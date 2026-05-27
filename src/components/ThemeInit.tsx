"use client";

import { useEffect } from "react";

/**
 * Applies the user's saved theme preference immediately after mount.
 * Uses CSS @media prefers-color-scheme as the default in globals.css,
 * then overrides with the user's explicit localStorage choice.
 */
export function ThemeInit() {
  useEffect(() => {
    try {
      const stored = localStorage.getItem("glow_theme");
      if (
        stored === "dark" ||
        (!stored &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      ) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch {
      /* SSR / localStorage unavailable — ignore */
    }
  }, []);

  return null;
}
