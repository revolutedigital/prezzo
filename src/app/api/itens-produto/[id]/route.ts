import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Buscar item de produto por ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const itemProduto = await prisma.itemProduto.findUnique({
      where: { id },
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
        _count: {
          select: {
            itensOrcamento: true,
          },
        },
      },
    });

    if (!itemProduto) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(itemProduto);
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    return NextResponse.json(
      { error: "Erro ao buscar produto" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir item de produto
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar o produto para verificar se existe
    const itemProduto = await prisma.itemProduto.findUnique({
      where: { id },
      include: {
        variacaoProduto: {
          include: {
            tipoProduto: true,
          },
        },
        _count: {
          select: {
            itensOrcamento: true,
          },
        },
      },
    });

    if (!itemProduto) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    // Validação: Não permitir excluir produto que está em orçamento
    if (itemProduto._count.itensOrcamento > 0) {
      return NextResponse.json(
        {
          error: "Não é possível excluir este produto",
          message: `Este produto está sendo usado em ${itemProduto._count.itensOrcamento} orçamento(s). Remova-o dos orçamentos antes de excluir.`,
          dependencias: {
            orcamentos: itemProduto._count.itensOrcamento,
          },
        },
        { status: 400 }
      );
    }

    // Excluir o produto
    await prisma.itemProduto.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Produto excluído com sucesso",
    });
  } catch (error) {
    console.error("Erro ao excluir produto:", error);
    return NextResponse.json(
      { error: "Erro ao excluir produto" },
      { status: 500 }
    );
  }
}
