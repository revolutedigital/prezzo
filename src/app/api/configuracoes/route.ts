import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let configuracao = await prisma.$queryRaw<any[]>`
      SELECT * FROM Configuracao WHERE userId = ${session.user.id} LIMIT 1
    `;

    // Se não existe, criar configuração padrão
    if (!configuracao || configuracao.length === 0) {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await prisma.$executeRaw`
        INSERT INTO Configuracao (
          id, userId, moeda, idioma, margemPadraoMin, margemPadraoMax,
          validadePadraoOrcamento, enable2FA, createdAt, updatedAt
        )
        VALUES (
          ${id},
          ${session.user.id},
          'BRL',
          'pt-BR',
          20.0,
          50.0,
          30,
          false,
          ${new Date().toISOString()},
          ${new Date().toISOString()}
        )
      `;

      configuracao = await prisma.$queryRaw<any[]>`
        SELECT * FROM Configuracao WHERE id = ${id} LIMIT 1
      `;
    }

    return NextResponse.json(configuracao[0]);
  } catch (error) {
    console.error("Erro ao buscar configuração:", error);
    return NextResponse.json({ error: "Erro ao buscar configuração" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      empresaNome,
      empresaCNPJ,
      empresaLogo,
      empresaEndereco,
      empresaTelefone,
      empresaEmail,
      moeda,
      idioma,
      margemPadraoMin,
      margemPadraoMax,
      validadePadraoOrcamento,
      enable2FA,
    } = body;

    // Buscar configuração existente
    const existing = await prisma.$queryRaw<any[]>`
      SELECT id FROM Configuracao WHERE userId = ${session.user.id} LIMIT 1
    `;

    if (existing && existing.length > 0) {
      // Atualizar
      await prisma.$executeRaw`
        UPDATE Configuracao
        SET
          empresaNome = ${empresaNome || null},
          empresaCNPJ = ${empresaCNPJ || null},
          empresaLogo = ${empresaLogo || null},
          empresaEndereco = ${empresaEndereco || null},
          empresaTelefone = ${empresaTelefone || null},
          empresaEmail = ${empresaEmail || null},
          moeda = ${moeda || "BRL"},
          idioma = ${idioma || "pt-BR"},
          margemPadraoMin = ${margemPadraoMin || 20.0},
          margemPadraoMax = ${margemPadraoMax || 50.0},
          validadePadraoOrcamento = ${validadePadraoOrcamento || 30},
          enable2FA = ${enable2FA || false},
          updatedAt = ${new Date().toISOString()}
        WHERE id = ${existing[0].id}
      `;
    } else {
      // Criar novo
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await prisma.$executeRaw`
        INSERT INTO Configuracao (
          id, userId, empresaNome, empresaCNPJ, empresaLogo, empresaEndereco,
          empresaTelefone, empresaEmail, moeda, idioma, margemPadraoMin,
          margemPadraoMax, validadePadraoOrcamento, enable2FA, createdAt, updatedAt
        )
        VALUES (
          ${id},
          ${session.user.id},
          ${empresaNome || null},
          ${empresaCNPJ || null},
          ${empresaLogo || null},
          ${empresaEndereco || null},
          ${empresaTelefone || null},
          ${empresaEmail || null},
          ${moeda || "BRL"},
          ${idioma || "pt-BR"},
          ${margemPadraoMin || 20.0},
          ${margemPadraoMax || 50.0},
          ${validadePadraoOrcamento || 30},
          ${enable2FA || false},
          ${new Date().toISOString()},
          ${new Date().toISOString()}
        )
      `;
    }

    return NextResponse.json({ message: "Configuração salva com sucesso" });
  } catch (error) {
    console.error("Erro ao salvar configuração:", error);
    return NextResponse.json({ error: "Erro ao salvar configuração" }, { status: 500 });
  }
}
