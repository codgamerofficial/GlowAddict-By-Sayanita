import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, orderId, claimType, unboxingVideoUrl, userId } = body;

    if (!id || !orderId || !claimType || !unboxingVideoUrl) {
      return NextResponse.json({ error: "Missing required claim fields." }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("claims")
      .insert({
        id,
        order_id: orderId,
        user_id: userId || null,
        claim_type: claimType,
        unboxing_video_url: unboxingVideoUrl,
        status: "pending",
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ claim: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
