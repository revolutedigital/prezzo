import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getOrcamentoVersions,
  getOrcamentoVersion,
  restoreOrcamentoVersion,
} from "@/lib/orcamento-versioning";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const version = searchParams.get("version");

  if (version) {
    // Get specific version
    const versionData = await getOrcamentoVersion(params.id, parseInt(version));

    if (!versionData) {
      return NextResponse.json({ error: "Versão não encontrada" }, { status: 404 });
    }

    return NextResponse.json(versionData);
  } else {
    // Get all versions
    const versions = await getOrcamentoVersions(params.id);
    return NextResponse.json(versions);
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { action, version } = body;

  if (action === "restore" && version) {
    try {
      await restoreOrcamentoVersion(params.id, version);
      return NextResponse.json({ message: "Orçamento restaurado com sucesso" });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
}
