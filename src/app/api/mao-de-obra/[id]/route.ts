import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Decimal } from "@prisma/client/runtime/library";

const maoDeObraUpdateSchema = z.object({
  nome: z.string().min(1).optional(),
  codigo: z.string().optional().nullable(),
  custoHora: z.number().positive().optional(),
  incluiMaquina: z.boolean().optional(),
  custoMaquinaHora: z.number().positive().optional().nullable(),
  descricao: z.string().optional().nullable(),
  ativo: z.boolean().optional(),
});

// GET - Buscar tipo de mão de obra por ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const tipoMaoDeObra = await prisma.tipoMaoDeObra.findUnique({
      where: { id },
      include: {
        composicoesMaoDeObra: {
          include: {
            variacaoProduto: {
              include: {
                tipoProduto: true,
              },
            },
          },
        },
        historicoMaoDeObra: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!tipoMaoDeObra) {
      return NextResponse.json(
        { error: "Tipo de mão de obra não encontrado" },
        { status: 404 }
      );
    }

    const custoTotalHora = tipoMaoDeObra.incluiMaquina
      ? Number(tipoMaoDeObra.custoHora) +
        Number(tipoMaoDeObra.custoMaquinaHora || 0)
      : Number(tipoMaoDeObra.custoHora);

    return NextResponse.json({
      ...tipoMaoDeObra,
      custoTotalHora,
    });
  } catch (error) {
    console.error("Erro ao buscar tipo de mão de obra:", error);
    return NextResponse.json(
      { error: "Erro ao buscar tipo de mão de obra" },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar tipo de mão de obra
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const data = maoDeObraUpdateSchema.parse(body);

    // Buscar tipo atual
    const tipoAtual = await prisma.tipoMaoDeObra.findUnique({
      where: { id },
    });

    if (!tipoAtual) {
      return NextResponse.json(
        { error: "Tipo de mão de obra não encontrado" },
        { status: 404 }
      );
    }

    // Validação: se incluiMaquina é true, custoMaquinaHora deve ser fornecido
    const incluiMaquina = data.incluiMaquina ?? tipoAtual.incluiMaquina;
    if (incluiMaquina) {
      const custoMaquina =
        data.custoMaquinaHora !== undefined
          ? data.custoMaquinaHora
          : tipoAtual.custoMaquinaHora;
      if (!custoMaquina) {
        return NextResponse.json(
          { error: "Custo de máquina é obrigatório quando inclui máquina" },
          { status: 400 }
        );
      }
    }

    // Verificar se código já existe (se estiver sendo alterado)
    if (data.codigo && data.codigo !== tipoAtual.codigo) {
      const existente = await prisma.tipoMaoDeObra.findUnique({
        where: { codigo: data.codigo },
      });

      if (existente) {
        return NextResponse.json(
          { error: "Código já está em uso" },
          { status: 400 }
        );
      }
    }

    // Se o custo mudou, registrar no histórico
    const custoMudou = data.custoHora && data.custoHora !== Number(tipoAtual.custoHora);

    const tipoAtualizado = await prisma.$transaction(async (tx) => {
      // Atualizar tipo
      const tipo = await tx.tipoMaoDeObra.update({
        where: { id },
        data: {
          nome: data.nome,
          codigo: data.codigo,
          custoHora: data.custoHora,
          incluiMaquina: data.incluiMaquina,
          custoMaquinaHora: data.custoMaquinaHora,
          descricao: data.descricao,
          ativo: data.ativo,
        },
      });

      // Se custo mudou, criar histórico
      if (custoMudou && data.custoHora) {
        const custoAnterior = Number(tipoAtual.custoHora);
        const custoNovo = data.custoHora;
        const percentualMudanca = ((custoNovo - custoAnterior) / custoAnterior) * 100;

        await tx.historicoMaoDeObra.create({
          data: {
            tipoMaoDeObraId: id,
            custoAnterior: new Decimal(custoAnterior),
            custoNovo: new Decimal(custoNovo),
            percentualMudanca: new Decimal(percentualMudanca),
            motivo: "Manual",
            userId: session.user.id,
          },
        });
      }

      return tipo;
    });

    return NextResponse.json(tipoAtualizado);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erro ao atualizar tipo de mão de obra:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar tipo de mão de obra" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir tipo de mão de obra
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    // Verificar se existe
    const tipoMaoDeObra = await prisma.tipoMaoDeObra.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            composicoesMaoDeObra: true,
          },
        },
      },
    });

    if (!tipoMaoDeObra) {
      return NextResponse.json(
        { error: "Tipo de mão de obra não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se está em uso
    if (tipoMaoDeObra._count.composicoesMaoDeObra > 0) {
      return NextResponse.json(
        {
          error: `Não é possível excluir. Este tipo está em uso por ${tipoMaoDeObra._count.composicoesMaoDeObra} produto(s)`,
        },
        { status: 400 }
      );
    }

    await prisma.tipoMaoDeObra.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Tipo de mão de obra excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir tipo de mão de obra:", error);
    return NextResponse.json(
      { error: "Erro ao excluir tipo de mão de obra" },
      { status: 500 }
    );
  }
}
