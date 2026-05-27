import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const trackingId = searchParams.get("trackingId") || "SR-7182936";
  const orderId = searchParams.get("orderId") || "ORD-928371";

  if (action === "track") {
    // Return simulated Shiprocket tracking payload
    return NextResponse.json({
      success: true,
      tracking_id: trackingId,
      courier_name: "BlueDart Express",
      status: "In Transit",
      origin: "Kolkata, WB",
      destination: "New Delhi, DL",
      estimated_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      shipment_timeline: [
        { status: "Shipment Picked Up", date: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toLocaleString(), location: "Kolkata Hub" },
        { status: "In Transit - Departed Kolkata", date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleString(), location: "Kolkata Air Facility" },
        { status: "Arrived at Sorting Hub", date: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toLocaleString(), location: "Delhi Gateway" },
        { status: "Out for Delivery", date: new Date().toLocaleString(), location: "Delhi North Center" }
      ]
    });
  }

  if (action === "label") {
    // Generate a printable HTML/SVG mock Shiprocket dispatch label
    const labelHtml = `
      <div style="width: 380px; font-family: 'Inter', sans-serif; border: 3px double #000; padding: 15px; margin: 10px auto; background-color: #fff; color: #000; box-shadow: 2px 2px 10px rgba(0,0,0,0.15); border-radius: 8px;">
        <div style="display: flex; justify-between; border-bottom: 2px solid #000; padding-bottom: 8px;">
          <div>
            <h2 style="margin: 0; font-size: 16px; font-weight: 800; text-transform: uppercase;">Shiprocket</h2>
            <span style="font-size: 9px; font-weight: 600; background: #000; color: #fff; padding: 2px 6px; border-radius: 3px;">PREPAID</span>
          </div>
          <div style="text-align: right;">
            <span style="font-size: 10px; font-weight: bold; display: block;">COURIER: BLUE DART</span>
            <span style="font-size: 8px; color: #555;">AIRWAY BILL (AWB): ${trackingId}</span>
          </div>
        </div>
        
        <div style="padding: 10px 0; border-bottom: 1px dashed #000; text-align: center;">
          <!-- Barcode simulation -->
          <div style="background: repeating-linear-gradient(90deg, #000, #000 2px, #fff 2px, #fff 8px); height: 45px; width: 100%; margin: 5px 0;"></div>
          <span style="font-size: 10px; font-family: monospace; letter-spacing: 2px;">*(${orderId})*</span>
        </div>

        <div style="font-size: 11px; padding: 8px 0; border-bottom: 1px dashed #000; line-height: 1.4;">
          <strong>SHIP TO:</strong><br/>
          Name: Priyanjali Sen<br/>
          Phone: +91 98765 43210<br/>
          Address: Lane 5, Block B, Preet Vihar<br/>
          City: New Delhi - 110092, Delhi
        </div>

        <div style="font-size: 11px; padding: 8px 0; line-height: 1.4;">
          <strong>SHIPPED BY:</strong><br/>
          <strong>Glow Addict By Sayanita</strong><br/>
          Address: Salt Lake Sector V, Kolkata, West Bengal - 700091<br/>
          Contact: sayanitapayra@gmail.com | +91 85093 26600
        </div>

        <div style="border-top: 2px solid #000; padding-top: 6px; font-size: 9px; text-align: center; color: #666;">
          This is an automatically generated Shiprocket fulfillment label. No signature required.
        </div>
      </div>
    `;

    return new NextResponse(labelHtml, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  }

  return NextResponse.json({ error: "Action parameter 'track' or 'label' is required." }, { status: 400 });
}
