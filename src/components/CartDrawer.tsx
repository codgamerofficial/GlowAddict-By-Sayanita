"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useShop } from "@/context/ShopContext";
import { X, Trash2, Plus, Minus, Gift, ShoppingCart, Truck } from "lucide-react";

export const CartDrawer: React.FC = () => {
  const {
    cart,
    cartOpen,
    setCartOpen,
    updateCartQuantity,
    removeFromCart,
    getCartSubtotal,
    getDeliveryCharge,
    getEligibleFreebies
  } = useShop();

  const [freebieChoice, setFreebieChoice] = useState<"15ml Face Wash" | "Crochet Keychain">("15ml Face Wash");

  // Save freebie choice to localStorage so checkout can read it
  useEffect(() => {
    localStorage.setItem("glow_freebie_choice", freebieChoice);
  }, [freebieChoice]);

  if (!cartOpen) return null;

  const subtotal = getCartSubtotal();
  const delivery = getDeliveryCharge();
  const freebies = getEligibleFreebies();
  const total = subtotal + delivery;

  // Calculate tier levels
  const progressToScrunchies = Math.min(100, (subtotal / 799) * 100);
  const progressToLipstick = Math.min(100, (subtotal / 1299) * 100);
  const progressToChoice = Math.min(100, (subtotal / 1499) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={() => setCartOpen(false)} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md transform transition-all duration-500 ease-in-out bg-white dark:bg-[#12051d] shadow-2xl flex flex-col h-full">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-brand-rose/20 bg-brand-cream flex items-center justify-between">
            <h2 className="text-xl font-bold font-elegant text-amethyst flex items-center gap-2">
              <ShoppingCart size={20} className="text-brand-magenta" />
              Your Self-Care Bag
            </h2>
            <button
              onClick={() => setCartOpen(false)}
              className="p-1 rounded-full text-foreground/80 hover:bg-brand-rose/20 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Drawer Body - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            
            {/* 🎁 FREEBIE ELIGIBILITY METER */}
            {cart.length > 0 && (
              <div className="bg-brand-cream/80 p-5 rounded-2xl border border-brand-rose/30 space-y-4 shadow-xs glow-card">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-brand-magenta flex items-center gap-1.5 font-sans">
                    <Gift size={14} className="animate-bounce" />
                    Freebie Rewards Meter
                  </h3>
                  <span className="text-xs font-bold text-amethyst">
                    Bag Total: ₹{subtotal}
                  </span>
                </div>

                {/* Progress bar container */}
                <div className="space-y-4">
                  
                  {/* Tier 1: ₹799+ Scrunchies */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-medium ${freebies.scrunchies ? "text-brand-magenta font-semibold" : "text-foreground/75"}`}>
                        🌸 ₹799+ Tier: Free Scrunchies & Free Delivery
                      </span>
                      <span>{subtotal >= 799 ? "Unlocked! 🎉" : `₹${subtotal}/₹799`}</span>
                    </div>
                    <div className="w-full bg-brand-rose/30 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-brand-gradient h-full transition-all duration-500"
                        style={{ width: `${progressToScrunchies}%` }}
                      />
                    </div>
                    {subtotal < 799 && (
                      <p className="text-[10px] text-amethyst/85 font-medium italic">
                        Add ₹{799 - subtotal} more for Free Shipping & Scrunchies!
                      </p>
                    )}
                  </div>

                  {/* Tier 2: ₹1299+ Lipstick */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-medium ${freebies.lipstick ? "text-brand-magenta font-semibold" : "text-foreground/75"}`}>
                        💄 ₹1299+ Tier: Elegant Free Lipstick
                      </span>
                      <span>{subtotal >= 1299 ? "Unlocked! 🎉" : `₹${subtotal}/₹1299`}</span>
                    </div>
                    <div className="w-full bg-brand-rose/30 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-brand-gradient h-full transition-all duration-500"
                        style={{ width: `${progressToLipstick}%` }}
                      />
                    </div>
                    {subtotal >= 799 && subtotal < 1299 && (
                      <p className="text-[10px] text-amethyst/85 font-medium italic">
                        Add ₹{1299 - subtotal} more for a beautiful Free Lipstick!
                      </p>
                    )}
                  </div>

                  {/* Tier 3: ₹1499+ Choice */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-medium ${freebies.choiceAllowed ? "text-brand-magenta font-semibold" : "text-foreground/75"}`}>
                        🎁 ₹1499+ Tier: Choice of Face Wash OR Crochet Item
                      </span>
                      <span>{subtotal >= 1499 ? "Unlocked! 🎉" : `₹${subtotal}/₹1499`}</span>
                    </div>
                    <div className="w-full bg-brand-rose/30 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-brand-gradient h-full transition-all duration-500"
                        style={{ width: `${progressToChoice}%` }}
                      />
                    </div>
                    {subtotal >= 1299 && subtotal < 1499 && (
                      <p className="text-[10px] text-amethyst/85 font-medium italic">
                        Add ₹{1499 - subtotal} more to select your ultimate premium free gift!
                      </p>
                    )}
                  </div>

                </div>

                {/* Freebie item selection dropdown */}
                {freebies.choiceAllowed && (
                  <div className="mt-4 pt-3 border-t border-brand-rose/30 space-y-2">
                    <label className="text-xs font-semibold text-amethyst block">
                      Select your Free Premium Gift:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setFreebieChoice("15ml Face Wash")}
                        className={`text-xs px-3 py-2.5 rounded-lg border font-semibold transition-all duration-300 ${
                          freebieChoice === "15ml Face Wash"
                            ? "bg-brand-gradient text-white border-transparent shadow-xs"
                            : "bg-white text-amethyst border-brand-rose hover:bg-brand-cream"
                        }`}
                      >
                        🧴 15ml Face Wash
                      </button>
                      <button
                        onClick={() => setFreebieChoice("Crochet Keychain")}
                        className={`text-xs px-3 py-2.5 rounded-lg border font-semibold transition-all duration-300 ${
                          freebieChoice === "Crochet Keychain"
                            ? "bg-brand-gradient text-white border-transparent shadow-xs"
                            : "bg-white text-amethyst border-brand-rose hover:bg-brand-cream"
                        }`}
                      >
                        🧶 Crochet Keychain
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cart Items List */}
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="p-4 rounded-full bg-brand-cream text-brand-rose">
                  <ShoppingCart size={48} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold font-elegant text-amethyst">Your bag is empty</h3>
                  <p className="text-xs text-foreground/60 max-w-xs mt-1">
                    Authentic premium skincare is waiting for you. Let's start celebrating your self-care journey!
                  </p>
                </div>
                <button
                  onClick={() => setCartOpen(false)}
                  className="px-6 py-2.5 rounded-full text-xs font-semibold bg-brand-gradient text-white hover:bg-brand-gradient-hover shadow-xs transition-all duration-300"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item, idx) => (
                  <div
                    key={`${item.product.id}-${item.selectedShade || idx}`}
                    className="flex gap-4 p-4 rounded-xl border border-brand-rose/25 bg-white glow-card"
                  >
                    {/* Item Image */}
                    <div className="relative w-20 h-20 overflow-hidden rounded-lg bg-gray-100 flex-shrink-0">
                      <Image
                        src={item.product.image}
                        alt={item.product.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-bold text-foreground/90 font-sans tracking-wide line-clamp-1">
                            {item.product.title}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product.id, item.selectedShade)}
                            className="p-1 rounded-full text-foreground/40 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <p className="text-[10px] uppercase font-bold tracking-wider text-brand-magenta mt-0.5">
                          {item.product.brand}
                        </p>
                        {item.selectedShade && (
                          <span className="inline-block text-[9px] font-bold px-2 py-0.5 bg-brand-cream text-brand-magenta border border-brand-rose/40 rounded-full mt-1.5">
                            Shade: {item.selectedShade}
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls & Price */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 bg-brand-cream/60 rounded-full border border-brand-rose/20 p-0.5">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.selectedShade, item.quantity - 1)}
                            className="p-1 rounded-full text-amethyst hover:bg-white transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-xs font-bold px-2.5 text-amethyst">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.selectedShade, item.quantity + 1)}
                            className="p-1 rounded-full text-amethyst hover:bg-white transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-foreground/45 line-through">
                            ₹{item.product.mrp * item.quantity}
                          </span>
                          <span className="text-xs font-bold text-amethyst block -mt-1">
                            ₹{item.product.price * item.quantity}
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* Checkout Panel Footer */}
          {cart.length > 0 && (
            <div className="border-t border-brand-rose/20 bg-brand-cream/40 p-6 space-y-4">
              
              {/* Fees Summary */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-foreground/80">
                  <span>Cart Subtotal:</span>
                  <span className="font-semibold text-amethyst">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-xs text-foreground/80 items-center">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Truck size={14} className="text-brand-magenta" />
                    Delivery Charge:
                  </span>
                  <span className="font-semibold text-amethyst">
                    {delivery === 0 ? (
                      <span className="text-brand-magenta font-bold uppercase">FREE</span>
                    ) : (
                      `₹${delivery}`
                    )}
                  </span>
                </div>

                {/* Freebies summary block */}
                <div className="bg-white/80 dark:bg-[#12051d]/80 p-3 rounded-xl border border-brand-rose/20 dark:border-brand-rose/5 space-y-1">
                  <p className="text-[10px] font-bold text-brand-magenta uppercase tracking-wider flex items-center gap-1">
                    <Gift size={12} /> Unlocked Freebies:
                  </p>
                  <ul className="text-[10px] space-y-1 text-foreground/80 font-medium">
                    {freebies.scrunchies && <li className="flex items-center gap-1 text-green-600">✓ Free Scrunchies</li>}
                    {freebies.lipstick && <li className="flex items-center gap-1 text-green-600">✓ Free Lipstick</li>}
                    {freebies.choiceAllowed && (
                      <li className="flex items-center gap-1 text-green-600 font-semibold">
                        ✓ Choice Gift: {freebieChoice}
                      </li>
                    )}
                    {!freebies.scrunchies && <li className="text-foreground/45 italic">No freebies unlocked yet. Shop more to get rewards!</li>}
                  </ul>
                </div>

                <div className="flex justify-between text-sm font-bold border-t border-brand-rose/20 pt-3 text-amethyst">
                  <span>Grand Total:</span>
                  <span>₹{total}</span>
                </div>
              </div>

              {/* Checkout button */}
              <Link
                href="/checkout"
                onClick={() => setCartOpen(false)}
                className="w-full flex items-center justify-center py-3 bg-brand-gradient hover:bg-brand-gradient-hover text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Proceed to Checkout
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
