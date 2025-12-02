import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { compareOrcamentoVersions } from "@/lib/orcamento-versioning";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const searchParams = request.nextUrl.searchParams;
  const version1 = searchParams.get("v1");
  const version2 = searchParams.get("v2");

  if (!version1 || !version2) {
    return NextResponse.json({ error: "Parâmetros v1 e v2 são obrigatórios" }, { status: 400 });
  }

  try {
    const comparison = await compareOrcamentoVersions(
      id,
      parseInt(version1),
      parseInt(version2)
    );

    return NextResponse.json(comparison);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
