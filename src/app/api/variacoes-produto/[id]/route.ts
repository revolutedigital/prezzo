import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Buscar variação por ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const variacao = await prisma.variacaoProduto.findUnique({
      where: { id: id },
      include: {
        tipoProduto: true,
        composicao: {
          include: {
            materiaPrima: true,
          },
          orderBy: { ordem: "asc" },
        },
        composicaoMaoDeObra: {
          include: {
            tipoMaoDeObra: true,
          },
          orderBy: { ordem: "asc" },
        },
        _count: {
          select: {
            itensProduto: true,
          },
        },
      },
    });

    if (!variacao) {
      return NextResponse.json(
        { error: "Variação não encontrada" },
        { status: 404 }
      );
    }

    // Calcular custos
    const custoMateriais = variacao.composicao.reduce((acc, comp) => {
      return acc + Number(comp.quantidade) * Number(comp.materiaPrima.custoUnitario);
    }, 0);

    const custoMaoDeObra = variacao.composicaoMaoDeObra.reduce((acc, comp) => {
      const custoHora = Number(comp.tipoMaoDeObra.custoHora);
      const custoMaquina = comp.tipoMaoDeObra.incluiMaquina
        ? Number(comp.tipoMaoDeObra.custoMaquinaHora || 0)
        : 0;
      const custoTotalHora = custoHora + custoMaquina;
      return acc + Number(comp.horasNecessarias) * custoTotalHora;
    }, 0);

    const custoTotal = custoMateriais + custoMaoDeObra;
    const margemLucro = Number(variacao.margemPadrao);
    const precoSugerido = custoTotal * (1 + margemLucro / 100);

    return NextResponse.json({
      ...variacao,
      custoMateriais,
      custoMaoDeObra,
      custoCalculado: custoTotal,
      precoSugerido,
    });
  } catch (error) {
    console.error("Erro ao buscar variação:", error);
    return NextResponse.json(
      { error: "Erro ao buscar variação" },
      { status: 500 }
    );
  }
}
