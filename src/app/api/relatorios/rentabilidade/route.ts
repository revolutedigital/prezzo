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

    // Buscar orçamentos aprovados com itens
    const orcamentos = await prisma.orcamento.findMany({
      where: {
        status: "aprovado",
      },
      include: {
        itens: {
          include: {
            itemProduto: {
              select: {
                custoCalculado: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calcular rentabilidade de cada orçamento
    const relatorio = orcamentos.map((orc) => {
      // Calcular custo total e lucro total
      let custoTotal = 0;
      let margemSoma = 0;

      orc.itens.forEach((item) => {
        const custoItem = Number(item.itemProduto.custoCalculado) * Number(item.quantidade);
        custoTotal += custoItem;

        // Calcular margem do item
        const precoItem = Number(item.total);
        if (custoItem > 0) {
          const margemItem = ((precoItem - custoItem) / custoItem) * 100;
          margemSoma += margemItem;
        }
      });

      const total = Number(orc.total);
      const lucroTotal = total - custoTotal;
      const margemMedia = orc.itens.length > 0 ? margemSoma / orc.itens.length : 0;

      return {
        id: orc.id,
        numero: orc.numero,
        clienteNome: orc.clienteNome,
        subtotal: Number(orc.subtotal),
        desconto: Number(orc.desconto),
        total,
        createdAt: orc.createdAt.toISOString(),
        custoTotal,
        lucroTotal,
        margemMedia,
      };
    });

    return NextResponse.json(relatorio);
  } catch (error) {
    console.error("Erro ao gerar relatório de rentabilidade:", error);
    return NextResponse.json({ error: "Erro ao gerar relatório" }, { status: 500 });
  }
}
