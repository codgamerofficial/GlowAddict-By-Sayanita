import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/otp-store";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { verified: false, error: "Email and code are required." },
        { status: 400 }
      );
    }

    const result = verifyOtp(email, code);

    return NextResponse.json({
      verified: result.valid,
      error: result.error || undefined,
    });
  } catch (error) {
    console.error("[Glow Addict] Verification error:", error);
    return NextResponse.json(
      { verified: false, error: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}
