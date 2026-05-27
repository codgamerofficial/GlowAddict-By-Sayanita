"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// Interfaces
export interface AiExtraction {
  raw_ocr_text?: string;
  parsed_entities?: Record<string, any>;
  confidence?: number;
  ai_model?: string;
  extraction_status?: string;
  extracted_at?: string;
  extraction_version?: string;
  reviewed_by_admin?: boolean;
  manual_overrides?: boolean;
}

export interface Product {
  id: string;
  sku: string;
  title: string;
  brand: string;
  category: string;
  price: number;
  mrp: number;
  stock: number;
  image: string;
  shades?: string[];
  authenticity_flag: boolean;
  description: string;
  extracted_text?: string;
  // Extended fields
  slug?: string;
  ingredients?: string;
  benefits?: string;
  skin_type?: string;
  product_type?: string;
  tags?: string[];
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  discount_percent?: number;
  variant?: string;
  weight?: string;
  images?: string[];
  ai_confidence?: number;
  status?: "active" | "draft" | "archived";
  ai_extraction?: AiExtraction;
  created_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedShade?: string;
}

export interface Order {
  id: string;
  items: {
    product: Product;
    quantity: number;
    selectedShade?: string;
  }[];
  total_amount: number;
  delivery_charge: number;
  payment_method: "UPI" | "COD";
  payment_status: "pending" | "paid" | "failed" | "pending_verification";
  order_status: "created" | "packed" | "shipped" | "delivered";
  shipping_address: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  freebies: {
    scrunchies: boolean;
    lipstick: boolean;
    choice?: "15ml Face Wash" | "Crochet Keychain";
  };
  upi_transaction_id?: string;
  screenshot_url?: string;
  courier?: string;
  tracking_id?: string;
  created_at: string;
  coupon_code?: string;
  discount_amount?: number;
}

export interface Claim {
  id: string;
  order_id: string;
  claim_type: "damage" | "missing";
  unboxing_video_url: string;
  status: "pending" | "approved" | "rejected";
  resolution_notes?: string;
  created_at: string;
}

export interface UserAddress {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export interface UserPaymentMethod {
  id: string;
  card_brand: string;
  last_4: string;
  exp_date: string;
  isDefault: boolean;
}

export interface UserSession {
  device: string;
  location: string;
  ip: string;
  lastActive: string;
}

export interface UserProfile {
  email: string;
  name: string;
  phone: string;
  id?: string;
  avatar?: string;
  cover_banner?: string;
  bio?: string;
  gender?: string;
  birth_date?: string;
  theme_preference?: "light" | "dark" | "luxury" | "amethyst";
  accent_color?: string;
  compact_mode?: boolean;
  loyalty_points?: number;
  loyalty_tier?: "Bronze" | "Silver" | "Gold" | "Orchid Platinum";
  suspended?: boolean;
  
  // Beauty Profile
  skin_type?: string;
  skin_concerns?: string[];
  skin_allergies?: string[];
  sensitivities?: string[];
  tone_preference?: string;
  finish_preference?: string;
  skincare_goals?: string[];
  
  // Lists
  addresses?: UserAddress[];
  payment_methods?: UserPaymentMethod[];
  active_sessions?: UserSession[];
}

interface ShopSettings {
  codEnabled: boolean;
  codFee: number;
  backendMode: "mock" | "supabase";
}

interface ShopContextType {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  claims: Claim[];
  settings: ShopSettings;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity: number, shade?: string) => void;
  removeFromCart: (productId: string, shade?: string) => void;
  updateCartQuantity: (productId: string, shade: string | undefined, quantity: number) => void;
  clearCart: () => void;
  getCartSubtotal: () => number;
  getDeliveryCharge: () => number;
  getEligibleFreebies: () => {
    scrunchies: boolean;
    lipstick: boolean;
    choiceAllowed: boolean;
  };
  placeOrder: (
    shippingAddress: Order["shipping_address"],
    paymentMethod: "UPI" | "COD",
    freebieChoice?: "15ml Face Wash" | "Crochet Keychain",
    couponCode?: string,
    discountAmount?: number
  ) => Order;
  confirmPayment: (orderId: string, txnId: string, screenshotUrl?: string) => void;
  submitClaim: (orderId: string, claimType: "damage" | "missing", videoUrl: string) => Claim;
  
  // Wishlist Methods
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Theme Methods
  theme: "light" | "dark";
  toggleTheme: () => void;

  // Admin Methods
  adminVerifyPayment: (orderId: string) => void;
  adminShipOrder: (orderId: string, courier: string, trackingId: string) => void;
  adminDeliverOrder: (orderId: string) => void;
  adminResolveClaim: (claimId: string, status: "approved" | "rejected", notes?: string) => void;
  adminToggleCod: () => void;
  adminAddProduct: (product: Product) => void;
  adminRemoveProduct: (productId: string) => void;
  adminUpdateStock: (productId: string, newStock: number) => void;
  adminUpdateProductPrice: (productId: string, price: number, mrp?: number) => void;
  adminUpdateProduct: (productId: string, updates: Partial<Product>) => void;
  adminDuplicateProduct: (productId: string) => void;
  adminArchiveProduct: (productId: string) => void;

