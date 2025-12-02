import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generate2FASecret, generate2FAQRCode } from "@/lib/two-factor-auth";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const secret = await generate2FASecret(
      session.user.id,
      session.user.name || session.user.email
    );
    const qrCode = await generate2FAQRCode(secret.otpauth_url || "");

    return NextResponse.json({
      secret: secret.base32,
      qrCode,
      otpauth_url: secret.otpauth_url,
    });
  } catch (error: any) {
    console.error("Error setting up 2FA:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
