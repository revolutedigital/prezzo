import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const materiaPrimaSchema = z.object({
  nome: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  codigo: z.string().optional(),
  unidadeMedida: z.string().min(1, "Unidade de medida é obrigatória"),
  custoUnitario: z.number().min(0, "Custo deve ser maior ou igual a zero"),
  fornecedor: z.string().optional(),
  categoria: z.string().optional(),
  ativo: z.boolean().optional(),
});

// GET - Buscar matéria-prima por ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const materiaPrima = await prisma.materiaPrima.findUnique({
      where: { id: id },
      include: {
        historicoCustos: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: { composicoes: true },
        },
      },
    });

    if (!materiaPrima) {
      return NextResponse.json({ error: "Matéria-prima não encontrada" }, { status: 404 });
    }

    return NextResponse.json(materiaPrima);
  } catch (error) {
    console.error("Erro ao buscar matéria-prima:", error);
    return NextResponse.json({ error: "Erro ao buscar matéria-prima" }, { status: 500 });
  }
}

// PUT - Atualizar matéria-prima
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = materiaPrimaSchema.parse(body);

    // Verificar se matéria-prima existe
    const existing = await prisma.materiaPrima.findUnique({
      where: { id: id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Matéria-prima não encontrada" }, { status: 404 });
    }

    // Verificar se código já existe (se alterado)
    if (validatedData.codigo && validatedData.codigo !== existing.codigo) {
      const codigoExists = await prisma.materiaPrima.findUnique({
        where: { codigo: validatedData.codigo },
      });

      if (codigoExists) {
        return NextResponse.json({ error: "Código já cadastrado" }, { status: 400 });
      }
    }

    // Se custo mudou, criar histórico
    const custoMudou = validatedData.custoUnitario !== Number(existing.custoUnitario);

    const materiaPrima = await prisma.materiaPrima.update({
      where: { id: id },
      data: {
        nome: validatedData.nome,
        codigo: validatedData.codigo,
        unidadeMedida: validatedData.unidadeMedida,
        custoUnitario: validatedData.custoUnitario,
        fornecedor: validatedData.fornecedor,
        categoria: validatedData.categoria,
        ativo: validatedData.ativo ?? existing.ativo,
      },
    });

    // Criar histórico de mudança de custo
    if (custoMudou) {
      const percentualMudanca =
        ((validatedData.custoUnitario - Number(existing.custoUnitario)) /
          Number(existing.custoUnitario)) *
        100;

      await prisma.historicoCusto.create({
        data: {
          materiaPrimaId: id,
          custoAnterior: existing.custoUnitario,
          custoNovo: validatedData.custoUnitario,
          percentualMudanca,
          motivo: "Manual",
          userId: session.user.id,
        },
      });
    }

    return NextResponse.json(materiaPrima);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }

    console.error("Erro ao atualizar matéria-prima:", error);
    return NextResponse.json({ error: "Erro ao atualizar matéria-prima" }, { status: 500 });
  }
}

// DELETE - Deletar matéria-prima
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se matéria-prima existe
    const materiaPrima = await prisma.materiaPrima.findUnique({
      where: { id: id },
      include: {
        _count: {
          select: { composicoes: true },
        },
      },
    });

    if (!materiaPrima) {
      return NextResponse.json({ error: "Matéria-prima não encontrada" }, { status: 404 });
    }

    // Verificar se está sendo usada em algum produto
    if (materiaPrima._count.composicoes > 0) {
      return NextResponse.json(
        {
          error: `Não é possível excluir. Esta matéria-prima está sendo usada em ${materiaPrima._count.composicoes} produto(s).`,
        },
        { status: 400 }
      );
    }

    // Deletar matéria-prima
    await prisma.materiaPrima.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Matéria-prima excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar matéria-prima:", error);
    return NextResponse.json({ error: "Erro ao deletar matéria-prima" }, { status: 500 });
  }
}
