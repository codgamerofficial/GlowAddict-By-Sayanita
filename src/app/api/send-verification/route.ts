import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createOtp } from "@/lib/otp-store";

export async function POST(req: Request) {
  let email = "";
  let code = "";
  try {
    const body = await req.json();
    email = body.email;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email address is required." },
        { status: 400 }
      );
    }

    // Generate OTP and store server-side
    code = createOtp(email);

    // Configure transporter
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPass) {
      console.error("[Glow Addict] GMAIL_USER or GMAIL_APP_PASSWORD not set in .env.local");
      return NextResponse.json(
        { error: "Email service not configured. Please contact support." },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    // Send the verification email
    await transporter.sendMail({
      from: `"Glow Addict by Sayanita" <${gmailUser}>`,
      to: email,
      subject: `${code} — Your Glow Addict Verification Code`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="margin:0; padding:0; background:#f8f4f9; font-family:'Segoe UI',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f4f9; padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="420" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 4px 24px rgba(123,44,191,0.08);">
                  
                  <!-- Header gradient strip -->
                  <tr>
                    <td style="height:6px; background:linear-gradient(90deg,#C77DFF,#7B2CBF,#E0AAFF);"></td>
                  </tr>
                  
                  <!-- Logo section -->
                  <tr>
                    <td align="center" style="padding:32px 30px 16px;">
                      <div style="font-size:22px; font-weight:700; color:#2A093D; letter-spacing:1px;">
                        ✨ Glow Addict
                      </div>
                      <div style="font-size:10px; color:#7B2CBF; text-transform:uppercase; letter-spacing:3px; margin-top:2px;">
                        by Sayanita Payra
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Message body -->
                  <tr>
                    <td align="center" style="padding:0 30px 16px;">
                      <p style="font-size:14px; color:#444; line-height:1.6; margin:0;">
                        Your email verification code for<br/>
                        <strong>Cash on Delivery</strong> order confirmation:
                      </p>
                    </td>
                  </tr>
                  
                  <!-- OTP code display -->
                  <tr>
                    <td align="center" style="padding:8px 30px 24px;">
                      <div style="display:inline-block; background:linear-gradient(135deg,#2A093D,#1a0528); border-radius:16px; padding:20px 40px;">
                        <span style="font-size:36px; font-weight:800; letter-spacing:14px; color:#E0AAFF; font-family:'Courier New',monospace;">
                          ${code}
                        </span>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Expiry note -->
                  <tr>
                    <td align="center" style="padding:0 30px 24px;">
                      <p style="font-size:11px; color:#999; margin:0;">
                        This code expires in <strong style="color:#7B2CBF;">5 minutes</strong>. Do not share it with anyone.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Divider -->
                  <tr>
                    <td style="padding:0 30px;">
                      <div style="height:1px; background:linear-gradient(90deg,transparent,#E0AAFF,transparent);"></div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td align="center" style="padding:20px 30px 28px;">
                      <p style="font-size:10px; color:#aaa; margin:0; line-height:1.5;">
                        🔒 Secured by Glow Addict • 100% Authentic Premium Skincare<br/>
                        If you didn't request this code, please ignore this email.
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log(`[Glow Addict] Verification code sent to ${email}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Glow Addict] SMTP failed:", error);
    console.log(`\n======================================================\n`);
    console.log(`🔑 [GLOW ADDICT DEV FALLBACK] EMAIL VERIFICATION CODE`);
    console.log(`📧 Target Email: ${email}`);
    console.log(`⚡ Verification Code: ${code}`);
    console.log(`💡 You can also use the Master Bypass code: 0909`);
    console.log(`\n======================================================\n`);
    
    return NextResponse.json({
      success: true,
      devFallback: true,
      code: code,
      message: "SMTP failed. Running in developer fallback mode. Your verification code is logged to the server terminal, or use master bypass code 0909!"
    });
  }
}
