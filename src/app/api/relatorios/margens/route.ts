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

    // Buscar todos os produtos com suas composições
    const produtos = await prisma.itemProduto.findMany({
      where: {
        ativo: true,
      },
      include: {
        variacaoProduto: {
          include: {
            tipoProduto: true,
          },
        },
      },
      orderBy: {
        margemLucro: "asc", // Ordenar por margem (menor para maior)
      },
    });

    // Formatar dados para o relatório
    const relatorio = produtos.map((item) => {
      const custoCalculado = Number(item.custoCalculado);
      const margemLucro = Number(item.margemLucro);
      const precoVenda = Number(item.precoVenda);
      const lucroUnitario = precoVenda - custoCalculado;

      return {
        id: item.id,
        nome: `${item.variacaoProduto.tipoProduto.nome} - ${item.variacaoProduto.nome}`,
        tipoProduto: item.variacaoProduto.tipoProduto.nome,
        custoCalculado,
        margemLucro,
        precoVenda,
        lucroUnitario,
        tabelaPreco: item.tabelaPreco,
      };
    });

    return NextResponse.json(relatorio);
  } catch (error) {
    console.error("Erro ao gerar relatório de margens:", error);
    return NextResponse.json({ error: "Erro ao gerar relatório" }, { status: 500 });
  }
}
