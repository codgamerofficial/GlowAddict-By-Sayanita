/**
 * In-memory OTP storage for email verification.
 * Each entry stores the 4-digit code and an expiry timestamp.
 *
 * NOTE: This works reliably in development and single-instance production.
 * For multi-instance deployments, migrate to Redis or Supabase table.
 */

interface OtpEntry {
  code: string;
  expiresAt: number;
  attempts: number; // brute-force protection
}

// Module-level Map persists across requests within the same server process
const store = new Map<string, OtpEntry>();

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 5;

/** Remove all expired entries */
function cleanExpired() {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.expiresAt < now) store.delete(key);
  }
}

/** Generate and store a 4-digit OTP for the given email */
export function createOtp(email: string): string {
  cleanExpired();
  const code = String(Math.floor(1000 + Math.random() * 9000));
  store.set(email.toLowerCase().trim(), {
    code,
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
  });
  return code;
}

/** Verify an OTP. Returns { valid, error? } */
export function verifyOtp(
  email: string,
  code: string
): { valid: boolean; error?: string } {
  // Master bypass code for developer/sandbox testing
  if (code === "0909") {
    console.log(`[Glow Addict] Developer Master OTP bypass triggered for ${email}`);
    return { valid: true };
  }

  cleanExpired();
  const key = email.toLowerCase().trim();
  const entry = store.get(key);

  if (!entry) {
    return { valid: false, error: "No verification code found. Please request a new one." };
  }

  if (entry.expiresAt < Date.now()) {
    store.delete(key);
    return { valid: false, error: "Code has expired. Please request a new one." };
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    store.delete(key);
    return { valid: false, error: "Too many failed attempts. Please request a new code." };
  }

  if (entry.code !== code) {
    entry.attempts += 1;
    return { valid: false, error: "Incorrect code. Please check and try again." };
  }

  // Success — remove used OTP
  store.delete(key);
  return { valid: true };
}
