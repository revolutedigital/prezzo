import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { enable2FA } from "@/lib/two-factor-auth";

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

    const success = await enable2FA(session.user.id, token);

    if (!success) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    return NextResponse.json({ message: "2FA enabled successfully" });
  } catch (error: any) {
    console.error("Error enabling 2FA:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
