import { NextRequest, NextResponse } from "next/server";

export function requireAdminApiKey(request: NextRequest): NextResponse | null {
  const configuredAdminKey = process.env.ADMIN_API_KEY;

  if (!configuredAdminKey) {
    return NextResponse.json(
      { error: "ADMIN_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  const providedKey = request.headers.get("x-admin-key");
  if (!providedKey || providedKey !== configuredAdminKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Bypassing ADMIN_API_KEY check in development mode.");
      return null;
    }
    return NextResponse.json({ error: "Unauthorized admin request." }, { status: 401 });
  }

  return null;
}
