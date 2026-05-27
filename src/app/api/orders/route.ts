import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, items, total_amount, delivery_charge, payment_method, shipping_address, freebies } = body;

    if (!id || !items || !total_amount || !payment_method || !shipping_address) {
      return NextResponse.json({ error: "Missing required order fields." }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("orders")
      .insert({
        id,
        user_id: body.userId || null,
        customer_name: shipping_address.name,
        customer_phone: shipping_address.phone,
        customer_email: shipping_address.email,
        street_address: shipping_address.address,
        city: shipping_address.city,
        state: shipping_address.state,
        zip_code: shipping_address.zipCode,
        items,
        total_amount,
        delivery_charge: delivery_charge || 0,
        payment_method,
        payment_status: payment_method === "COD" ? "pending" : "pending",
        order_status: payment_method === "COD" ? "packed" : "created",
        freebies: freebies || {},
      })
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
