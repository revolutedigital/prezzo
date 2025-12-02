import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar estatísticas gerais
    const [
      totalMateriasPrimas,
      totalTiposProduto,
      totalVariacoes,
      totalOrcamentos,
      orcamentosAprovados,
      orcamentosEnviados,
      orcamentosRascunho,
    ] = await Promise.all([
      prisma.materiaPrima.count({ where: { ativo: true } }),
      prisma.tipoProduto.count({ where: { ativo: true } }),
      prisma.variacaoProduto.count({ where: { ativo: true } }),
      prisma.orcamento.count(),
      prisma.orcamento.count({ where: { status: "aprovado" } }),
      prisma.orcamento.count({ where: { status: "enviado" } }),
      prisma.orcamento.count({ where: { status: "rascunho" } }),
    ]);

    // Valor total de orçamentos aprovados
    const orcamentosAprovadosData = await prisma.orcamento.findMany({
      where: { status: "aprovado" },
      select: { total: true },
    });

    const valorTotalAprovado = orcamentosAprovadosData.reduce(
      (acc, orc) => acc + Number(orc.total),
      0
    );

    // Valor médio por orçamento
    const valorMedio = orcamentosAprovados > 0 ? valorTotalAprovado / orcamentosAprovados : 0;

    // Taxa de conversão
    const orcamentosEnviadosOuAprovados = orcamentosEnviados + orcamentosAprovados;
    const taxaConversao =
      orcamentosEnviadosOuAprovados > 0
        ? (orcamentosAprovados / orcamentosEnviadosOuAprovados) * 100
        : 0;

    // Orçamentos por mês (últimos 6 meses)
    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);

    const orcamentosPorMes = await prisma.orcamento.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: {
          gte: seisMesesAtras,
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        total: true,
      },
    });

    // Processar dados por mês
    const mesesMap = new Map<string, { count: number; value: number }>();

    orcamentosPorMes.forEach((item) => {
      const mes = new Date(item.createdAt).toISOString().slice(0, 7); // YYYY-MM
      const existing = mesesMap.get(mes) || { count: 0, value: 0 };
      mesesMap.set(mes, {
        count: existing.count + item._count.id,
        value: existing.value + Number(item._sum.total || 0),
      });
    });

    // Converter para array ordenado
    const orcamentosPorMesArray = Array.from(mesesMap.entries())
      .map(([mes, data]) => ({
        mes,
        count: data.count,
        value: data.value,
      }))
      .sort((a, b) => a.mes.localeCompare(b.mes));

    // Top 5 produtos mais vendidos (por quantidade em orçamentos aprovados)
    const topProdutos = await prisma.itemOrcamento.groupBy({
      by: ["itemProdutoId"],
      where: {
        orcamento: {
          status: "aprovado",
        },
      },
      _sum: {
        quantidade: true,
        total: true,
      },
      orderBy: {
        _sum: {
          quantidade: "desc",
        },
      },
      take: 5,
    });

    // Buscar informações dos produtos
    const topProdutosComInfo = await Promise.all(
      topProdutos.map(async (item) => {
        const produto = await prisma.itemProduto.findUnique({
          where: { id: item.itemProdutoId },
          include: {
            variacaoProduto: {
              include: {
                tipoProduto: true,
              },
            },
          },
        });

        return {
          id: item.itemProdutoId,
          nome: produto
            ? `${produto.variacaoProduto.tipoProduto.nome} - ${produto.variacaoProduto.nome}`
            : "Produto removido",
          quantidade: Number(item._sum.quantidade || 0),
          valor: Number(item._sum.total || 0),
        };
      })
    );

    // Orçamentos recentes (últimos 5)
    const orcamentosRecentes = await prisma.orcamento.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        numero: true,
        clienteNome: true,
        total: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      resumo: {
        totalMateriasPrimas,
        totalTiposProduto,
        totalVariacoes,
        totalOrcamentos,
        orcamentosAprovados,
        orcamentosEnviados,
        orcamentosRascunho,
        valorTotalAprovado,
        valorMedio,
        taxaConversao,
      },
      orcamentosPorMes: orcamentosPorMesArray,
      topProdutos: topProdutosComInfo,
      orcamentosRecentes,
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return NextResponse.json({ error: "Erro ao buscar estatísticas" }, { status: 500 });
  }
}
