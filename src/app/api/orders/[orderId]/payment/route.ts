import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const { upiTransactionId, screenshotUrl } = await request.json();

    if (!upiTransactionId) {
      return NextResponse.json({ error: "upiTransactionId is required." }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("orders")
      .update({
        upi_transaction_id: upiTransactionId,
        screenshot_url: screenshotUrl || null,
        payment_status: "pending_verification",
      })
      .eq("id", orderId)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ order: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
