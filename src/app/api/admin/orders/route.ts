import { NextRequest, NextResponse } from "next/server";
import { requireAdminApiKey } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function PUT(request: NextRequest) {
  const authError = requireAdminApiKey(request);
  if (authError) return authError;

  try {
    const { orderId, action, courier, trackingId } = await request.json();

    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json({ error: "orderId is required." }, { status: 400 });
    }

    let updateData: Record<string, unknown>;

    switch (action) {
      case "verify-payment":
        updateData = {
          payment_status: "paid",
          order_status: "packed",
        };
        break;

      case "ship":
        if (!courier || !trackingId) {
          return NextResponse.json(
            { error: "courier and trackingId are required for ship action." },
            { status: 400 }
          );
        }
        updateData = {
          order_status: "shipped",
          courier,
          tracking_id: trackingId,
        };
        break;

      case "deliver":
        updateData = {
          order_status: "delivered",
        };
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action. Use: verify-payment, ship, deliver." },
          { status: 400 }
        );
    }

    const { data, error } = await supabaseAdmin
      .from("orders")
      .update(updateData)
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

export async function GET(request: NextRequest) {
  const authError = requireAdminApiKey(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = supabaseAdmin
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("payment_status", status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ orders: data ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
