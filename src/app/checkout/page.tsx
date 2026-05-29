"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useShop, Order } from "@/context/ShopContext";
import ProductImage from "@/components/ProductImage";
import { Header } from "@/components/Header";
import { ShieldCheck, Truck, CreditCard, Copy, Upload, CheckCircle2, Gift, ShieldAlert, RefreshCw, Lock, CheckCheck } from "lucide-react";

export default function Checkout() {
  type GiftChoice = "15ml Face Wash" | "Crochet Keychain";

  const router = useRouter();
  const {
    cart,
    getCartSubtotal,
    getDeliveryCharge,
    getEligibleFreebies,
    placeOrder,
    confirmPayment,
    settings
  } = useShop();

  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zipCode: ""
  });

  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "COD">("UPI");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  
  // UPI confirmation states
  const [upiTxnId, setUpiTxnId] = useState("");
  const [screenshotSelected, setScreenshotSelected] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // COD Email verification states
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", ""]);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(30);
  const [otpCanResend, setOtpCanResend] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpSuccess, setOtpSuccess] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const [mounted, setMounted] = useState(false);

  // Pincode checking states (Myntra/Nykaa style!)
  const [zipChecking, setZipChecking] = useState(false);
  const [zipChecked, setZipChecked] = useState(false);
  const [zipMessage, setZipMessage] = useState("");
  const [zipStatus, setZipStatus] = useState<"success" | "warning" | "error" | null>(null);
  const [isZipCodSupported, setIsZipCodSupported] = useState(true);
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState("");

  // Post-order success states
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  const [couponInput, setCouponInput] = useState("");
  const [couponApplied, setCouponApplied] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState("");

  const subtotal = getCartSubtotal();

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    const code = couponInput.trim().toUpperCase();
    
    if (!code) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    if (code === "GLOW10") {
      const discount = Math.round(subtotal * 0.1);
      setDiscountAmount(discount);
      setCouponApplied("GLOW10");
    } else if (code === "AUTHENTIC") {
      if (subtotal < 500) {
        setCouponError("AUTHENTIC coupon requires a minimum purchase of ₹500.");
        return;
      }
      setDiscountAmount(100);
      setCouponApplied("AUTHENTIC");
    } else if (code === "FESTIVE20") {
      const discount = Math.round(subtotal * 0.2);
      setDiscountAmount(discount);
      setCouponApplied("FESTIVE20");
    } else {
      setCouponError("Invalid coupon code.");
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(null);
    setDiscountAmount(0);
    setCouponInput("");
    setCouponError("");
  };

  const deliveryCharge = getDeliveryCharge();
  const freebies = getEligibleFreebies();
  
  // Read freebie choice from localStorage (hydrate after mount to avoid SSR mismatch)
  const [giftChoice, setGiftChoice] = useState<GiftChoice>("15ml Face Wash");

  useEffect(() => {
    setMounted(true);
    const choice = localStorage.getItem("glow_freebie_choice");
    if (choice === "Crochet Keychain") setGiftChoice(choice);
  }, []);

  // Redirect if cart is empty and no order has been created in this session
  useEffect(() => {
    if (cart.length === 0 && !createdOrder) {
      router.push("/");
    }
  }, [cart, createdOrder, router]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText("sayanitapayra-1@okicici");
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!policyAccepted) {
      alert("Please review and accept our Glow Addict store policy first.");
      return;
    }

    // Validation checks
    if (!addressForm.name || !addressForm.phone || !addressForm.address || !addressForm.city || !addressForm.state || !addressForm.zipCode) {
      alert("Please fill in all shipping details.");
      return;
    }

    if (paymentMethod === "COD" && settings.codEnabled && !otpVerified) {
      // Trigger COD OTP verification modal
      openOtpModal();
      return;
    }

    // Create order directly
    const order = placeOrder(
      addressForm,
      paymentMethod,
      freebies.choiceAllowed ? giftChoice : undefined,
      couponApplied || undefined,
      discountAmount
    );
    setCreatedOrder(order);
  };

  const buildWhatsAppMessage = (order: Order) => {
    const itemsText = order.items
      .map(
        (item) =>
          `• ${item.product.title} ${
            item.selectedShade ? `[Shade: ${item.selectedShade}]` : ""
          } (Qty: ${item.quantity})`
      )
      .join("\n");

    const freebiesList: string[] = [];
    if (order.freebies.scrunchies) freebiesList.push("Free Hair Scrunchies 🌸");
    if (order.freebies.lipstick) freebiesList.push("Free Elegant Lipstick 💄");
    if (order.freebies.choice) freebiesList.push(`Choice Premium Gift: ${order.freebies.choice} 🎁`);
    const freebiesText = freebiesList.length > 0 ? freebiesList.map((f) => `- ${f}`).join("\n") : "None";

    const msg = `✨ *Glow Addict by Sayanita — New Order Confirmation* ✨

*Order ID:* ${order.id}
*Date:* ${new Date(order.created_at).toLocaleDateString()}

*Customer Details:*
- Name: ${order.shipping_address.name}
- Phone: ${order.shipping_address.phone}
- Email: ${order.shipping_address.email}

*Shipping Address:*
${order.shipping_address.address}, ${order.shipping_address.city}, ${order.shipping_address.state} - ${order.shipping_address.zipCode}

*Items Ordered:*
${itemsText}

*Unlocked Freebies:*
${freebiesText}

*Grand Total:* ₹${order.total_amount}${order.coupon_code ? `\n*Coupon Applied:* ${order.coupon_code} (-₹${order.discount_amount})` : ""}
*Payment Channel:* ${order.payment_method}
*Payment Status:* ${order.payment_status === "paid" ? "Paid (Verified)" : "Pending Verification (Ref / Screenshot attached)"}

🌸 Thank you for shopping with Glow Addict! Sayanita is packaging your premium skincare bundle with love. 🌸`;

    return encodeURIComponent(msg);
  };

  const triggerWhatsAppRedirect = (order: Order) => {
    const text = buildWhatsAppMessage(order);
    const waUrl = `https://wa.me/918509326600?text=${text}`;
    window.open(waUrl, "_blank");
  };

  // Pincode validation & auto-population (Myntra/Nykaa style)
  const checkPincode = useCallback(async (pincode: string) => {
    const cleanPin = pincode.replace(/\D/g, "").slice(0, 6);
    if (cleanPin.length < 6) {
      setZipChecked(false);
      setZipMessage("");
      setZipStatus(null);
      setIsZipCodSupported(true);
      setEstimatedDeliveryDate("");
      return;
    }

    setZipChecking(true);
    setZipMessage("Checking delivery availability...");
    setZipStatus(null);

    // Simulated network verification delay for rich tactile loading feel
    await new Promise((resolve) => setTimeout(resolve, 600));

    setZipChecking(false);
    setZipChecked(true);

    // Map prefix to key tier cities & states for 0-click auto-fill
    let autoCity = "";
    let autoState = "";
    let codAllowed = true;
    let days = 3;

    if (cleanPin.startsWith("700")) {
      autoCity = "Kolkata";
      autoState = "West Bengal";
      days = 2;
    } else if (cleanPin.startsWith("751")) {
      autoCity = "Bhubaneswar";
      autoState = "Odisha";
      days = 3;
    } else if (cleanPin.startsWith("110")) {
      autoCity = "New Delhi";
      autoState = "Delhi";
      days = 2;
    } else if (cleanPin.startsWith("400")) {
      autoCity = "Mumbai";
      autoState = "Maharashtra";
      days = 2;
    } else if (cleanPin.startsWith("560")) {
      autoCity = "Bengaluru";
      autoState = "Karnataka";
      days = 2;
    } else if (cleanPin.startsWith("600")) {
      autoCity = "Chennai";
      autoState = "Tamil Nadu";
      days = 3;
    } else if (cleanPin.startsWith("380")) {
      autoCity = "Ahmedabad";
      autoState = "Gujarat";
      days = 3;
    } else if (cleanPin.startsWith("201") || cleanPin.startsWith("208")) {
      autoCity = "Noida / Kanpur";
      autoState = "Uttar Pradesh";
      days = 3;
    }

    // Auto-fill City & State in state form
    if (autoCity && autoState) {
      setAddressForm((prev) => ({
        ...prev,
        city: prev.city || autoCity,
        state: prev.state || autoState,
      }));
    }

    // Remote delivery zones: block COD
    if (
      cleanPin.startsWith("19") || 
      cleanPin.startsWith("79") || 
      cleanPin === "700144" || 
      cleanPin === "110099"
    ) {
      codAllowed = false;
      setIsZipCodSupported(false);
      setZipStatus("warning");
      setZipMessage(`⚠️ COD is currently restricted for remote location pincode: ${cleanPin}. Please use Prepaid UPI (FREE Delivery & free gifts!) to check out.`);
      setPaymentMethod("UPI"); // Auto fallback to UPI
    } else {
      setIsZipCodSupported(true);
      setZipStatus("success");
      setZipMessage(`✓ COD & Express Shipping Available! Delivered in ${days} days.`);
      
      const date = new Date();
      date.setDate(date.getDate() + days);
      const options: Intl.DateTimeFormatOptions = { weekday: "long", month: "short", day: "numeric" };
      setEstimatedDeliveryDate(date.toLocaleDateString("en-IN", options));
    }
  }, []);

  // Mask email for display: pri***@gmail.com
  const getMaskedEmail = useCallback(() => {
    const email = addressForm.email.trim();
    if (!email || !email.includes("@")) return email || "your email";
    const [local, domain] = email.split("@");
    const masked = local.length <= 3 ? local[0] + "***" : local.slice(0, 3) + "***";
    return `${masked}@${domain}`;
  }, [addressForm.email]);

  // Send verification code via server API
  const [emailSending, setEmailSending] = useState(false);

  const sendVerificationEmail = useCallback(async () => {
    const email = addressForm.email.trim();
    if (!email) {
      setOtpError("Please enter your email address first.");
      return false;
    }
    setEmailSending(true);
    try {
      const res = await fetch("/api/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setOtpError(data.error || "Failed to send verification email.");
        return false;
      }
      // Real production OTP email verification triggered
      return true;
    } catch {
      setOtpError("Network error. Please check your connection.");
      return false;
    } finally {
      setEmailSending(false);
    }
  }, [addressForm.email]);

  // Start countdown timer
  const startCountdown = useCallback(() => {
    setOtpCountdown(30);
    setOtpCanResend(false);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setOtpCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          setOtpCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Open OTP modal — sends the email first
  const openOtpModal = useCallback(async () => {
    setOtpDigits(["", "", "", ""]);
    setOtpError("");
    setOtpVerifying(false);
    setOtpSuccess(false);
    setShowOtpModal(true);

    const sent = await sendVerificationEmail();
    if (sent) {
      startCountdown();
    }
    // Focus first input after render
    setTimeout(() => otpInputRefs.current[0]?.focus(), 150);
  }, [sendVerificationEmail, startCountdown]);

  // Handle individual OTP digit input
  const handleOtpDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
    setOtpError("");
    // Auto-focus next input
    if (digit && index < 3) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste support
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pastedData.length > 0) {
      const newDigits = ["", "", "", ""];
      for (let i = 0; i < pastedData.length; i++) {
        newDigits[i] = pastedData[i];
      }
      setOtpDigits(newDigits);
      setOtpError("");
      const focusIdx = Math.min(pastedData.length, 3);
      otpInputRefs.current[focusIdx]?.focus();
    }
  };

  // Resend verification code
  const handleResendOtp = async () => {
    setOtpDigits(["", "", "", ""]);
    setOtpError("");
    const sent = await sendVerificationEmail();
    if (sent) {
      startCountdown();
    }
    otpInputRefs.current[0]?.focus();
  };

  // Verify OTP via server API
  const handleVerifyOtp = async () => {
    const enteredCode = otpDigits.join("");
    if (enteredCode.length < 4) {
      setOtpError("Please enter all 4 digits");
      return;
    }

    setOtpVerifying(true);
    setOtpError("");

    try {
      const res = await fetch("/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: addressForm.email.trim(),
          code: enteredCode,
        }),
      });
      const data = await res.json();

      if (data.verified) {
        setOtpVerifying(false);
        setOtpSuccess(true);
        if (countdownRef.current) clearInterval(countdownRef.current);

        // Auto-transition after success animation
        setTimeout(() => {
          setOtpVerified(true);
          setShowOtpModal(false);
          setOtpSuccess(false);

          // Proceed with order creation
          const order = placeOrder(
            addressForm,
            "COD",
            freebies.choiceAllowed ? giftChoice : undefined,
            couponApplied || undefined,
            discountAmount
          );
          setCreatedOrder(order);

          setTimeout(() => {
            triggerWhatsAppRedirect(order);
          }, 500);
        }, 1800);
      } else {
        setOtpVerifying(false);
        setOtpError(data.error || "Incorrect code. Please check and try again.");
        setOtpDigits(["", "", "", ""]);
        setTimeout(() => otpInputRefs.current[0]?.focus(), 200);
      }
    } catch {
      setOtpVerifying(false);
      setOtpError("Verification failed. Please try again.");
    }
  };

  // Cleanup countdown on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const handleSubmitPrepaidReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdOrder) return;

    if (!upiTxnId) {
      alert("Please enter your 12-digit UPI transaction reference ID.");
      return;
    }

    setUploading(true);
    try {
      let screenshotUrl: string | undefined;

      if (screenshotFile) {
        const formData = new FormData();
        formData.append("file", screenshotFile);
        formData.append("orderId", createdOrder.id);

        const res = await fetch("/api/upload/payment-screenshot", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          screenshotUrl = data.url;
        }
      }

      // Submit payment verification
      confirmPayment(createdOrder.id, upiTxnId, screenshotUrl);
      
      alert(`Thank you! Payment submission received for order ${createdOrder.id}. Sayanita will verify your transaction shortly.`);
      
      // Redirect order details on WhatsApp
      triggerWhatsAppRedirect({
        ...createdOrder,
        upi_transaction_id: upiTxnId,
        payment_status: "pending_verification"
      });

      router.push("/dashboard");
    } catch {
      alert("Failed to upload screenshot. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (createdOrder) {
    // prepaid success payment window
    if (createdOrder.payment_method === "UPI") {
      const upiUrl = `upi://pay?pa=sayanitapayra-1@okicici&pn=Glow%20Addict%20by%20Sayanita&am=${createdOrder.total_amount}&cu=INR`;
      const dynamicQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`;

      return (
        <div className="min-h-screen flex flex-col bg-[#fdfafb] mesh-gradient">
          <Header />
          <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-10 space-y-8">
            
            <div className="bg-white border border-brand-rose/25 rounded-3xl p-6 sm:p-10 shadow-md text-center space-y-6 glow-card">
              <div className="flex justify-center text-brand-magenta">
                <CheckCircle2 size={56} className="animate-bounce" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold font-elegant text-amethyst">
                  Order Successfully Placed!
                </h2>
                <p className="text-xs text-brand-magenta font-semibold uppercase tracking-wider">
                  Order ID: {createdOrder.id} • Grand Total: ₹{createdOrder.total_amount}
                </p>
                <p className="text-xs text-foreground/60 max-w-md mx-auto">
                  To complete your order confirmation, please make payment of <strong>₹{createdOrder.total_amount}</strong> using one of the quick UPI options below and upload your payment details.
                </p>
              </div>

              {/* Dynamic QR & Static QR comparison carousels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 items-center">
                
                {/* Dynamic QR Block */}
                <div className="p-4 bg-brand-cream border border-brand-rose/30 rounded-2xl flex flex-col items-center space-y-3">
                  <span className="text-[10px] font-bold text-amethyst uppercase font-sans tracking-wide">
                    Option 1: Direct Dynamic QR
                  </span>
                  <div className="relative w-48 h-48 bg-white p-2 rounded-lg border border-brand-rose/20 flex items-center justify-center">
                    <Image
                      src={dynamicQrUrl}
                      alt="Glow Addict Dynamic Checkout QR"
                      width={250}
                      height={250}
                      className="w-full h-full object-contain"
                      unoptimized
                    />
                  </div>
                  <p className="text-[9px] text-foreground/50 leading-relaxed max-w-[180px]">
                    Auto-configured with total amount <strong>₹{createdOrder.total_amount}</strong>. Scan to pay instantly.
                  </p>
                </div>

                {/* Static GPay QR Image Block */}
                <div className="p-4 bg-brand-cream border border-brand-rose/30 rounded-2xl flex flex-col items-center space-y-3">
                  <span className="text-[10px] font-bold text-amethyst uppercase font-sans tracking-wide">
                    Option 2: Personal Google Pay QR
                  </span>
                  <div className="relative w-48 h-48 rounded-lg overflow-hidden border border-brand-rose/20 shadow-xs bg-white">
                    <Image
                      src="/payment_qr.jpg"
                      alt="Sayanita UPI payment QR"
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                  <p className="text-[9px] text-foreground/50 leading-relaxed max-w-[180px]">
                    Scan Sayanita Payra's official Google Pay card. Enter ₹{createdOrder.total_amount} manually.
                  </p>
                </div>

              </div>

              {/* Manual copy block */}
              <div className="bg-brand-cream/60 p-4 rounded-xl border border-brand-rose/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                <div>
                  <span className="text-[10px] text-foreground/50 block">Official UPI Merchant ID:</span>
                  <span className="text-xs font-bold text-amethyst font-sans">sayanitapayra-1@okicici</span>
                </div>
                <button
                  onClick={handleCopyUpi}
                  className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white bg-brand-gradient hover:scale-105 transition-transform px-4 py-2.5 rounded-lg"
                >
                  <Copy size={12} />
                  {copiedUpi ? "Copied!" : "Copy UPI ID"}
                </button>
              </div>

              {/* Payment Details submission form */}
              <form onSubmit={handleSubmitPrepaidReceipt} className="border-t border-brand-rose/20 pt-6 space-y-4 text-left">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amethyst">
                  Confirm Payment Details
                </h3>

                <div className="space-y-3.5">
                  
                  {/* UPI transaction reference ID */}
                  <div>
                    <label className="text-[11px] font-semibold text-foreground/70 block mb-1">
                      UPI Ref No. / Transaction ID (12-digit numeric) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 614829302195"
                      value={upiTxnId}
                      onChange={(e) => setUpiTxnId(e.target.value.replace(/\D/g, "").slice(0, 12))}
                      className="w-full text-xs px-3.5 py-3 rounded-lg border border-brand-rose/30 focus:border-brand-magenta outline-hidden bg-[#fdfafb]"
                    />
                  </div>

                  {/* Screenshot file uploader (Simulated) */}
                  <div>
                    <label className="text-[11px] font-semibold text-foreground/70 block mb-1">
                      Upload Payment Screenshot (Optional but recommended)
                    </label>
                    <div className="relative border border-dashed border-brand-rose/50 bg-brand-cream/20 hover:bg-brand-cream/40 transition-colors p-6 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            setScreenshotFile(f);
                            setScreenshotSelected(true);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Upload size={22} className="text-brand-magenta" />
                      <span className="text-xs font-semibold text-amethyst mt-1.5">
                        {screenshotSelected ? "✓ Screenshot attached" : "Click to select or drop screenshot"}
                      </span>
                      <span className="text-[9px] text-foreground/45 mt-0.5">JPEG, PNG up to 5MB</span>
                    </div>
                  </div>

                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full py-3.5 bg-brand-gradient hover:bg-brand-gradient-hover text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all duration-300 disabled:opacity-60"
                >
                  {uploading ? "Uploading..." : "Submit Payment Details"}
                </button>
              </form>

            </div>

          </main>
        </div>
      );
    } else {
      // COD Success window
      return (
        <div className="min-h-screen flex flex-col bg-[#fdfafb] mesh-gradient">
          <Header />
          <main className="flex-1 w-full max-w-xl mx-auto px-4 py-16 text-center space-y-6">
            <div className="bg-white border border-brand-rose/25 rounded-3xl p-6 sm:p-10 shadow-md space-y-6 glow-card">
              <div className="flex justify-center text-green-500">
                <CheckCircle2 size={56} className="animate-bounce" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold font-elegant text-amethyst">
                  Order Successfully Placed!
                </h2>
                <p className="text-xs text-brand-magenta font-semibold uppercase tracking-wider">
                  Order ID: {createdOrder.id} • COD Grand Total: ₹{createdOrder.total_amount}
                </p>
                <p className="text-xs text-foreground/60 max-w-md mx-auto leading-relaxed">
                  Your Cash on Delivery order is successfully logged as <strong>Pending Delivery Confirmation</strong>. Sayanita will pack your premium skincare package and dispatch it within 24 hours.
                </p>
              </div>

              {/* COD guidelines */}
              <div className="bg-brand-cream/50 p-4 rounded-xl border border-brand-rose/15 text-left text-xs space-y-2 font-sans text-foreground/75">
                <span className="font-bold text-amethyst flex items-center gap-1">
                  <ShieldAlert size={14} className="text-brand-magenta" />
                  Important COD Deliverables:
                </span>
                <ul className="list-disc pl-5 space-y-1 text-[11px]">
                  <li>Please prepare the exact cash amount of <strong>₹{createdOrder.total_amount}</strong> for delivery partners.</li>
                  <li>Our courier agent will require a phone call confirmation prior to arrival.</li>
                  <li>No-refunds and no-returns policy strictly applies. Unboxing video required for damage validation.</li>
                </ul>
              </div>

              <button
                onClick={() => triggerWhatsAppRedirect(createdOrder)}
                className="w-full flex items-center justify-center py-3.5 bg-[#25D366] hover:bg-[#128C7E] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 shadow-xs gap-1.5 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
                Send Order Details on WhatsApp
              </button>

              <Link
                href="/dashboard"
                className="w-full flex items-center justify-center py-3 bg-brand-gradient hover:bg-brand-gradient-hover text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 shadow-xs"
              >
                Track Your Delivery in Dashboard
              </Link>
            </div>
          </main>
        </div>
      );
    }
  }

  // STANDARD CHECKOUT FORM WORKSPACE
  const subtotalWithDelivery = subtotal + deliveryCharge;

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfafb] mesh-gradient">
      <Header />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold font-elegant text-amethyst mb-8">
          Checkout Skincare Orders
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Checkout & Address Forms */}
          <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-6">
            
            {/* 1. Shipping address section */}
            <div className="bg-white border border-brand-rose/25 rounded-3xl p-6 sm:p-8 shadow-xs glow-card space-y-4">
              <h2 className="text-base font-bold font-sans uppercase tracking-wider text-amethyst border-b border-brand-rose/20 pb-3 flex items-center gap-2">
                <Truck size={18} className="text-brand-magenta" />
                Shipping & Delivery Address
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="font-semibold text-foreground/75 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priyanjali Sen"
                    value={addressForm.name}
                    onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-brand-rose/30 focus:border-brand-magenta outline-hidden bg-[#fdfafb]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground/75 block mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 9876543210"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-brand-rose/30 focus:border-brand-magenta outline-hidden bg-[#fdfafb]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground/75 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. priyanjali@gmail.com"
                    value={addressForm.email}
                    onChange={(e) => setAddressForm({ ...addressForm, email: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-brand-rose/30 focus:border-brand-magenta outline-hidden bg-[#fdfafb]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-semibold text-foreground/75 block mb-1">Street Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apartment, House, Building, Lane"
                    value={addressForm.address}
                    onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-brand-rose/30 focus:border-brand-magenta outline-hidden bg-[#fdfafb]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground/75 block mb-1">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kolkata"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-brand-rose/30 focus:border-brand-magenta outline-hidden bg-[#fdfafb]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground/75 block mb-1">State / Region *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. West Bengal"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-brand-rose/30 focus:border-brand-magenta outline-hidden bg-[#fdfafb]"
                  />
                </div>
                <div className="relative">
                  <label className="font-semibold text-foreground/75 block mb-1">ZIP / Postal Code *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. 700001"
                      value={addressForm.zipCode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                        setAddressForm({ ...addressForm, zipCode: val });
                        checkPincode(val);
                      }}
                      className="w-full px-3 py-2.5 rounded-lg border border-brand-rose/30 focus:border-brand-magenta outline-hidden bg-[#fdfafb] font-bold tracking-wide text-amethyst"
                    />
                    {zipChecking && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-brand-magenta/30 border-t-brand-magenta rounded-full animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Pincode response banners */}
                  {zipChecked && zipMessage && (
                    <div className={`mt-1.5 p-2.5 rounded-xl border text-[10px] font-semibold leading-relaxed animate-slide-in ${
                      zipStatus === "success"
                        ? "bg-green-500/5 border-green-500/20 text-green-600 dark:text-green-400"
                        : zipStatus === "warning"
                        ? "bg-amber-500/5 border-amber-500/20 text-amber-600 dark:text-amber-400"
                        : "bg-red-500/5 border-red-500/20 text-red-500"
                    }`}>
                      {zipMessage}
                      {zipStatus === "success" && estimatedDeliveryDate && (
                        <div className="mt-0.5 text-[9px] text-foreground/50">
                          Estimated Delivery: <strong className="font-bold text-amethyst">{estimatedDeliveryDate}</strong>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Payment details layout */}
            <div className="bg-white border border-brand-rose/25 rounded-3xl p-6 sm:p-8 shadow-xs glow-card space-y-4">
              <h2 className="text-base font-bold font-sans uppercase tracking-wider text-amethyst border-b border-brand-rose/20 pb-3 flex items-center gap-2">
                <CreditCard size={18} className="text-brand-magenta" />
                Select Payment Channel
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* UPI Card option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("UPI")}
                  className={`p-4 rounded-xl border-2 text-left flex items-start gap-3 transition-all duration-300 ${
                    paymentMethod === "UPI"
                      ? "border-brand-magenta bg-brand-cream/40"
                      : "border-brand-rose/20 bg-[#fdfafb] hover:bg-brand-cream/10"
                  }`}
                >
                  <div className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border flex items-center justify-center ${
                    paymentMethod === "UPI" ? "border-brand-magenta text-brand-magenta" : "border-foreground/30"
                  }`}>
                    {paymentMethod === "UPI" && <div className="h-2 w-2 rounded-full bg-brand-magenta" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amethyst block">
                      Direct UPI / Google Pay QR
                    </span>
                    <span className="text-[10px] text-foreground/50 leading-relaxed block mt-0.5">
                      Accepts dynamic QR scanning and direct merchant payments with zero transaction charges.
                    </span>
                  </div>
                </button>

                {/* COD option (Condition-based) */}
                <button
                  type="button"
                  disabled={!mounted || !settings.codEnabled || !isZipCodSupported}
                  onClick={() => setPaymentMethod("COD")}
                  className={`p-4 rounded-xl border-2 text-left flex items-start gap-3 transition-all duration-300 ${
                    mounted && (!settings.codEnabled || !isZipCodSupported)
                      ? "opacity-50 cursor-not-allowed border-gray-100 bg-gray-50/50"
                      : paymentMethod === "COD"
                      ? "border-brand-magenta bg-brand-cream/40"
                      : "border-brand-rose/20 bg-[#fdfafb] hover:bg-brand-cream/10"
                  }`}
                >
                  <div className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border flex items-center justify-center ${
                    paymentMethod === "COD" ? "border-brand-magenta text-brand-magenta" : "border-foreground/30"
                  }`}>
                    {paymentMethod === "COD" && <div className="h-2 w-2 rounded-full bg-brand-magenta" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amethyst block flex items-center gap-1 flex-wrap">
                      Cash on Delivery (COD)
                      {mounted && !settings.codEnabled && (
                        <span className="text-[8px] font-extrabold text-foreground/45 bg-gray-200 px-1.5 py-0.5 rounded-full border border-gray-300">Disabled by Store</span>
                      )}
                      {mounted && settings.codEnabled && !isZipCodSupported && (
                        <span className="text-[8px] font-extrabold text-red-500 bg-red-100 px-1.5 py-0.5 rounded-full border border-red-200">Restricted Pincode</span>
                      )}
                    </span>
                    <span className="text-[10px] text-foreground/50 leading-relaxed block mt-0.5">
                      Prepayment only. COD requires email verification (+ ₹{settings.codFee} delivery premium fee).
                    </span>
                  </div>
                </button>

              </div>

              {/* UPI Prepaid Note */}
              {paymentMethod === "UPI" && (
                <div className="bg-brand-cream/40 p-4 rounded-xl border border-brand-rose/15 flex gap-3 items-start">
                  <ShieldCheck size={18} className="text-brand-magenta shrink-0" />
                  <p className="text-[11px] leading-relaxed text-foreground/75 font-sans">
                    <strong>Prepaid Security Process:</strong> Once you click place order, we generate a Dynamic GPay QR for scanning. After sending payment, you upload the transaction receipt reference so Sayanita can pack and ship.
                  </p>
                </div>
              )}
            </div>

            {/* 3. Refund terms agreement checkbox */}
            <div className="bg-white border border-brand-rose/25 rounded-3xl p-5 sm:p-6 shadow-xs glow-card space-y-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  required
                  id="chk-policy"
                  checked={policyAccepted}
                  onChange={(e) => setPolicyAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded-sm border-brand-rose text-brand-magenta focus:ring-brand-magenta"
                />
                <label htmlFor="chk-policy" className="text-[11px] leading-relaxed text-foreground/75 font-sans cursor-pointer select-none">
                  I reviewed and accept the strict <strong className="text-amethyst">Glow Addict Store Policy</strong>: "No return, no exchange, and no refund policy. Once an order is confirmed, cancellation is not allowed. A continuous unboxing video is strictly required for any damage/missing disputes." *
                </label>
              </div>
            </div>

            {/* Place Order Submit */}
            <button
              type="submit"
              className="w-full py-4 bg-brand-gradient hover:bg-brand-gradient-hover text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all duration-300"
            >
              {paymentMethod === "UPI" ? "Confirm Order & Pay Now" : "Confirm COD Order"}
            </button>

          </form>

          {/* Right Column: Order Summary Card */}
          <div className="lg:col-span-5 bg-white border border-brand-rose/25 rounded-3xl p-6 sm:p-8 shadow-xs glow-card space-y-6">
            <h2 className="text-base font-bold font-sans uppercase tracking-wider text-amethyst border-b border-brand-rose/20 pb-3">
              Order Summary
            </h2>

            {/* Cart Items List */}
            <div className="divide-y divide-brand-rose/15 max-h-60 overflow-y-auto pr-1">
              {cart.map((item, idx) => (
                <div key={idx} className="py-3 flex gap-3 items-center justify-between text-xs">
                  <div className="flex gap-2.5 items-center">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-zinc-50 border border-brand-rose/10 flex-shrink-0">
                      <ProductImage
                        src={item.product.image}
                        alt={item.product.title}
                        brand={item.product.brand}
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-amethyst line-clamp-1 max-w-[150px]">{item.product.title}</h4>
                      <p className="text-[9px] uppercase tracking-wider text-brand-magenta mt-0.5">Qty: {item.quantity} {item.selectedShade && `• Shade: ${item.selectedShade}`}</p>
                    </div>
                  </div>
                  <span className="font-bold text-amethyst">₹{item.product.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Freebies reward unlocked listing */}
            <div className="bg-brand-cream/50 p-4 rounded-2xl border border-brand-rose/20 space-y-2">
              <span className="text-[10px] font-bold text-brand-magenta uppercase tracking-wider flex items-center gap-1 font-sans">
                <Gift size={12} className="animate-bounce" />
                Your Rewards Included:
              </span>
              <ul className="text-[10px] space-y-1.5 font-medium text-foreground/80">
                {freebies.scrunchies ? (
                  <li className="flex items-center gap-1.5 text-green-600">✓ Free Scrunchies (₹799+ Tier)</li>
                ) : (
                  <li className="text-foreground/40 italic">Add products above ₹799 to get free gifts.</li>
                )}
                {freebies.lipstick && <li className="flex items-center gap-1.5 text-green-600">✓ Free Lipstick (₹1299+ Tier)</li>}
                {freebies.choiceAllowed && (
                  <li className="flex items-center gap-1.5 text-green-600 font-bold">
                    ✓ Choice Premium Gift: {giftChoice} (₹1499+ Tier)
                  </li>
                )}
              </ul>
            </div>

            {/* Promo / Coupon Code Section */}
            <div className="bg-brand-cream/35 border border-brand-rose/20 rounded-2xl p-4 space-y-3">
              <span className="text-[10px] font-bold text-amethyst uppercase tracking-wider block font-sans">
                Apply Promo Code
              </span>
              
              {!couponApplied ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. GLOW10"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value);
                      setCouponError("");
                    }}
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-brand-rose/30 focus:border-brand-magenta outline-hidden bg-[#fdfafb] uppercase font-bold tracking-wide text-amethyst"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 bg-brand-gradient hover:bg-brand-gradient-hover text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all duration-300 shrink-0 cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-xs font-semibold">
                  <span className="flex items-center gap-1">
                    ✓ Code <strong className="font-bold">{couponApplied}</strong> Applied
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-[10px] text-red-500 hover:text-red-700 font-bold uppercase tracking-wide cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}
              {couponError && (
                <p className="text-[10px] text-red-500 font-bold">{couponError}</p>
              )}
              <p className="text-[9px] text-foreground/45 leading-relaxed">
                Try codes: <strong className="font-bold text-brand-magenta">GLOW10</strong> (10% off), <strong className="font-bold text-brand-magenta">AUTHENTIC</strong> (₹100 off on min ₹500), or <strong className="font-bold text-brand-magenta">FESTIVE20</strong> (20% off).
              </p>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 border-t border-brand-rose/20 pt-4 text-xs">
              <div className="flex justify-between text-foreground/75">
                <span>Subtotal:</span>
                <span className="font-semibold text-amethyst">₹{subtotal}</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Coupon Discount ({couponApplied}):</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between text-foreground/75 items-center">
                <span>Delivery Charge:</span>
                <span className="font-semibold text-amethyst">
                  {deliveryCharge === 0 ? (
                    <span className="text-brand-magenta font-bold uppercase">FREE</span>
                  ) : (
                    `₹${deliveryCharge}`
                  )}
                </span>
              </div>
              {paymentMethod === "COD" && settings.codEnabled && (
                <div className="flex justify-between text-foreground/75">
                  <span>COD Handling Fee:</span>
                  <span className="font-semibold text-amethyst">₹{settings.codFee}</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm font-bold border-t border-brand-rose/20 pt-3 text-amethyst">
                <span>Grand Total:</span>
                <span>₹{Math.max(0, subtotal - discountAmount) + deliveryCharge + (paymentMethod === "COD" && settings.codEnabled ? settings.codFee : 0)}</span>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* PREMIUM COD OTP VERIFICATION MODAL */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden otp-modal-overlay">
          {/* Elegant dark overlay with subtle blur */}
          <div
            className="absolute inset-0 otp-backdrop"
            onClick={() => {
              if (!otpVerifying && !otpSuccess) {
                setShowOtpModal(false);
                if (countdownRef.current) clearInterval(countdownRef.current);
              }
            }}
          />

          {/* Floating modal with luxury glassmorphism */}
          <div className={`relative otp-modal-container max-w-[380px] w-full mx-4 text-center ${
            otpError && !otpVerifying ? 'otp-shake' : ''
          }`}>
            {/* Floating glow behind modal */}
            <div className="absolute -inset-4 rounded-[2.5rem] otp-modal-glow pointer-events-none" />

            <div className="relative otp-modal-glass rounded-[2rem] p-7 sm:p-9 space-y-6 overflow-hidden">
              {/* Decorative top gradient strip */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-brand-gradient rounded-t-[2rem]" />

              {/* SUCCESS STATE */}
              {otpSuccess ? (
                <div className="py-6 space-y-4 otp-success-enter">
                  <div className="relative mx-auto w-20 h-20">
                    <div className="absolute inset-0 rounded-full otp-success-ring" />
                    <div className="absolute inset-2 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center otp-success-check">
                      <CheckCheck size={32} className="text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-xl font-bold font-elegant text-emerald-500 dark:text-emerald-400">
                      Verified Successfully
                    </h3>
                    <p className="text-[11px] text-foreground/50">
                      Placing your order now...
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <div className="otp-placing-dots flex gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 otp-dot-bounce" style={{animationDelay:'0ms'}} />
                      <span className="w-2 h-2 rounded-full bg-emerald-400 otp-dot-bounce" style={{animationDelay:'150ms'}} />
                      <span className="w-2 h-2 rounded-full bg-emerald-400 otp-dot-bounce" style={{animationDelay:'300ms'}} />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Icon */}
                  <div className="relative mx-auto w-16 h-16">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-magenta/20 to-amethyst/20 animate-pulse" />
                    <div className="absolute inset-1.5 rounded-full bg-gradient-to-br from-brand-magenta/10 to-amethyst/10 flex items-center justify-center">
                      <Lock size={24} className="text-brand-magenta" />
                    </div>
                  </div>

                  {/* Header */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold font-elegant text-amethyst dark:text-brand-lilac">
                      Verify Your Email
                    </h3>
                    <p className="text-[11px] text-foreground/50 max-w-[280px] mx-auto leading-relaxed">
                      We sent a 4-digit verification code to
                    </p>
                    <p className="text-xs font-bold text-amethyst dark:text-brand-rose tracking-wide flex items-center justify-center gap-1.5">
                      ✉️
                      {getMaskedEmail()}
                    </p>
                  </div>

                  {/* 4-Box OTP Input */}
                  <div className="space-y-3">
                    <div className="flex justify-center gap-3">
                      {otpDigits.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => { otpInputRefs.current[index] = el; }}
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          onPaste={index === 0 ? handleOtpPaste : undefined}
                          disabled={otpVerifying}
                          className={`otp-digit-input w-14 h-14 text-center text-xl font-bold rounded-xl border-2 outline-hidden transition-all duration-200 ${
                            otpVerifying
                              ? 'border-amethyst/30 bg-amethyst/5 text-amethyst/40 cursor-wait'
                              : digit
                              ? 'border-brand-magenta bg-brand-magenta/5 text-amethyst dark:text-white shadow-[0_0_15px_rgba(236,72,153,0.15)]'
                              : 'border-brand-rose/40 dark:border-brand-lilac/20 bg-white/50 dark:bg-white/5 text-amethyst dark:text-white focus:border-brand-magenta focus:shadow-[0_0_20px_rgba(236,72,153,0.2)]'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Error or Dev Fallback Hint */}
                    {otpError ? (
                      <p className="text-[11px] text-red-500 dark:text-red-400 font-semibold flex items-center justify-center gap-1">
                        <ShieldAlert size={12} />
                        {otpError}
                      </p>
                    ) : null}
                  </div>

                  {/* Countdown + Resend */}
                  <div className="flex items-center justify-center gap-2 text-[11px]">
                    {emailSending ? (
                      <span className="text-foreground/40 font-medium flex items-center gap-1.5">
                        <RefreshCw size={11} className="animate-spin" />
                        Sending code to your email...
                      </span>
                    ) : otpCanResend ? (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="flex items-center gap-1 text-brand-magenta hover:text-amethyst font-semibold transition-colors cursor-pointer"
                      >
                        <RefreshCw size={11} />
                        Resend Code
                      </button>
                    ) : (
                      <span className="text-foreground/40 font-medium tabular-nums">
                        Resend in <span className="text-amethyst dark:text-brand-lilac font-bold">{otpCountdown}s</span>
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowOtpModal(false);
                        if (countdownRef.current) clearInterval(countdownRef.current);
                      }}
                      disabled={otpVerifying}
                      className="flex-1 py-3 rounded-xl border border-brand-rose/30 dark:border-brand-lilac/15 text-xs font-semibold text-amethyst dark:text-brand-lilac hover:bg-brand-cream/30 dark:hover:bg-white/5 transition-all duration-200 disabled:opacity-40 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={otpVerifying || otpDigits.join("").length < 4}
                      className="flex-1 py-3 rounded-xl bg-brand-gradient text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-brand-magenta/20 hover:shadow-brand-magenta/35 transition-all duration-300 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {otpVerifying ? (
                        <>
                          <div className="otp-spinner w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={14} />
                          Verify & Place
                        </>
                      )}
                    </button>
                  </div>

                  {/* Trust footer */}
                  <p className="text-[9px] text-foreground/30 flex items-center justify-center gap-1">
                    <Lock size={8} />
                    Secured by Glow Addict • Your data is encrypted
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
