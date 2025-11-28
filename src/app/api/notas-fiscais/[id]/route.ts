import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const notaFiscal = await prisma.notaFiscal.findUnique({
      where: {
        id: id,
        userId: session.user.id,
      },
      include: {
        atualizacoes: {
          include: {
            materiaPrima: {
              select: {
                id: true,
                nome: true,
                codigo: true,
                unidadeMedida: true,
                custoUnitario: true,
              },
            },
          },
          orderBy: {
            percentualMudanca: "desc",
          },
        },
        user: {
          select: {
            nome: true,
            email: true,
          },
        },
      },
    });

    if (!notaFiscal) {
      return NextResponse.json(
        { error: "Nota fiscal não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(notaFiscal);
  } catch (error) {
    console.error("Erro ao buscar nota fiscal:", error);
    return NextResponse.json(
      { error: "Erro ao buscar nota fiscal" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se a NF existe e pertence ao usuário
    const notaFiscal = await prisma.notaFiscal.findUnique({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!notaFiscal) {
      return NextResponse.json(
        { error: "Nota fiscal não encontrada" },
        { status: 404 }
      );
    }

    // Deletar (as atualizações serão deletadas em cascade)
    await prisma.notaFiscal.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Nota fiscal deletada com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar nota fiscal:", error);
    return NextResponse.json(
      { error: "Erro ao deletar nota fiscal" },
      { status: 500 }
    );
  }
}
