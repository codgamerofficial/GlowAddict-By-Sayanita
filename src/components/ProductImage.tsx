"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";

interface ProductImageProps {
  src: string;
  alt: string;
  brand?: string;
  priority?: boolean;
}

export default function ProductImage({ src, alt, brand, priority = false }: ProductImageProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Set mounted on client to prevent hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset loading and error when source changes
  useEffect(() => {
    if (src) {
      setLoading(true);
      setError(false);
      setRetryCount(0);
    } else {
      setError(true);
      setLoading(false);
    }
  }, [src]);

  // Compute initials fallback
  const initials = useMemo(() => {
    if (!brand) return "GA";
    const cleanBrand = brand.replace(/[^a-zA-Z0-9\s]/g, "");
    const parts = cleanBrand.trim().toUpperCase().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] || "") + (parts[1][0] || "");
    }
    return brand.slice(0, 2).toUpperCase() || "GA";
  }, [brand]);

  // Premium background colors tailored to brand initials - rebranded to light peach/pink
  const gradientClass = useMemo(() => {
    const chars = initials.split("");
    const sum = (chars[0]?.charCodeAt(0) || 0) + (chars[1]?.charCodeAt(0) || 0);
    const options = [
      "from-[#FFF0F5] via-[#FFF5F7] to-white",
      "from-[#FFF5F7] via-[#FFF0F5] to-white",
      "from-white via-[#FFF0F5] to-[#FFF5F7]",
      "from-[#FFF5F7] via-white to-[#FFF0F5]"
    ];
    return options[sum % options.length];
  }, [initials]);

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    if (retryCount < 2) {
      // Silent retry with increasing delay
      setTimeout(() => {
        setRetryCount((prev) => prev + 1);
      }, (retryCount + 1) * 800);
    } else {
      setLoading(false);
      setError(true);
    }
  };

  // 1. Shimmer/Loading skeleton state - light themed
  const loadingPlaceholder = (
    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#FFF5F7] to-[#FFF0F5] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FC2779]/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
      <Sparkles size={16} className="text-brand-magenta/30 animate-pulse" />
    </div>
  );

  // 2. Luxury initials fallback monogram - light themed
  const luxuryFallback = (
    <div className={`w-full h-full bg-gradient-to-br ${gradientClass} border border-brand-rose flex flex-col items-center justify-center relative p-6 select-none text-center transition-all duration-500`}>
      <div className="absolute inset-0 bg-radial-gradient from-brand-rose/20 via-transparent to-transparent pointer-events-none" />
      <div className="w-14 h-14 rounded-full bg-gradient-to-b from-white to-[#FFF5F7] border border-brand-rose flex items-center justify-center shadow-md text-xl font-black text-brand-magenta font-elegant tracking-wider z-10 hover:scale-105 transition-transform duration-300">
        {initials}
      </div>
      <span className="text-[9px] font-black text-brand-magenta uppercase tracking-widest z-10 mt-3 flex items-center gap-1">
        <Sparkles size={8} className="text-brand-magenta" />
        {brand || "GLOW ADDICT"}
      </span>
    </div>
  );

  // Before hydration, render loading placeholder to prevent layout shift & hydration mismatch
  if (!mounted) {
    return (
      <div className="relative w-full h-full aspect-square bg-[#FFF5F7] overflow-hidden">
        {loadingPlaceholder}
      </div>
    );
  }

  if (error || !src) {
    return luxuryFallback;
  }

  return (
    <div className="relative w-full h-full bg-[#FFF5F7] overflow-hidden select-none aspect-square">
      
      {/* Skeleton displays only when loading */}
      {loading && loadingPlaceholder}

      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-w-768px) 100vw, (max-w-1200px) 50vw, 33vw"
        priority={priority}
        onLoad={handleLoad}
        onError={handleError}
        className={`object-cover transition-all duration-700 ${
          loading ? "scale-105 blur-lg opacity-40" : "scale-100 blur-0 opacity-100"
        }`}
        unoptimized
      />
    </div>
  );
}
