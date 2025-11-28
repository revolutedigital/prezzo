import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const tipoProdutoSchema = z.object({
  nome: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  codigo: z.string().optional(),
  categoria: z.string().optional(),
  descricao: z.string().optional(),
  ativo: z.boolean().optional(),
});

// GET - Buscar tipo de produto por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const tipoProduto = await prisma.tipoProduto.findUnique({
      where: { id: id },
      include: {
        variacoes: {
          include: {
            composicao: {
              include: {
                materiaPrima: true
              }
            },
            _count: {
              select: { composicao: true }
            }
          }
        }
      }
    });

    if (!tipoProduto) {
      return NextResponse.json(
        { error: "Tipo de produto não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(tipoProduto);
  } catch (error) {
    console.error("Erro ao buscar tipo de produto:", error);
    return NextResponse.json(
      { error: "Erro ao buscar tipo de produto" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar tipo de produto
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = tipoProdutoSchema.parse(body);

    const existing = await prisma.tipoProduto.findUnique({
      where: { id: id }
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Tipo de produto não encontrado" },
        { status: 404 }
      );
    }

    if (validatedData.codigo && validatedData.codigo !== existing.codigo) {
      const codigoExists = await prisma.tipoProduto.findUnique({
        where: { codigo: validatedData.codigo }
      });

      if (codigoExists) {
        return NextResponse.json(
          { error: "Código já cadastrado" },
          { status: 400 }
        );
      }
    }

    const tipoProduto = await prisma.tipoProduto.update({
      where: { id: id },
      data: {
        nome: validatedData.nome,
        codigo: validatedData.codigo,
        categoria: validatedData.categoria,
        descricao: validatedData.descricao,
        ativo: validatedData.ativo ?? existing.ativo,
      }
    });

    return NextResponse.json(tipoProduto);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Erro ao atualizar tipo de produto:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar tipo de produto" },
      { status: 500 }
    );
  }
}

// DELETE - Deletar tipo de produto
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

    const tipoProduto = await prisma.tipoProduto.findUnique({
      where: { id: id },
      include: {
        _count: {
          select: { variacoes: true }
        }
      }
    });

    if (!tipoProduto) {
      return NextResponse.json(
        { error: "Tipo de produto não encontrado" },
        { status: 404 }
      );
    }

    if (tipoProduto._count.variacoes > 0) {
      return NextResponse.json(
        {
          error: `Não é possível excluir. Este tipo possui ${tipoProduto._count.variacoes} variação(ões).`,
        },
        { status: 400 }
      );
    }

    await prisma.tipoProduto.delete({
      where: { id: id }
    });

    return NextResponse.json({ message: "Tipo de produto excluído com sucesso" });

  } catch (error) {
    console.error("Erro ao deletar tipo de produto:", error);
    return NextResponse.json(
      { error: "Erro ao deletar tipo de produto" },
      { status: 500 }
    );
  }
}
