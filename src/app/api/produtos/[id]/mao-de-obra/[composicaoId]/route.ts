import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateComposicaoSchema = z.object({
  horasNecessarias: z.number().positive().optional(),
  descricao: z.string().optional().nullable(),
  ordem: z.number().int().nonnegative().optional(),
});

// PATCH - Atualizar item da composição
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; composicaoId: string }> }
) {
  try {
    const { id, composicaoId } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const data = updateComposicaoSchema.parse(body);

    const composicao = await prisma.composicaoMaoDeObra.update({
      where: { id: composicaoId },
      data: {
        horasNecessarias: data.horasNecessarias,
        descricao: data.descricao,
        ordem: data.ordem,
      },
      include: {
        tipoMaoDeObra: true,
      },
    });

    return NextResponse.json(composicao);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erro ao atualizar composição:", error);
    return NextResponse.json({ error: "Erro ao atualizar composição" }, { status: 500 });
  }
}

// DELETE - Remover mão de obra da composição
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; composicaoId: string }> }
) {
  try {
    const { id, composicaoId } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se composição existe
    const composicao = await prisma.composicaoMaoDeObra.findUnique({
      where: { id: composicaoId },
    });

    if (!composicao) {
      return NextResponse.json({ error: "Composição não encontrada" }, { status: 404 });
    }

    await prisma.composicaoMaoDeObra.delete({
      where: { id: composicaoId },
    });

    return NextResponse.json({ message: "Mão de obra removida da composição" });
  } catch (error) {
    console.error("Erro ao remover mão de obra:", error);
    return NextResponse.json({ error: "Erro ao remover mão de obra" }, { status: 500 });
  }
}
