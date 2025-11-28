import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const composicaoMaoDeObraSchema = z.object({
  tipoMaoDeObraId: z.string().min(1, "Tipo de mão de obra é obrigatório"),
  horasNecessarias: z.number().positive("Horas necessárias devem ser positivas"),
  descricao: z.string().optional().nullable(),
  ordem: z.number().int().nonnegative().optional(),
});

// GET - Listar composição de mão de obra de um produto
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

    // Verificar se produto existe
    const produto = await prisma.variacaoProduto.findUnique({
      where: { id: id },
    });

    if (!produto) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    const composicao = await prisma.composicaoMaoDeObra.findMany({
      where: { variacaoProdutoId: id },
      include: {
        tipoMaoDeObra: true,
      },
      orderBy: { ordem: "asc" },
    });

    // Calcular custo de cada item
    const composicaoComCusto = composicao.map((item) => {
      const custoHora = Number(item.tipoMaoDeObra.custoHora);
      const custoMaquina = item.tipoMaoDeObra.incluiMaquina
        ? Number(item.tipoMaoDeObra.custoMaquinaHora || 0)
        : 0;
      const custoTotalHora = custoHora + custoMaquina;
      const custoTotal = Number(item.horasNecessarias) * custoTotalHora;

      return {
        ...item,
        custoTotalHora,
        custoTotal,
      };
    });

    // Calcular custo total de mão de obra
    const custoTotalMaoDeObra = composicaoComCusto.reduce(
      (total, item) => total + item.custoTotal,
      0
    );

    return NextResponse.json({
      composicao: composicaoComCusto,
      custoTotalMaoDeObra,
    });
  } catch (error) {
    console.error("Erro ao buscar composição de mão de obra:", error);
    return NextResponse.json(
      { error: "Erro ao buscar composição de mão de obra" },
      { status: 500 }
    );
  }
}

// POST - Adicionar mão de obra à composição do produto
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const data = composicaoMaoDeObraSchema.parse(body);

    // Verificar se produto existe
    const produto = await prisma.variacaoProduto.findUnique({
      where: { id: id },
    });

    if (!produto) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se tipo de mão de obra existe
    const tipoMaoDeObra = await prisma.tipoMaoDeObra.findUnique({
      where: { id: data.tipoMaoDeObraId },
    });

    if (!tipoMaoDeObra) {
      return NextResponse.json(
        { error: "Tipo de mão de obra não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se já existe na composição
    const existente = await prisma.composicaoMaoDeObra.findUnique({
      where: {
        variacaoProdutoId_tipoMaoDeObraId: {
          variacaoProdutoId: id,
          tipoMaoDeObraId: data.tipoMaoDeObraId,
        },
      },
    });

    if (existente) {
      return NextResponse.json(
        { error: "Este tipo de mão de obra já está na composição do produto" },
        { status: 400 }
      );
    }

    // Obter próxima ordem
    const ultimaOrdem = await prisma.composicaoMaoDeObra.findFirst({
      where: { variacaoProdutoId: id },
      orderBy: { ordem: "desc" },
    });

    const ordem = data.ordem ?? (ultimaOrdem ? ultimaOrdem.ordem + 1 : 0);

    const composicao = await prisma.composicaoMaoDeObra.create({
      data: {
        variacaoProdutoId: id,
        tipoMaoDeObraId: data.tipoMaoDeObraId,
        horasNecessarias: data.horasNecessarias,
        descricao: data.descricao,
        ordem,
      },
      include: {
        tipoMaoDeObra: true,
      },
    });

    return NextResponse.json(composicao, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erro ao adicionar mão de obra:", error);
    return NextResponse.json(
      { error: "Erro ao adicionar mão de obra" },
      { status: 500 }
    );
  }
}
