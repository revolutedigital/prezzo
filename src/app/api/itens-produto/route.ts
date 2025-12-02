import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const itensProduto = await prisma.itemProduto.findMany({
      include: {
        variacaoProduto: {
          include: {
            tipoProduto: true,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calcular informações adicionais para cada item
    const itensComDetalhes = itensProduto.map((item) => {
      const variacaoProduto = item.variacaoProduto;

      // Calcular custo de matérias-primas
      const custoMateriasPrimas = variacaoProduto.composicao.reduce((total, comp) => {
        const custo = comp.materiaPrima.custoUnitario.toNumber();
        const quantidade = comp.quantidade.toNumber();
        return total + custo * quantidade;
      }, 0);

      // Calcular custo de mão de obra
      const custoMaoDeObra = variacaoProduto.composicaoMaoDeObra.reduce((total, comp) => {
        const custoHora = comp.tipoMaoDeObra.custoHora.toNumber();
        const custoMaquina = comp.tipoMaoDeObra.custoMaquinaHora?.toNumber() || 0;
        const horas = comp.horasNecessarias.toNumber();
        return total + (custoHora + custoMaquina) * horas;
      }, 0);

      const custoTotal = custoMateriasPrimas + custoMaoDeObra;
      const margemPadrao = variacaoProduto.margemPadrao.toNumber();
      const precoSugerido = custoTotal * (1 + margemPadrao / 100);

      return {
        id: item.id,
        nome: `${variacaoProduto.tipoProduto.nome} - ${variacaoProduto.nome}`,
        codigo: variacaoProduto.codigo,
        ativo: item.ativo,
        variacaoProduto: {
          id: variacaoProduto.id,
          nome: variacaoProduto.nome,
          margemPadrao: margemPadrao,
          custoCalculado: custoTotal,
          precoSugerido: precoSugerido,
          tipoProduto: {
            nome: variacaoProduto.tipoProduto.nome,
          },
        },
      };
    });

    return NextResponse.json(itensComDetalhes);
  } catch (error) {
    console.error("Erro ao buscar itens de produto:", error);
    return NextResponse.json({ error: "Erro ao buscar itens de produto" }, { status: 500 });
  }
}
