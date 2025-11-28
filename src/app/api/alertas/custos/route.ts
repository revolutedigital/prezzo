import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar atualizações de custo recentes não confirmadas
    const atualizacoesNaoConfirmadas = await prisma.atualizacaoCusto.findMany({
      where: {
        userId: session.user.id,
        confirmado: false,
      },
      include: {
        materiaPrima: {
          select: {
            id: true,
            nome: true,
            codigo: true,
            unidadeMedida: true,
          },
        },
        notaFiscal: {
          select: {
            id: true,
            nomeArquivo: true,
            fornecedor: true,
            numeroNF: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    // Contar atualizações por impacto
    const totalAtualizacoes = atualizacoesNaoConfirmadas.length;
    const altoImpacto = atualizacoesNaoConfirmadas.filter(
      (a) => Math.abs(Number(a.percentualMudanca)) > 20
    ).length;
    const medioImpacto = atualizacoesNaoConfirmadas.filter(
      (a) =>
        Math.abs(Number(a.percentualMudanca)) >= 10 &&
        Math.abs(Number(a.percentualMudanca)) <= 20
    ).length;
    const baixoImpacto = atualizacoesNaoConfirmadas.filter(
      (a) => Math.abs(Number(a.percentualMudanca)) < 10
    ).length;

    // Agrupar por nota fiscal
    const notasFiscaisComAtualizacoes = await prisma.notaFiscal.findMany({
      where: {
        userId: session.user.id,
        status: "processado",
        atualizacoes: {
          some: {
            confirmado: false,
          },
        },
      },
      include: {
        _count: {
          select: {
            atualizacoes: {
              where: {
                confirmado: false,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    return NextResponse.json({
      resumo: {
        totalAtualizacoes,
        altoImpacto,
        medioImpacto,
        baixoImpacto,
        notasFiscaisPendentes: notasFiscaisComAtualizacoes.length,
      },
      atualizacoes: atualizacoesNaoConfirmadas,
      notasFiscais: notasFiscaisComAtualizacoes,
    });
  } catch (error) {
    console.error("Erro ao buscar alertas de custo:", error);
    return NextResponse.json(
      { error: "Erro ao buscar alertas" },
      { status: 500 }
    );
  }
}
