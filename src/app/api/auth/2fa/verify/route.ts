import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { verify2FAToken } from "@/lib/two-factor-auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Get user's secret
    const user = await prisma.$queryRaw<any[]>`
      SELECT twoFactorSecret FROM User WHERE id = ${session.user.id} LIMIT 1
    `;

    if (!user || user.length === 0 || !user[0].twoFactorSecret) {
      return NextResponse.json({ error: "2FA not configured" }, { status: 400 });
    }

    const isValid = verify2FAToken(user[0].twoFactorSecret, token);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    return NextResponse.json({ valid: true, message: "Token verified successfully" });
  } catch (error: any) {
    console.error("Error verifying 2FA:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
