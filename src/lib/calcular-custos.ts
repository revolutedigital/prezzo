import { prisma } from "./prisma";

/**
 * Calcula o custo total de um produto (variação) incluindo materiais e mão de obra
 */
export async function calcularCustoProduto(variacaoProdutoId: string) {
  // Buscar composição de matérias-primas
  const materiais = await prisma.composicaoProduto.findMany({
    where: { variacaoProdutoId },
    include: { materiaPrima: true },
  });

  const custoMateriais = materiais.reduce((total, item) => {
    return total + Number(item.quantidade) * Number(item.materiaPrima.custoUnitario);
  }, 0);

  // Buscar composição de mão de obra
  const maoDeObra = await prisma.composicaoMaoDeObra.findMany({
    where: { variacaoProdutoId },
    include: { tipoMaoDeObra: true },
  });

  const custoMaoDeObra = maoDeObra.reduce((total, item) => {
    const custoHora = Number(item.tipoMaoDeObra.custoHora);
    const custoMaquina = item.tipoMaoDeObra.incluiMaquina
      ? Number(item.tipoMaoDeObra.custoMaquinaHora || 0)
      : 0;
    const custoTotalHora = custoHora + custoMaquina;

    return total + Number(item.horasNecessarias) * custoTotalHora;
  }, 0);

  const custoTotal = custoMateriais + custoMaoDeObra;

  return {
    custoMateriais,
    custoMaoDeObra,
    custoTotal,
  };
}

/**
 * Recalcula todos os itens de produto de uma variação
 * Chamado quando custos de materiais ou mão de obra mudam
 */
export async function recalcularItensProduto(variacaoProdutoId: string) {
  const { custoTotal } = await calcularCustoProduto(variacaoProdutoId);

  // Buscar todos os itens de produto desta variação
  const itens = await prisma.itemProduto.findMany({
    where: { variacaoProdutoId },
  });

  // Atualizar cada item com novo custo e preço
  const updates = itens.map((item) => {
    const margemLucro = Number(item.margemLucro);
    const novoPrecoVenda = custoTotal * (1 + margemLucro / 100);

    return prisma.itemProduto.update({
      where: { id: item.id },
      data: {
        custoCalculado: custoTotal,
        precoVenda: novoPrecoVenda,
      },
    });
  });

  await Promise.all(updates);

  return { itensAtualizados: updates.length };
}
