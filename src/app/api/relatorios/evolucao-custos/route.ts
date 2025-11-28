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

    // Buscar histórico de custos (últimos 20)
    const historico = await prisma.historicoCusto.findMany({
      take: 20,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        materiaPrima: {
          select: {
            id: true,
            nome: true,
            unidadeMedida: true,
          },
        },
      },
    });

    // Buscar evolução de cada matéria-prima com histórico
    const materiasComHistorico = await prisma.materiaPrima.findMany({
      where: {
        historicoCustos: {
          some: {},
        },
      },
      include: {
        historicoCustos: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      take: 5, // Top 5 materiais com mais mudanças
    });

    // Formatar evolução para gráficos
    const evolucao = materiasComHistorico.map((material) => {
      const historico = material.historicoCustos.map((h) => ({
        data: h.createdAt.toISOString(),
        custo: Number(h.custoNovo),
      }));

      return {
        materiaPrimaId: material.id,
        nome: material.nome,
        historico,
      };
    });

    return NextResponse.json({
      historico,
      evolucao,
    });
  } catch (error) {
    console.error("Erro ao gerar relatório de evolução:", error);
    return NextResponse.json(
      { error: "Erro ao gerar relatório" },
      { status: 500 }
    );
  }
}
