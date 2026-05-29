"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { useShop } from "@/context/ShopContext";
import { Mail, Lock, User, Smartphone, Sparkles, AlertCircle, ShieldCheck, MailCheck, X, ArrowRight, ArrowLeft, Calendar, Heart } from "lucide-react";

export default function Signup() {
  const router = useRouter();
  const { signUpWithEmail } = useShop();

  // Step state
  const [step, setStep] = useState(1);

  // Step 1: Account setup fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 2: Beauty Profile details
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [skinType, setSkinType] = useState("normal");
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [tonePreference, setTonePreference] = useState("natural");
  const [finishPreference, setFinishPreference] = useState("dewy");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Predefined concerns list
  const concernsList = [
    "Acne & Blemishes",
    "Fine Lines & Wrinkles",
    "Pigmentation & Dark Spots",
    "Dullness & Uneven Tone",
    "Dryness & Dehydration",
    "Redness & Inflammation",
    "Clogged Pores"
  ];

  // Predefined allergies list
  const allergiesList = [
    "Synthetic Fragrances",
    "Essential Oils",
    "Parabens",
    "Sulfates",
    "Nuts / Gluten",
    "Salicylic Acid"
  ];

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !email || !password) {
      setError("Please fill in all basic registration fields first.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    setError("");
    setStep(2);
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const toggleConcern = (concern: string) => {
    setSelectedConcerns(prev =>
      prev.includes(concern) ? prev.filter(c => c !== concern) : [...prev, concern]
    );
  };

  const toggleAllergy = (allergy: string) => {
    setSelectedAllergies(prev =>
      prev.includes(allergy) ? prev.filter(a => a !== allergy) : [...prev, allergy]
    );
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const extraOnboarding = {
      gender,
      birth_date: birthDate,
      skin_type: skinType,
      skin_concerns: selectedConcerns,
      skin_allergies: selectedAllergies,
      tone_preference: tonePreference,
      finish_preference: finishPreference,
      theme_preference: "dark" as const,
      accent_color: "#FC2779", // Hot pink brand color preset
      loyalty_points: 50, // Initial registration gift points
      loyalty_tier: "Bronze" as const
    };

    try {
      const res = await signUpWithEmail(email, password, name, phone, extraOnboarding);
      if (res && res.isMock) {
        // Direct mock login redirect
        router.push("/profile");
      } else {
        // Success! Show confirmation modal requiring email verification
        setShowConfirmModal(true);
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative font-sans overflow-hidden">
      {/* Dynamic background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-brand-magenta/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-brand-rose/5 rounded-full blur-[140px] pointer-events-none" />

      <Header />

      <main className="flex-1 flex flex-col md:grid md:grid-cols-12 relative z-10">
        {/* LEFT COLUMN: Luxury Editorial Campaign Showcase */}
        <div className="hidden md:flex md:col-span-5 lg:col-span-5 bg-gradient-to-br from-brand-peach via-brand-cream to-white border-r border-brand-rose flex-col justify-between p-12 lg:p-16 relative overflow-hidden select-none">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-rose/30 rounded-full blur-3xl pointer-events-none transform translate-x-1/2 -translate-y-1/2" />
          
          {/* Logo Header */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full border border-brand-rose/60 p-1 bg-white flex items-center justify-center">
              <Image src="/logo.png" alt="Glow Addict Logo" fill className="object-cover" unoptimized />
            </div>
            <div>
              <span className="font-elegant font-bold tracking-widest text-[11px] uppercase text-foreground block">GLOW ADDICT</span>
              <span className="text-[8px] tracking-wider uppercase text-brand-magenta font-semibold block">BY SAYANITA</span>
            </div>
          </div>

          {/* Central Editorial Campaign Statement */}
          <div className="space-y-6 my-auto max-w-sm text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-rose border border-brand-rose/60 text-brand-purple text-[9px] uppercase tracking-wider font-bold animate-pulse">
              <Sparkles size={10} className="text-brand-magenta" />
              Start Your Skincare Legacy
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-extrabold font-elegant leading-[1.1] text-foreground tracking-wide">
              The premium path to a personalized <span className="bg-gradient-to-r from-brand-magenta to-brand-purple bg-clip-text text-transparent">radiance</span>.
            </h1>
            
            <p className="text-[11px] text-foreground/75 leading-relaxed font-medium">
              Create your account to initiate your skincare profile. By detailing your skin conditions, allergies, and tone preferences, we map a tailored botanical routine backed by Sayanita's rigorous testing vault.
            </p>

            {/* Visual Steps Guide */}
            <div className="space-y-3 pt-6 border-t border-brand-rose">
              <div className="flex items-center gap-3">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${step === 1 ? "bg-brand-gradient text-white shadow-xs" : "bg-brand-cream border border-brand-rose text-brand-magenta"}`}>1</span>
                <span className={`text-[10px] uppercase tracking-wider font-bold ${step === 1 ? "text-brand-magenta font-extrabold animate-pulse" : "text-foreground/60"}`}>Authentication Setup</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${step === 2 ? "bg-brand-gradient text-white animate-pulse" : "bg-brand-cream border border-brand-rose text-brand-magenta"}`}>2</span>
                <span className={`text-[10px] uppercase tracking-wider font-bold ${step === 2 ? "text-brand-magenta font-extrabold" : "text-foreground/60"}`}>Dermal Intelligence Profile</span>
              </div>
            </div>
          </div>

          {/* Editorial footer signature */}
          <div className="text-[10px] text-foreground/40 font-medium text-left">
            &copy; 2026 Glow Addict by Sayanita. All Rights Reserved.
          </div>
        </div>

        {/* RIGHT COLUMN: Dewy Interactive Form Panel */}
        <div className="flex-1 md:col-span-7 lg:col-span-7 flex items-center justify-center p-4 sm:p-8 md:p-12 relative overflow-y-auto max-h-screen">
          <div className="w-full max-w-xl bg-white/80 dark:bg-brand-cream border border-brand-rose rounded-[36px] p-6 sm:p-10 shadow-2xl backdrop-blur-lg relative overflow-hidden animate-slide-in">
            
            {/* Sparkle Dot */}
            <div className="absolute top-6 right-6 text-brand-magenta animate-pulse">
              <Sparkles size={18} />
            </div>

            {/* Mobile Onboarding Step Indicator */}
            <div className="md:hidden flex justify-between items-center mb-6 px-1">
              <span className="text-[10px] uppercase font-bold text-brand-magenta">Step {step} of 2</span>
              <span className="text-[10px] font-bold text-foreground/60">{step === 1 ? "Basic Information" : "Beauty Skincare"}</span>
            </div>

            {/* Main Headers */}
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-black font-elegant text-foreground tracking-wide">
                {step === 1 ? "Create Luxury Skincare Account" : "Map Your Beauty Profile"}
              </h3>
              <p className="text-[11px] text-foreground/60 font-medium">
                {step === 1 ? "Join Sayanita's signature self-care and authentic botanical circle." : "Tailor your catalog suggestions and unlock custom chronological skincare rituals."}
              </p>
            </div>

            {/* Error alerts */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl p-4 text-[11px] flex gap-2.5 items-start text-left mt-6 animate-pulse select-none">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span className="leading-relaxed font-semibold">{error}</span>
              </div>
            )}

            {/* STEP 1: Basic Authentication Fields */}
            {step === 1 && (
              <form onSubmit={handleNextStep} className="space-y-4 text-xs text-left mt-6">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="font-bold text-brand-magenta uppercase tracking-wider block text-[9px]">Full Name</label>
                  <div className="relative">
                    <User size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-magenta/80" />
                    <input
                      type="text"
                      required
                      placeholder="Priyanjali Sen"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-brand-rose/80 focus:border-brand-magenta outline-none bg-white text-foreground transition-all font-sans placeholder-foreground/35"
                    />
                  </div>
                </div>

                {/* Mobile Phone */}
                <div className="space-y-1.5">
                  <label className="font-bold text-brand-magenta uppercase tracking-wider block text-[9px]">Mobile Phone</label>
                  <div className="relative">
                    <Smartphone size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-magenta/80" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-brand-rose/80 focus:border-brand-magenta outline-none bg-white text-foreground transition-all font-sans placeholder-foreground/35"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="font-bold text-brand-magenta uppercase tracking-wider block text-[9px]">Email Address</label>
                  <div className="relative">
                    <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-magenta/80" />
                    <input
                      type="email"
                      required
                      placeholder="yourname@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-brand-rose/80 focus:border-brand-magenta outline-none bg-white text-foreground transition-all font-sans placeholder-foreground/35"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="font-bold text-brand-magenta uppercase tracking-wider block text-[9px]">Password</label>
                  <div className="relative">
                    <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-magenta/80" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="Choose a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-brand-rose/80 focus:border-brand-magenta outline-none bg-white text-foreground transition-all font-sans placeholder-foreground/35"
                    />
                  </div>
                </div>

                {/* Next button */}
                <button
                  type="submit"
                  className="w-full py-3.5 bg-brand-gradient hover:scale-[1.01] active:scale-[0.99] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 shadow-lg shadow-brand-magenta/20 flex items-center justify-center gap-2 cursor-pointer mt-6"
                >
                  Continue to Onboarding
                  <ArrowRight size={13} />
                </button>
              </form>
            )}

            {/* STEP 2: Beauty & Skincare Profile Fields */}
            {step === 2 && (
              <form onSubmit={handleSignup} className="space-y-4 text-xs text-left mt-6 max-h-[60vh] overflow-y-auto pr-1">
                {/* Onboarding info row: Gender & BirthDate */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-brand-magenta uppercase tracking-wider block text-[9px]">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl border border-brand-rose/80 focus:border-brand-magenta outline-none bg-white text-foreground transition-all font-sans cursor-pointer"
                    >
                      <option value="">Select gender</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="nonbinary">Non-binary</option>
                      <option value="prefer-not">Prefer not to say</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-brand-magenta uppercase tracking-wider block text-[9px]">Birth Date</label>
                    <div className="relative">
                      <Calendar size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-magenta/80 pointer-events-none" />
                      <input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-brand-rose/80 focus:border-brand-magenta outline-none bg-white text-foreground transition-all font-sans cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Skin Type Selection */}
                <div className="space-y-1.5">
                  <label className="font-bold text-brand-magenta uppercase tracking-wider block text-[9px]">Skin Type</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {["normal", "dry", "oily", "combination", "sensitive"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSkinType(type)}
                        className={`py-2 px-1 text-center rounded-lg border text-[10px] font-bold uppercase transition-all capitalize cursor-pointer ${
                          skinType === type
                            ? "bg-brand-gradient text-white border-transparent shadow-xs scale-105"
                            : "bg-brand-cream border border-brand-rose text-brand-magenta hover:border-brand-magenta/50"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skincare Concerns (Multi-Select Tags) */}
                <div className="space-y-1.5">
                  <label className="font-bold text-brand-magenta uppercase tracking-wider block text-[9px]">Skincare Concerns (Select all that apply)</label>
                  <div className="flex flex-wrap gap-2">
                    {concernsList.map((concern) => {
                      const selected = selectedConcerns.includes(concern);
                      return (
                        <button
                          key={concern}
                          type="button"
                          onClick={() => toggleConcern(concern)}
                          className={`py-1.5 px-3 rounded-full border text-[10px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                            selected
                              ? "bg-brand-gradient text-white border-transparent"
                              : "bg-brand-cream border border-brand-rose text-brand-magenta hover:border-brand-magenta/50"
                          }`}
                        >
                          <Heart size={8} className={selected ? "fill-white text-white" : "text-brand-magenta"} />
                          {concern}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sensitivities & Allergies (Multi-Select Tags) */}
                <div className="space-y-1.5">
                  <label className="font-bold text-brand-magenta uppercase tracking-wider block text-[9px]">Allergies / Ingredient Avoidance</label>
                  <div className="flex flex-wrap gap-2">
                    {allergiesList.map((allergy) => {
                      const selected = selectedAllergies.includes(allergy);
                      return (
                        <button
                          key={allergy}
                          type="button"
                          onClick={() => toggleAllergy(allergy)}
                          className={`py-1.5 px-3 rounded-full border text-[10px] font-medium transition-all cursor-pointer ${
                            selected
                              ? "bg-red-500/10 border-red-500/30 text-red-500 font-bold"
                              : "bg-brand-cream border border-brand-rose text-brand-magenta hover:border-brand-magenta/50"
                          }`}
                        >
                          {allergy}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Preference Selection (Tone & Finish) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-brand-magenta uppercase tracking-wider block text-[9px]">Tone Preference</label>
                    <select
                      value={tonePreference}
                      onChange={(e) => setTonePreference(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl border border-brand-rose/80 focus:border-brand-magenta outline-none bg-white text-foreground transition-all font-sans cursor-pointer"
                    >
                      <option value="natural">Natural Matching</option>
                      <option value="fair">Brightened / Fair</option>
                      <option value="bronze">Sun-kissed / Golden</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-brand-magenta uppercase tracking-wider block text-[9px]">Finish Preference</label>
                    <select
                      value={finishPreference}
                      onChange={(e) => setFinishPreference(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl border border-brand-rose/80 focus:border-brand-magenta outline-none bg-white text-foreground transition-all font-sans cursor-pointer"
                    >
                      <option value="dewy">Dewy Gloss / Radiant Glow</option>
                      <option value="matte">Matte / Oil Control</option>
                      <option value="satin">Satin / Natural Velvet</option>
                    </select>
                  </div>
                </div>

                {/* Action Buttons row */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="sm:col-span-4 py-3 border border-brand-rose hover:bg-brand-cream text-brand-magenta text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft size={13} />
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="sm:col-span-8 py-3.5 bg-brand-gradient hover:scale-[1.01] active:scale-[0.99] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 disabled:opacity-60 shadow-lg shadow-brand-magenta/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? "Registering Account..." : "Complete Profile & Start Glowing"}
                  </button>
                </div>
              </form>
            )}

            {/* Anti-abuse disclaimer */}
            <div className="mt-6 p-4 rounded-2xl bg-brand-cream border border-brand-rose text-left flex gap-3 text-[10px] text-foreground/75 leading-relaxed font-sans select-none">
              <ShieldCheck size={18} className="text-brand-magenta shrink-0 mt-0.5" />
              <p className="font-medium">
                Registering grants you an automatic onboarding gift of 50 loyalty points. Accounts require verified unboxing video uploads to resolve claims.
              </p>
            </div>

            {/* Switch to login */}
            <p className="text-[10px] text-foreground/60 pt-6 text-center font-sans">
              Already have a luxury account?{" "}
              <Link href="/login" className="text-brand-magenta font-extrabold hover:underline">
                Log In
              </Link>
            </p>

          </div>
        </div>
      </main>

      {/* 📧 CHECK YOUR INBOX CONFIRMATION DIALOG MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-brand-cream border border-brand-rose shadow-2xl p-8 space-y-6 text-center animate-slide-in font-sans">
            <button
              onClick={() => { setShowConfirmModal(false); router.push("/login"); }}
              className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-brand-cream text-foreground/45 hover:text-foreground transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="w-20 h-20 mx-auto rounded-full bg-brand-cream border border-brand-rose flex items-center justify-center text-brand-magenta shadow-md animate-bounce">
              <MailCheck size={38} />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black font-elegant text-foreground tracking-wide">
                Check Your Inbox!
              </h3>
              <p className="text-[11px] text-foreground/70 leading-relaxed max-w-sm mx-auto font-medium">
                We've sent a luxury verification link to <strong>{email}</strong>. Please confirm your email address to activate your dewy skincare profile.
              </p>
            </div>

            <div className="bg-brand-cream p-4 rounded-2xl border border-brand-rose text-left space-y-2 text-xs text-foreground/70">
              <h4 className="font-bold text-brand-magenta uppercase tracking-wider block text-[9px] flex items-center gap-1 select-none">
                <ShieldCheck size={11} /> Confirm Email Address
              </h4>
              <p className="text-[10px] leading-relaxed font-medium">
                Please check your inbox (including spam folder) for the activation link to verify and complete your secure profile setup.
              </p>
            </div>

            <button
              onClick={() => { setShowConfirmModal(false); router.push("/login"); }}
              className="w-full py-3 bg-brand-gradient text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md shadow-brand-magenta/15 cursor-pointer"
            >
              Proceed to Login
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