  // Auth Methods & States
  user: UserProfile | null;
  isAdmin: boolean;
  signUpWithEmail: (email: string, password: string, name: string, phone: string, extraOnboarding?: Partial<UserProfile>) => Promise<any>;
  signInWithEmail: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  
  // User Profile & Settings Customization Handlers
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  updateBeautyProfile: (updates: Partial<UserProfile>) => void;
  addUserAddress: (address: Omit<UserAddress, "id">) => void;
  updateUserAddress: (addressId: string, updates: Partial<UserAddress>) => void;
  deleteUserAddress: (addressId: string) => void;
  addUserPaymentMethod: (method: Omit<UserPaymentMethod, "id">) => void;
  deleteUserPaymentMethod: (methodId: string) => void;
  
  // Admin User Ecosystem Management Methods
  adminUsers: UserProfile[];
  adminSuspendUser: (email: string) => void;
  adminUnsuspendUser: (email: string) => void;
  adminAdjustLoyaltyPoints: (email: string, points: number) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const normalizeProduct = (raw: unknown): Product => {
  const value = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const images = Array.isArray(value.images) ? value.images.map((item: unknown) => String(item)) : [];
  const firstImage = images[0] || String(value.image || value.image_url || "");
  const title = String(value.title || value.product_name || value.name || "Untitled Product");
  const brand = String(value.brand || value.brand_name || "Unknown");
  const category = String(value.category || value.category_name || "Skincare");
  const stock = Number(value.stock || value.stock_quantity || 0);

  // Safely translate arrays from database into readable strings if needed
  const parseToString = (v: any): string | undefined => {
    if (Array.isArray(v)) return v.join(", ");
    return v ? String(v) : undefined;
  };

  return {
    id: String(value.id),
    sku: String(value.sku || ""),
    title,
    brand,
    category,
    price: Number(value.price || value.selling_price || value.sale_price || 0),
    mrp: Number(value.mrp || value.price || value.selling_price || value.sale_price || 0),
    stock,
    image: firstImage,
    shades: Array.isArray(value.shades) ? value.shades.map((item: unknown) => String(item)) : (value.shade ? [String(value.shade)] : []),
    authenticity_flag: Boolean(value.authenticity_flag) !== false ? true : false,
    description: String(value.description || value.short_desc || ""),
    extracted_text: value.extracted_text ? String(value.extracted_text) : (value.ocr_text ? String(value.ocr_text) : undefined),
    slug: value.slug ? String(value.slug) : undefined,
    ingredients: parseToString(value.ingredients),
    benefits: parseToString(value.benefits),
    skin_type: parseToString(value.skin_type),
    product_type: value.product_type ? String(value.product_type) : undefined,
    tags: Array.isArray(value.tags) ? value.tags.map((t: unknown) => String(t)) : undefined,
    seo_title: value.seo_title ? String(value.seo_title) : undefined,
    seo_description: value.seo_description ? String(value.seo_description) : undefined,
    seo_keywords: Array.isArray(value.seo_keywords) ? value.seo_keywords.map((k: unknown) => String(k)) : undefined,
    discount_percent: value.discount_percent ? Number(value.discount_percent) : undefined,
    variant: value.variant ? String(value.variant) : undefined,
    weight: value.weight ? String(value.weight) : (value.quantity ? String(value.quantity) : undefined),
    images: Array.isArray(value.images) ? value.images.map((i: unknown) => String(i)) : undefined,
    ai_confidence: value.ai_confidence ? Number(value.ai_confidence) : undefined,
    status: (value.status === "active" || value.status === "draft" || value.status === "archived") ? value.status : undefined,
    ai_extraction: value.ai_extraction && typeof value.ai_extraction === "object" ? (value.ai_extraction as any) : undefined,
    created_at: value.created_at ? String(value.created_at) : undefined,
  };
};

const getAdminApiKey = () => {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem("glow_admin_api_key") || "";
};

const DEFAULT_SETTINGS: ShopSettings = {
  codEnabled: false,
  codFee: 50,
  backendMode: "mock",
};

const parseStoredValue = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;

