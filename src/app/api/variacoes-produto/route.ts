import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const variacaoProdutoSchema = z.object({
  tipoProdutoId: z.string(),
  nome: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  codigo: z.string().optional(),
  sku: z.string().optional(),
  descricao: z.string().optional(),
  margemPadrao: z.number().min(0).max(100, "Margem deve estar entre 0 e 100%"),
  ativo: z.boolean().optional(),
  composicao: z.array(z.object({
    materiaPrimaId: z.string(),
    quantidade: z.number().positive(),
    unidade: z.string(),
  })).optional(),
});

// GET - Listar variações (com filtro por tipo)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tipoProdutoId = searchParams.get("tipoProdutoId");

    const where: any = {};

    if (tipoProdutoId) {
      where.tipoProdutoId = tipoProdutoId;
    }

    const variacoes = await prisma.variacaoProduto.findMany({
      where,
      include: {
        tipoProduto: true,
        composicao: {
          include: {
            materiaPrima: true
          },
          orderBy: { ordem: "asc" }
        },
        composicaoMaoDeObra: {
          include: {
            tipoMaoDeObra: true
          },
          orderBy: { ordem: "asc" }
        },
        _count: {
          select: { itensProduto: true }
        }
      },
      orderBy: { nome: "asc" }
    });

    // Calcular custo total de cada variação (materiais + mão de obra)
    const variacoesComCusto = variacoes.map(variacao => {
      // Custo de materiais
      const custoMateriais = variacao.composicao.reduce((acc, comp) => {
        return acc + (Number(comp.quantidade) * Number(comp.materiaPrima.custoUnitario));
      }, 0);

      // Custo de mão de obra
      const custoMaoDeObra = variacao.composicaoMaoDeObra.reduce((acc, comp) => {
        const custoHora = Number(comp.tipoMaoDeObra.custoHora);
        const custoMaquina = comp.tipoMaoDeObra.incluiMaquina
          ? Number(comp.tipoMaoDeObra.custoMaquinaHora || 0)
          : 0;
        const custoTotalHora = custoHora + custoMaquina;
        return acc + (Number(comp.horasNecessarias) * custoTotalHora);
      }, 0);

      const custoTotal = custoMateriais + custoMaoDeObra;
      const margemLucro = Number(variacao.margemPadrao);
      const precoSugerido = custoTotal * (1 + margemLucro / 100);

      return {
        ...variacao,
        custoMateriais,
        custoMaoDeObra,
        custoCalculado: custoTotal,
        precoSugerido: precoSugerido,
      };
    });

    return NextResponse.json(variacoesComCusto);
  } catch (error) {
    console.error("Erro ao buscar variações:", error);
    return NextResponse.json(
      { error: "Erro ao buscar variações" },
      { status: 500 }
    );
  }
}

// POST - Criar variação com composição
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = variacaoProdutoSchema.parse(body);

    // Verificar se código já existe
    if (validatedData.codigo) {
      const existing = await prisma.variacaoProduto.findUnique({
        where: { codigo: validatedData.codigo }
      });

      if (existing) {
        return NextResponse.json(
          { error: "Código já cadastrado" },
          { status: 400 }
        );
      }
    }

    // Criar variação com composição
    const variacao = await prisma.variacaoProduto.create({
      data: {
        tipoProdutoId: validatedData.tipoProdutoId,
        nome: validatedData.nome,
        codigo: validatedData.codigo,
        sku: validatedData.sku,
        descricao: validatedData.descricao,
        margemPadrao: validatedData.margemPadrao,
        ativo: validatedData.ativo ?? true,
        composicao: validatedData.composicao ? {
          create: validatedData.composicao.map((comp, index) => ({
            materiaPrimaId: comp.materiaPrimaId,
            quantidade: comp.quantidade,
            unidade: comp.unidade,
            ordem: index,
          }))
        } : undefined
      },
      include: {
        tipoProduto: true,
        composicao: {
          include: {
            materiaPrima: true
          }
        }
      }
    });

    return NextResponse.json(variacao, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Erro ao criar variação:", error);
    return NextResponse.json(
      { error: "Erro ao criar variação" },
      { status: 500 }
    );
  }
}
