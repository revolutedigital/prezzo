import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { atualizacaoIds } = body; // Array de IDs das atualizações a confirmar

    if (!Array.isArray(atualizacaoIds) || atualizacaoIds.length === 0) {
      return NextResponse.json(
        { error: "IDs de atualização inválidos" },
        { status: 400 }
      );
    }

    // Buscar atualizações
    const atualizacoes = await prisma.atualizacaoCusto.findMany({
      where: {
        id: { in: atualizacaoIds },
        notaFiscalId: id,
        userId: session.user.id,
        confirmado: false,
      },
      include: {
        materiaPrima: true,
      },
    });

    if (atualizacoes.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma atualização válida encontrada" },
        { status: 404 }
      );
    }

    // Processar cada atualização
    const resultados = [];

    for (const atualizacao of atualizacoes) {
      // Atualizar custo da matéria-prima
      await prisma.materiaPrima.update({
        where: { id: atualizacao.materiaPrimaId },
        data: {
          custoUnitario: atualizacao.custoNovo,
        },
      });

      // Criar registro no histórico
      await prisma.historicoCusto.create({
        data: {
          materiaPrimaId: atualizacao.materiaPrimaId,
          custoAnterior: atualizacao.custoAnterior,
          custoNovo: atualizacao.custoNovo,
          percentualMudanca: atualizacao.percentualMudanca,
          motivo: "NF",
          notaFiscalId: id,
          userId: session.user.id,
        },
      });

      // Marcar atualização como confirmada
      await prisma.atualizacaoCusto.update({
        where: { id: atualizacao.id },
        data: { confirmado: true },
      });

      resultados.push({
        id: atualizacao.id,
        materiaPrima: atualizacao.materiaPrima.nome,
        custoAnterior: atualizacao.custoAnterior,
        custoNovo: atualizacao.custoNovo,
        percentualMudanca: atualizacao.percentualMudanca,
      });
    }

    // Atualizar preços dos produtos que usam essas matérias-primas
    await recalcularPrecosProdutos(atualizacoes.map((a) => a.materiaPrimaId));

    return NextResponse.json({
      message: `${resultados.length} custo(s) atualizado(s) com sucesso`,
      atualizacoes: resultados,
    });
  } catch (error) {
    console.error("Erro ao confirmar atualizações:", error);
    return NextResponse.json(
      { error: "Erro ao confirmar atualizações" },
      { status: 500 }
    );
  }
}

// Recalcular preços dos produtos afetados
async function recalcularPrecosProdutos(materiaPrimaIds: string[]) {
  // Buscar todas as variações que usam essas matérias-primas
  const composicoes = await prisma.composicaoProduto.findMany({
    where: {
      materiaPrimaId: { in: materiaPrimaIds },
    },
    include: {
      variacaoProduto: {
        include: {
          composicao: {
            include: {
              materiaPrima: true,
            },
          },
          itensProduto: true,
        },
      },
    },
  });

  // Agrupar por variação
  const variacoesMap = new Map();

  composicoes.forEach((comp) => {
    if (!variacoesMap.has(comp.variacaoProdutoId)) {
      variacoesMap.set(comp.variacaoProdutoId, comp.variacaoProduto);
    }
  });

  // Recalcular custo de cada variação e seus itens
  for (const variacao of variacoesMap.values()) {
    // Calcular custo total da composição
    let custoTotal = 0;

    for (const comp of variacao.composicao) {
      const custoMateria = Number(comp.materiaPrima.custoUnitario);
      const quantidade = Number(comp.quantidade);
      custoTotal += custoMateria * quantidade;
    }

    // Atualizar cada item produto dessa variação
    for (const itemProduto of variacao.itensProduto) {
      const margemLucro = Number(itemProduto.margemLucro);
      const precoVenda = custoTotal * (1 + margemLucro / 100);

      await prisma.itemProduto.update({
        where: { id: itemProduto.id },
        data: {
          custoCalculado: custoTotal,
          precoVenda: precoVenda,
        },
      });
    }
  }
}