  try {
    const value = localStorage.getItem(key);
    if (!value) return fallback;
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

// Initial Mock Skincare Catalog
const KEY_PRODUCTS: Product[] = [
  {
    id: "prod-p1",
    sku: "ACC-PAORA-PUFF",
    title: "PAORA Powder Puff Set",
    brand: "PAORA",
    category: "Beauty Accessories",
    price: 50,
    mrp: 50,
    stock: 20,
    image: "/images/p1.jpeg",
    authenticity_flag: true,
    description: "Cute beauty puff set for flawless powder blending."
  },
  {
    id: "prod-p2",
    sku: "LIP-MARS-WINNER",
    title: "MARS Matte Lipstick",
    brand: "MARS",
    category: "Lip Care / Nourishing",
    price: 249,
    mrp: 299,
    stock: 15,
    shades: ["Winner Women", "Bold Red", "Nude Pink"],
    image: "/images/p2.jpeg",
    authenticity_flag: true,
    description: "High-pigmentation matte finish lipstick styled for gorgeous day-long wear. Shade: Winner Women."
  },
  {
    id: "prod-p3",
    sku: "DEV-COLD-THERAPY",
    title: "Skin-Smoothing Cold Therapy",
    brand: "Glow Addict",
    category: "Skincare Device / Cooling",
    price: 60,
    mrp: 100,
    stock: 12,
    image: "/images/p3.jpeg",
    authenticity_flag: true,
    description: "Premium facial cooling globe designed to soothe redness, tighten pores, and boost circulation."
  },
  {
    id: "prod-p4",
    sku: "SER-PLUM-NIAC-10",
    title: "Plum Rice Water & 10% Niacinamide Serum",
    brand: "Plum",
    category: "Serum / Hydration",
    price: 299,
    mrp: 349,
    stock: 30,
    image: "/images/p4.jpeg",
    authenticity_flag: true,
    description: "Formulated with 10% Niacinamide and clear Rice Water to visibly fade blemishes, tighten pores, and hydrate."
  },
  {
    id: "prod-p5",
    sku: "KIT-DOT-HYDRA-COMBO",
    title: "Dot & Key Hydration Combo",
    brand: "Dot & Key",
    category: "Glass Skin Kit",
    price: 589,
    mrp: 844,
    stock: 18,
    image: "/images/p5.jpeg",
    authenticity_flag: true,
    description: "The ultimate hydration ritual containing skin-plumping water gel creams and moisture-locking serums."
  },
  {
    id: "prod-p6",
    sku: "KIT-DOT-BLUEBERRY",
    title: "Dot & Key Blueberry Hydrate Combo",
    brand: "Dot & Key",
    category: "Barrier Relief Kit",
    price: 589,
    mrp: 844,
    stock: 22,
    image: "/images/p6.jpeg",
    authenticity_flag: true,
    description: "Infused with rich antioxidant blueberry extracts and hyaluronic acid to repair the skin barrier."
  }
];

// Programmatic generation of the remaining 79 products (prod-p7 to prod-p85)
const generateRemainingProducts = (): Product[] => {
  const brands = ["COSRX", "The Ordinary", "Beauty of Joseon", "Laneige", "CeraVe", "Anua", "Dot & Key", "Plum", "MARS"];
  const categories = [
    "Serum / Hydration",
    "Lip Care / Nourishing",
    "Toner / Calming",
    "Cleanser / Barrier Repair",
    "Sunscreen / Protection",
    "Essence / Hydration",
    "Beauty Accessories"
  ];
  const adjectives = ["Advanced", "Relief", "Hydrating", "Glass Skin", "Deep Soothing", "Ultimate", "Faded", "Radiant", "Dewy"];
  const nouns = ["Gel", "Essence", "Cream", "Mask", "Mist", "Toner", "Cleanser", "Elixir", "Balm"];
  
  const generated: Product[] = [];
  
  for (let i = 7; i <= 85; i++) {
    const brand = brands[(i - 7) % brands.length];
    const category = categories[(i - 7) % categories.length];
    const adjective = adjectives[(i - 7) % adjectives.length];
    const noun = nouns[(i - 7) % nouns.length];
    const title = `${adjective} ${brand} ${noun}`;
    
    const basePrice = 200 + ((i * 17) % 1500);
    const price = Math.round(basePrice / 10) * 10;
    const mrp = Math.round((price * 1.25) / 10) * 10;
    const stock = 5 + ((i * 3) % 25);
    
    generated.push({
      id: `prod-p${i}`,
      sku: `PROD-SKU-${i}`,
      title,
      brand,
      category,
      price,
      mrp,
      stock,
      image: `/images/p${i}.jpeg`,
      authenticity_flag: true,
      description: `A premium, dermatologist-approved ${title} formulated to deliver ${category.toLowerCase()} results. Handpicked by Sayanita for 100% authentic quality.`
    });
  }
  
  return generated;
};

const INITIAL_PRODUCTS: Product[] = [...KEY_PRODUCTS, ...generateRemainingProducts()];;

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  
  const [adminUsers, setAdminUsers] = useState<UserProfile[]>(() => {
    return [
      {
        email: "saswatadey700@gmail.com",
        name: "Saswata Dey",
        phone: "+917319280024",
        id: "mock-user-1",
        avatar: "",
        loyalty_points: 250,
        loyalty_tier: "Silver",
        suspended: false,
        skin_type: "combination",
        skin_concerns: ["Pore Expansion", "Dullness"],
        addresses: [
          {
            id: "addr-1",
            name: "Saswata Dey",
            phone: "+917319280024",
            address: "Shyamali Apartment, Word No 6, Madhusudan Colony",
            city: "Kolkata",
            state: "West Bengal",
            zipCode: "721401",
            isDefault: true
          }
        ]
      },
      {
        email: "sayanitapayra@gmail.com",
        name: "Sayanita Payra",
        phone: "+918509326600",
        id: "mock-user-admin",
        avatar: "",
        loyalty_points: 1250,
        loyalty_tier: "Orchid Platinum",
        suspended: false,
        skin_type: "oily",
        skin_concerns: ["Redness"]
      }
    ];
  });

  const [user, setUser] = useState<UserProfile | null>(null);

  const initializeUserProfile = (base: { email: string; name?: string; phone?: string; id?: string }, extraOnboarding?: Partial<UserProfile>): UserProfile => {
    const existing = adminUsers.find(u => u.email.toLowerCase() === base.email.toLowerCase());
    if (existing) return existing;

    const defaultProfile: UserProfile = {
      email: base.email,
      name: base.name || base.email.split("@")[0],
      phone: base.phone || "",
      id: base.id || `user-${Date.now()}`,
      avatar: "",
      cover_banner: "",
      bio: "Skincare enthusiast on a circadian rhythm dewy skin barrier repair journey. ✨",
      gender: "Not specified",
      birth_date: "1998-05-20",
      theme_preference: "dark",
      accent_color: "#E056FD",
      compact_mode: false,
      loyalty_points: 150,
      loyalty_tier: "Silver",
      suspended: false,
      skin_type: "combination",
      skin_concerns: ["Dehydration", "Dullness"],
      skin_allergies: [],
      sensitivities: [],
      tone_preference: "dewy",
      finish_preference: "radiant",
      skincare_goals: ["Skin Barrier Repair", "Glow Restoration"],
      addresses: [
        {
          id: `addr-${Date.now()}`,
          name: base.name || "Default Recipient",
          phone: base.phone || "+91 98765 43210",
          address: "12/A Park Street, Flat 4B",
          city: "Kolkata",
          state: "West Bengal",
          zipCode: "700016",
          isDefault: true
        }
      ],
      payment_methods: [
        {
          id: `pay-${Date.now()}`,
          card_brand: "Visa",
          last_4: "4242",
          exp_date: "12/28",
          isDefault: true
        }
      ],
      active_sessions: [
        {
          device: "Chrome on Windows (Current)",
          location: "Kolkata, India",
          ip: "103.145.72.18",
          lastActive: "Just now"
        },
        {
          device: "Safari on iPhone 15 Pro",
          location: "Kolkata, India",
          ip: "103.145.72.22",
          lastActive: "2 hours ago"
        }
      ],
      ...extraOnboarding
    };

    setAdminUsers(prev => [...prev, defaultProfile]);
    return defaultProfile;
  };

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const profile = initializeUserProfile({
            email: session.user.email || "",
            name: session.user.user_metadata?.name || "",
            phone: session.user.user_metadata?.phone || "",
            id: session.user.id
          });
          setUser(profile);
        } else {
          const mock = sessionStorage.getItem("glow_session");
          if (mock) {
            setUser(JSON.parse(mock));
          }
        }
      } catch {
        const mock = sessionStorage.getItem("glow_session");
        if (mock) {
          setUser(JSON.parse(mock));
        }
      }
    };
    void getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const profile = initializeUserProfile({
          email: session.user.email || "",
          name: session.user.user_metadata?.name || "",
          phone: session.user.user_metadata?.phone || "",
          id: session.user.id
        });
        setUser(profile);
      } else {
        const mock = sessionStorage.getItem("glow_session");
        if (mock) {
          setUser(JSON.parse(mock));
        } else {
          setUser(null);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [adminUsers]);

  const isSupabaseReachable = async (): Promise<boolean> => {
    if (typeof window === "undefined") return false;
    if (!navigator.onLine) return false;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url) return false;
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(url, {
        signal: controller.signal,
        mode: "no-cors"
      });
      clearTimeout(id);
      return true;
    } catch {
      return false;
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string, phone: string, extraOnboarding?: Partial<UserProfile>) => {
    const reachable = await isSupabaseReachable();
    if (!reachable) {
      console.warn("Supabase auth server is offline or unreachable. Using mock registration.");
      const mockUser = initializeUserProfile({ email, name, phone }, extraOnboarding);
      sessionStorage.setItem("glow_session", JSON.stringify(mockUser));
      setUser(mockUser);
      return { user: mockUser, isMock: true };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, phone }
        }
      });
      if (error) throw error;
      if (data.user) {
        const mockUser = initializeUserProfile({ email, name, phone }, extraOnboarding);
        sessionStorage.setItem("glow_session", JSON.stringify(mockUser));
        setUser(mockUser);
      }
      return data;
    } catch (err) {
      console.warn("Supabase auth signup failed, falling back to mock mode:", err);
      const mockUser = initializeUserProfile({ email, name, phone }, extraOnboarding);
      sessionStorage.setItem("glow_session", JSON.stringify(mockUser));
      setUser(mockUser);
      return { user: mockUser, isMock: true };
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    const reachable = await isSupabaseReachable();
    if (!reachable) {
      console.warn("Supabase auth server is offline or unreachable. Checking local credentials.");
      const mock = sessionStorage.getItem("glow_session");
      if (mock) {
        const parsed = JSON.parse(mock) as UserProfile;
        if (parsed.email.toLowerCase() === email.toLowerCase()) {
          if (parsed.suspended) {
            throw new Error("This account has been temporarily suspended by Sayanita for security audits.");
          }
          setUser(parsed);
          return { user: parsed, isMock: true };
        }
      }
      const registered = adminUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (registered) {
        if (registered.suspended) {
          throw new Error("This account has been temporarily suspended by Sayanita for security audits.");
        }
        sessionStorage.setItem("glow_session", JSON.stringify(registered));
        setUser(registered);
        return { user: registered, isMock: true };
      }
      throw new Error("Offline Mode: No local profile found for this email address. Please register a new account.");
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      
      if (data.user) {
        const profile = initializeUserProfile({
          email: data.user.email || "",
          name: data.user.user_metadata?.name || "",
          phone: data.user.user_metadata?.phone || "",
          id: data.user.id
        });
        if (profile.suspended) {
          await supabase.auth.signOut();
          throw new Error("This account has been temporarily suspended by Sayanita for security audits.");
        }
        setUser(profile);
      }
      return data;
    } catch (err: any) {
      if (err?.message?.includes("Email not confirmed")) {
        throw new Error("Email not confirmed. Please check your inbox and verify your email before logging in.");
      }
      console.warn("Supabase auth login failed, checking mock credentials:", err);
      
      const registered = adminUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (registered) {
        if (registered.suspended) {
          throw new Error("This account has been temporarily suspended by Sayanita for security audits.");
        }
        sessionStorage.setItem("glow_session", JSON.stringify(registered));
        setUser(registered);
        return { user: registered, isMock: true };
      }
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    sessionStorage.removeItem("glow_session");
    setUser(null);
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    setAdminUsers(prev => prev.map(u => u.email.toLowerCase() === user.email.toLowerCase() ? updated : u));
    sessionStorage.setItem("glow_session", JSON.stringify(updated));
  };

  const updateBeautyProfile = (updates: Partial<UserProfile>) => {
    updateUserProfile(updates);
  };

  const addUserAddress = (address: Omit<UserAddress, "id">) => {
    if (!user) return;
    const newAddress: UserAddress = {
      ...address,
      id: `addr-${Date.now()}`
    };
    const currentAddresses = user.addresses ? [...user.addresses] : [];
    if (newAddress.isDefault) {
      currentAddresses.forEach(a => a.isDefault = false);
    }
    const updatedAddresses = [...currentAddresses, newAddress];
    updateUserProfile({ addresses: updatedAddresses });
  };

  const updateUserAddress = (addressId: string, updates: Partial<UserAddress>) => {
    if (!user || !user.addresses) return;
    const updatedAddresses = user.addresses.map(addr => {
      if (addr.id === addressId) {
        return { ...addr, ...updates };
      }
      return addr;
    });
    if (updates.isDefault) {
      updatedAddresses.forEach(a => {
        if (a.id !== addressId) a.isDefault = false;
      });
    }
    updateUserProfile({ addresses: updatedAddresses });
  };

  const deleteUserAddress = (addressId: string) => {
    if (!user || !user.addresses) return;
    const updatedAddresses = user.addresses.filter(addr => addr.id !== addressId);
    if (updatedAddresses.length > 0 && !updatedAddresses.some(a => a.isDefault)) {
      updatedAddresses[0].isDefault = true;
    }
    updateUserProfile({ addresses: updatedAddresses });
  };

  const addUserPaymentMethod = (method: Omit<UserPaymentMethod, "id">) => {
    if (!user) return;
    const newMethod: UserPaymentMethod = {
      ...method,
      id: `pay-${Date.now()}`
    };
    const currentMethods = user.payment_methods ? [...user.payment_methods] : [];
    if (newMethod.isDefault) {
      currentMethods.forEach(m => m.isDefault = false);
    }
    const updatedMethods = [...currentMethods, newMethod];
    updateUserProfile({ payment_methods: updatedMethods });
  };

  const deleteUserPaymentMethod = (methodId: string) => {
    if (!user || !user.payment_methods) return;
    const updatedMethods = user.payment_methods.filter(m => m.id !== methodId);
    if (updatedMethods.length > 0 && !updatedMethods.some(m => m.isDefault)) {
      updatedMethods[0].isDefault = true;
    }
    updateUserProfile({ payment_methods: updatedMethods });
  };

  const adminSuspendUser = (email: string) => {
    setAdminUsers(prev => prev.map(u => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        const updated = { ...u, suspended: true };
        if (user && user.email.toLowerCase() === email.toLowerCase()) {
          setUser(updated);
        }
        return updated;
      }
      return u;
    }));
  };

  const adminUnsuspendUser = (email: string) => {
    setAdminUsers(prev => prev.map(u => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        const updated = { ...u, suspended: false };
        if (user && user.email.toLowerCase() === email.toLowerCase()) {
          setUser(updated);
        }
        return updated;
      }
      return u;
    }));
  };

  const adminAdjustLoyaltyPoints = (email: string, points: number) => {
    setAdminUsers(prev => prev.map(u => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        const newPoints = Math.max(0, points);
        let tier: UserProfile["loyalty_tier"] = "Bronze";
        if (newPoints >= 1000) tier = "Orchid Platinum";
        else if (newPoints >= 500) tier = "Gold";
        else if (newPoints >= 150) tier = "Silver";
        
        const updated = { ...u, loyalty_points: newPoints, loyalty_tier: tier };
        if (user && user.email.toLowerCase() === email.toLowerCase()) {
          setUser(updated);
        }
        return updated;
      }
      return u;
    }));
  };


  const isAdmin = !!(
    user?.email &&
    (user.email.toLowerCase() === "sayanitasen.official@gmail.com" ||
      user.email.toLowerCase() === "sayanita@glowaddict.com" ||
      user.email.toLowerCase().endsWith("@glowaddict.com"))
  );

  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [cartOpen, setCartOpen] = useState(false);
  const [settings, setSettings] = useState<ShopSettings>(() => {
    const parsed = parseStoredValue<Partial<ShopSettings>>("glow_settings", {});
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
    };
  });

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/products", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        if (Array.isArray(data.products)) {
          const remoteProducts = data.products.map(normalizeProduct);
          if (remoteProducts.length > 0) {
            setProducts((prev) => {
              const merged = [...remoteProducts];
              prev.forEach((localProd) => {
                const remoteIdx = merged.findIndex((p) => p.id === localProd.id);
                if (remoteIdx === -1) {
                  merged.unshift(localProd);
                } else {
                  const localConfidence = localProd.ai_confidence || 0;
                  const remoteConfidence = merged[remoteIdx].ai_confidence || 0;
                  if (localConfidence > remoteConfidence || localProd.status === "draft" || localProd.stock !== merged[remoteIdx].stock) {
                    merged[remoteIdx] = { ...merged[remoteIdx], ...localProd };
                  }
                }
              });
              localStorage.setItem("glow_products", JSON.stringify(merged));
              return merged;
            });
            setSettings((prev) => ({ ...prev, backendMode: "supabase" }));
          }
        }
      } catch {
        // Keep local mode if backend is unreachable.
      }
    })();
  }, []);

  // Hydrate from localStorage on client only to avoid SSR/client markup mismatches
  useEffect(() => {
    if (typeof window !== "undefined") {
      const localProducts = localStorage.getItem("glow_products");
      const localCart = localStorage.getItem("glow_cart");
      const localOrders = localStorage.getItem("glow_orders");
      const localClaims = localStorage.getItem("glow_claims");
      const localSettings = localStorage.getItem("glow_settings");
      const localWishlist = localStorage.getItem("glow_wishlist");
      const localTheme = localStorage.getItem("glow_theme") as "light" | "dark" | null;

      /* eslint-disable react-hooks/set-state-in-effect */
      if (localProducts) {
        try {
          const parsed = JSON.parse(localProducts);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProducts(parsed);
          }
        } catch {
          // ignore parsing error
        }
      }
      if (localCart) setCart(JSON.parse(localCart));
      if (localOrders) setOrders(JSON.parse(localOrders));
      if (localClaims) setClaims(JSON.parse(localClaims));
      if (localSettings) setSettings(JSON.parse(localSettings));
      if (localWishlist) setWishlist(JSON.parse(localWishlist));
      
      const activeTheme = localTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      setTheme(activeTheme);
      if (activeTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, []);

  // Sync state helpers
  const saveProducts = (newProds: Product[]) => {
    setProducts(newProds);
    localStorage.setItem("glow_products", JSON.stringify(newProds));
  };

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("glow_cart", JSON.stringify(newCart));
  };

  const saveOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    localStorage.setItem("glow_orders", JSON.stringify(newOrders));
  };

  const saveClaims = (newClaims: Claim[]) => {
    setClaims(newClaims);
    localStorage.setItem("glow_claims", JSON.stringify(newClaims));
  };

  const saveSettings = (newSettings: ShopSettings) => {
    setSettings(newSettings);
    localStorage.setItem("glow_settings", JSON.stringify(newSettings));
  };

  // Cart operations
  const addToCart = (product: Product, quantity: number, shade?: string) => {
    const updatedCart = [...cart];
    const existingIndex = updatedCart.findIndex(
      (item) => item.product.id === product.id && item.selectedShade === shade
    );

    if (existingIndex > -1) {
      updatedCart[existingIndex].quantity += quantity;
    } else {
      updatedCart.push({ product, quantity, selectedShade: shade });
    }
    saveCart(updatedCart);
  };

  const removeFromCart = (productId: string, shade?: string) => {
    const updatedCart = cart.filter(
      (item) => !(item.product.id === productId && item.selectedShade === shade)
    );
    saveCart(updatedCart);
  };

  const updateCartQuantity = (productId: string, shade: string | undefined, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, shade);
      return;
    }
    const updatedCart = cart.map((item) => {
      if (item.product.id === productId && item.selectedShade === shade) {
        return { ...item, quantity };
      }
      return item;
    });
    saveCart(updatedCart);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const getCartSubtotal = () => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const getDeliveryCharge = () => {
    const subtotal = getCartSubtotal();
    if (subtotal === 0) return 0;
    return subtotal >= 799 ? 0 : 39;
  };

  const getEligibleFreebies = () => {
    const subtotal = getCartSubtotal();
    return {
      scrunchies: subtotal >= 799,
      lipstick: subtotal >= 1299,
      choiceAllowed: subtotal >= 1499
    };
  };

  // Checkout operations
  const placeOrder = (
    shippingAddress: Order["shipping_address"],
    paymentMethod: "UPI" | "COD",
    freebieChoice?: "15ml Face Wash" | "Crochet Keychain",
    couponCode?: string,
    discountAmount?: number
  ): Order => {
    const isCod = paymentMethod === "COD";
    const subtotal = getCartSubtotal();
    const deliveryCharge = getDeliveryCharge();
    const freebies = getEligibleFreebies();
    const discount = discountAmount || 0;

    const items = cart.map((ci) => ({
      product: ci.product,
      quantity: ci.quantity,
      selectedShade: ci.selectedShade,
    }));

    const newOrder: Order = {
      id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      items,
      total_amount: Math.max(0, subtotal - discount) + deliveryCharge + (isCod && settings.codFee ? settings.codFee : 0),
      delivery_charge: deliveryCharge,
      payment_method: paymentMethod,
      payment_status: isCod ? "pending" : "pending",
      order_status: isCod ? "packed" : "created",
      shipping_address: shippingAddress,
      freebies: {
        scrunchies: freebies.scrunchies,
        lipstick: freebies.lipstick,
        choice: freebieChoice,
      },
      coupon_code: couponCode,
      discount_amount: discount,
      created_at: new Date().toISOString(),
    };

    // Deduct stock
    const updatedProducts = products.map((prod) => {
      const cartMatch = cart.find((item) => item.product.id === prod.id);
      if (cartMatch) {
        return {
          ...prod,
          stock: Math.max(0, prod.stock - cartMatch.quantity),
        };
      }
      return prod;
    });

    saveProducts(updatedProducts);
    const updatedOrders = [newOrder, ...orders];
    saveOrders(updatedOrders);
    clearCart();

    // Sync to backend in supabase mode (fire-and-forget)
    if (settings.backendMode === "supabase") {
      void fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newOrder,
          userId: null, // guest checkout for now
        }),
      }).catch(() => {});
    }

    return newOrder;
  };

  // UPI payment confirmation
  const confirmPayment = (orderId: string, txnId: string, screenshotUrl?: string) => {
    const updatedOrders = orders.map((order) => {
      if (order.id === orderId) {
        return {
          ...order,
          upi_transaction_id: txnId,
          screenshot_url: screenshotUrl,
          payment_status: "pending_verification" as const
        };
      }
      return order;
    });
    saveOrders(updatedOrders);

    // Sync to backend in supabase mode
    if (settings.backendMode === "supabase") {
      void fetch(`/api/orders/${encodeURIComponent(orderId)}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upiTransactionId: txnId, screenshotUrl }),
      }).catch(() => {});
    }
  };

  // Claims
  const submitClaim = (orderId: string, claimType: "damage" | "missing", videoUrl: string) => {
    const newClaim: Claim = {
      id: `CLM-${Math.floor(100000 + Math.random() * 900000)}`,
      order_id: orderId,
      claim_type: claimType,
      unboxing_video_url: videoUrl,
      status: "pending",
      created_at: new Date().toISOString()
    };

    const updatedOrders = orders.map((order) => {
      if (order.id === orderId) {
        return {
          ...order,
          order_status: "packed" as const
        };
      }
      return order;
    });

    saveOrders(updatedOrders);
    const updatedClaims = [newClaim, ...claims];
    saveClaims(updatedClaims);

    // Sync to backend in supabase mode
    if (settings.backendMode === "supabase") {
      void fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newClaim,
          userId: null,
        }),
      }).catch(() => {});
    }

    return newClaim;
  };

  // Admin capabilities
  const getAdminApiHeaders = () => {
    const key = typeof window !== "undefined" ? sessionStorage.getItem("glow_admin_api_key") : "";
    return key ? { "Content-Type": "application/json", "x-admin-key": key } as const : null;
  };

  const adminVerifyPayment = (orderId: string) => {
    const updatedOrders = orders.map((order) => {
      if (order.id === orderId) {
        return {
          ...order,
          payment_status: "paid" as const,
          order_status: "packed" as const
        };
      }
      return order;
    });
    saveOrders(updatedOrders);

    const headers = getAdminApiHeaders();
    if (headers && settings.backendMode === "supabase") {
      void fetch("/api/admin/orders", {
        method: "PUT",
        headers,
        body: JSON.stringify({ orderId, action: "verify-payment" }),
      }).catch(() => {});
    }
  };

  const adminShipOrder = (orderId: string, courier: string, trackingId: string) => {
    const updatedOrders = orders.map((order) => {
      if (order.id === orderId) {
        return {
          ...order,
          order_status: "shipped" as const,
          courier,
          tracking_id: trackingId
        };
      }
      return order;
    });
    saveOrders(updatedOrders);

    const headers = getAdminApiHeaders();
    if (headers && settings.backendMode === "supabase") {
      void fetch("/api/admin/orders", {
        method: "PUT",
        headers,
        body: JSON.stringify({ orderId, action: "ship", courier, trackingId }),
      }).catch(() => {});
    }
  };

  const adminDeliverOrder = (orderId: string) => {
    const updatedOrders = orders.map((order) => {
      if (order.id === orderId) {
        return {
          ...order,
          order_status: "delivered" as const
        };
      }
      return order;
    });
    saveOrders(updatedOrders);

    const headers = getAdminApiHeaders();
    if (headers && settings.backendMode === "supabase") {
      void fetch("/api/admin/orders", {
        method: "PUT",
        headers,
        body: JSON.stringify({ orderId, action: "deliver" }),
      }).catch(() => {});
    }
  };

  const adminResolveClaim = (claimId: string, status: "approved" | "rejected", notes?: string) => {
    const updatedClaims = claims.map((claim) => {
      if (claim.id === claimId) {
        return {
          ...claim,
          status,
          resolution_notes: notes
        };
      }
      return claim;
    });
    saveClaims(updatedClaims);

    const headers = getAdminApiHeaders();
    if (headers && settings.backendMode === "supabase") {
      void fetch("/api/admin/claims", {
        method: "PUT",
        headers,
        body: JSON.stringify({ claimId, status, resolutionNotes: notes }),
      }).catch(() => {});
    }
  };

  const adminToggleCod = () => {
    const newSettings = { ...settings, codEnabled: !settings.codEnabled };
    saveSettings(newSettings);
  };

  const adminAddProduct = (product: Product) => {
    const updatedProducts = [product, ...products];
    saveProducts(updatedProducts);

    const adminApiKey = getAdminApiKey();
    void fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(adminApiKey ? { "x-admin-key": adminApiKey } : {}),
      },
      body: JSON.stringify(product),
    });
  };

  const adminRemoveProduct = (productId: string) => {
    const updatedProducts = products.filter((prod) => prod.id !== productId);
    saveProducts(updatedProducts);
    const updatedCart = cart.filter((item) => item.product.id !== productId);
    saveCart(updatedCart);

    const adminApiKey = getAdminApiKey();
    void fetch(`/api/products?id=${encodeURIComponent(productId)}`, {
      method: "DELETE",
      headers: {
        ...(adminApiKey ? { "x-admin-key": adminApiKey } : {}),
      },
    });
  };

  const adminUpdateStock = (productId: string, newStock: number) => {
    const updatedProducts = products.map((prod) => {
      if (prod.id === productId) {
        return { ...prod, stock: newStock };
      }
      return prod;
    });
    saveProducts(updatedProducts);

    const adminApiKey = getAdminApiKey();
    void fetch("/api/products", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(adminApiKey ? { "x-admin-key": adminApiKey } : {}),
      },
      body: JSON.stringify({ id: productId, stock: newStock }),
    });
  };

  const adminUpdateProductPrice = (productId: string, price: number, mrp?: number) => {
    const updatedProducts = products.map((prod) => {
      if (prod.id === productId) {
        return {
          ...prod,
          price,
          mrp: mrp || prod.mrp
        };
      }
      return prod;
    });
    saveProducts(updatedProducts);

    const adminApiKey = getAdminApiKey();
    void fetch("/api/products", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(adminApiKey ? { "x-admin-key": adminApiKey } : {}),
      },
      body: JSON.stringify({ id: productId, price, ...(mrp ? { mrp } : {}) }),
    });
  };

  const adminUpdateProduct = (productId: string, updates: Partial<Product>) => {
    const updatedProducts = products.map((prod) => {
      if (prod.id === productId) {
        return { ...prod, ...updates };
      }
      return prod;
    });
    saveProducts(updatedProducts);
    const adminApiKey = getAdminApiKey();
    void fetch("/api/products", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(adminApiKey ? { "x-admin-key": adminApiKey } : {}),
      },
      body: JSON.stringify({ id: productId, ...updates }),
    });
  };

  const adminDuplicateProduct = (productId: string) => {
    const original = products.find((p) => p.id === productId);
    if (!original) return;
    const newId = `prod-dup-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const duplicate: Product = {
      ...original,
      id: newId,
      sku: `${original.sku}-DUP`,
      title: `${original.title} (Copy)`,
      status: "draft",
      created_at: new Date().toISOString(),
    };
    adminAddProduct(duplicate);
  };

  const adminArchiveProduct = (productId: string) => {
    adminUpdateProduct(productId, { status: "archived" });
  };

  const toggleWishlist = (productId: string) => {
    const updated = wishlist.includes(productId)
      ? wishlist.filter((id) => id !== productId)
      : [...wishlist, productId];
    setWishlist(updated);
    localStorage.setItem("glow_wishlist", JSON.stringify(updated));
  };

  const isInWishlist = (productId: string) => {
    return wishlist.includes(productId);
  };

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("glow_theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        cart,
        orders,
        claims,
        settings,
        cartOpen,
        setCartOpen,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        getCartSubtotal,
        getDeliveryCharge,
        getEligibleFreebies,
        placeOrder,
        confirmPayment,
        submitClaim,
        wishlist,
        toggleWishlist,
        isInWishlist,
        theme,
        toggleTheme,
        adminVerifyPayment,
        adminShipOrder,
        adminDeliverOrder,
        adminResolveClaim,
        adminToggleCod,
        adminAddProduct,
        adminRemoveProduct,
        adminUpdateStock,
        adminUpdateProductPrice,
        adminUpdateProduct,
        adminDuplicateProduct,
        adminArchiveProduct,
        user,
        isAdmin,
        signUpWithEmail,
        signInWithEmail,
        signOut,
        updateUserProfile,
        updateBeautyProfile,
        addUserAddress,
        updateUserAddress,
        deleteUserAddress,
        addUserPaymentMethod,
        deleteUserPaymentMethod,
        adminUsers,
        adminSuspendUser,
        adminUnsuspendUser,
        adminAdjustLoyaltyPoints,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
};
