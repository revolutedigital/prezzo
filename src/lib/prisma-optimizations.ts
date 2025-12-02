import { prisma } from "@/lib/prisma";

/**
 * Otimizações de queries Prisma
 *
 * Este arquivo contém exemplos e helpers para queries otimizadas
 */

/**
 * ❌ MAU: Inclui tudo desnecessariamente
 */
export async function getProdutoUnoptimized(id: string) {
  return await prisma.tipoProduto.findUnique({
    where: { id },
    include: {
      variacoes: {
        include: {
          composicao: {
            include: {
              materiaPrima: true,
            },
          },
          composicaoMaoDeObra: {
            include: {
              tipoMaoDeObra: true,
            },
          },
        },
      },
    },
  });
}

/**
 * ✅ BOM: Seleciona apenas campos necessários
 */
export async function getProdutoOptimized(id: string) {
  return await prisma.tipoProduto.findUnique({
    where: { id },
    select: {
      id: true,
      nome: true,
      codigo: true,
      descricao: true,
      categoria: true,
      ativo: true,
    },
  });
}

/**
 * ✅ BOM: Lista paginada com select específico
 */
export async function getProdutosPaginados(page: number, limit: number) {
  const skip = (page - 1) * limit;

  const [produtos, total] = await Promise.all([
    prisma.tipoProduto.findMany({
      select: {
        id: true,
        nome: true,
        codigo: true,
        categoria: true,
        ativo: true,
      },
      skip,
      take: limit,
      orderBy: { nome: "asc" },
    }),
    prisma.tipoProduto.count(),
  ]);

  return {
    produtos,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * ✅ BOM: Raw query para operações complexas
 */
export async function getTopOrcamentos(limit: number = 10) {
  const topOrcamentos = await prisma.$queryRaw<
    Array<{
      id: string;
      clienteNome: string;
      total: number;
    }>
  >`
    SELECT o.id, o.clienteNome, o.total
    FROM Orcamento o
    WHERE o.status = 'aprovado'
    ORDER BY o.total DESC
    LIMIT ${limit}
  `;

  return topOrcamentos;
}

/**
 * ✅ BOM: Transação para operações atômicas
 */
export async function criarOrcamentoComItens(
  orcamentoData: any,
  itensData: any[]
) {
  return await prisma.$transaction(async (tx) => {
    // Criar orçamento
    const orcamento = await tx.orcamento.create({
      data: orcamentoData,
    });

    // Criar itens
    await tx.itemOrcamento.createMany({
      data: itensData.map((item) => ({
        ...item,
        orcamentoId: orcamento.id,
      })),
    });

    return orcamento;
  });
}

/**
 * ✅ BOM: Agregações otimizadas
 */
export async function getEstatisticasOrcamentos(userId: string) {
  const stats = await prisma.orcamento.groupBy({
    by: ["status"],
    where: { userId },
    _count: {
      id: true,
    },
    _sum: {
      total: true,
    },
  });

  return stats;
}

/**
 * ✅ BOM: Queries em paralelo para dashboard
 */
export async function getDashboardData(userId: string) {
  const [totalOrcamentos, totalProdutos, orcamentosRecentes] = await Promise.all([
    prisma.orcamento.count({ where: { userId } }),
    prisma.tipoProduto.count(),
    prisma.orcamento.findMany({
      where: { userId },
      select: {
        id: true,
        numero: true,
        clienteNome: true,
        total: true,
        status: true,
        createdAt: true,
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    totalOrcamentos,
    totalProdutos,
    orcamentosRecentes,
  };
}

/**
 * GUIA DE OTIMIZAÇÕES:
 *
 * 1. USE SELECT AO INVÉS DE INCLUDE quando possível
 *    - Include traz TODOS os campos
 *    - Select permite escolher apenas campos necessários
 *
 * 2. USE PROMISE.ALL para queries paralelas
 *    - Ao invés de múltiplos awaits sequenciais
 *    - Reduz tempo total de execução
 *
 * 3. USE PAGINAÇÃO sempre em listas
 *    - skip e take para limitar resultados
 *    - count() em paralelo para total de páginas
 *
 * 4. USE ÍNDICES no banco de dados
 *    - Veja prisma/migrations/add_performance_indexes.sql
 *    - Índices em campos usados em WHERE, ORDER BY
 *
 * 5. USE RAW QUERIES para operações complexas
 *    - $queryRaw para SELECTs com JOINs complexos
 *    - $executeRaw para INSERTs/UPDATEs em massa
 *
 * 6. USE TRANSAÇÕES para operações atômicas
 *    - prisma.$transaction() garante atomicidade
 *    - Rollback automático em caso de erro
 *
 * 7. USE GROUPBY para agregações
 *    - Mais eficiente que buscar tudo e processar
 *    - _count, _sum, _avg, _min, _max disponíveis
 */
