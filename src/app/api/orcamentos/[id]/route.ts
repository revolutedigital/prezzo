import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const orcamentoUpdateSchema = z.object({
  clienteNome: z.string().min(2, "Nome do cliente é obrigatório").optional(),
  clienteEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  clienteTelefone: z.string().optional(),
  clienteCNPJ: z.string().optional(),
  validade: z.string().transform((val) => new Date(val)).optional(),
  observacoes: z.string().optional(),
  desconto: z.number().min(0).optional(),
  descontoTipo: z.enum(["percentual", "valor"]).optional(),
  status: z.enum(["rascunho", "enviado", "aprovado", "rejeitado", "expirado"]).optional(),
  itens: z.array(z.object({
    id: z.string().optional(), // Se existir, é update; se não, é create
    itemProdutoId: z.string(),
    descricao: z.string(),
    quantidade: z.number().positive(),
    precoUnitario: z.number().positive(),
    desconto: z.number().min(0).default(0),
  })).min(1, "Adicione pelo menos um item").optional(),
});

// GET - Buscar orçamento por ID
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

    const orcamento = await prisma.orcamento.findUnique({
      where: { id: id },
      include: {
        itens: {
          include: {
            itemProduto: {
              include: {
                variacaoProduto: {
                  include: {
                    tipoProduto: true
                  }
                }
              }
            }
          },
          orderBy: {
            ordem: "asc"
          }
        }
      }
    });

    if (!orcamento) {
      return NextResponse.json(
        { error: "Orçamento não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(orcamento);
  } catch (error) {
    console.error("Erro ao buscar orçamento:", error);
    return NextResponse.json(
      { error: "Erro ao buscar orçamento" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar orçamento
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

    // Verificar se orçamento existe
    const orcamentoExistente = await prisma.orcamento.findUnique({
      where: { id: id },
      include: { itens: true }
    });

    if (!orcamentoExistente) {
      return NextResponse.json(
        { error: "Orçamento não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se pode editar (apenas rascunhos podem ser editados completamente)
    if (orcamentoExistente.status !== "rascunho" && request.method === "PUT") {
      const body = await request.json();
      // Se não for rascunho, só permitir atualização de status
      if (Object.keys(body).some(key => key !== "status")) {
        return NextResponse.json(
          { error: "Apenas o status pode ser alterado em orçamentos enviados" },
          { status: 400 }
        );
      }
    }

    const body = await request.json();
    const validatedData = orcamentoUpdateSchema.parse(body);

    // Calcular novos totais se itens foram alterados
    let updateData: any = {};

    if (validatedData.clienteNome !== undefined) updateData.clienteNome = validatedData.clienteNome;
    if (validatedData.clienteEmail !== undefined) updateData.clienteEmail = validatedData.clienteEmail || null;
    if (validatedData.clienteTelefone !== undefined) updateData.clienteTelefone = validatedData.clienteTelefone || null;
    if (validatedData.clienteCNPJ !== undefined) updateData.clienteCNPJ = validatedData.clienteCNPJ || null;
    if (validatedData.validade !== undefined) updateData.validade = validatedData.validade;
    if (validatedData.observacoes !== undefined) updateData.observacoes = validatedData.observacoes || null;
    if (validatedData.desconto !== undefined) updateData.desconto = validatedData.desconto;
    if (validatedData.descontoTipo !== undefined) updateData.descontoTipo = validatedData.descontoTipo;
    if (validatedData.status !== undefined) updateData.status = validatedData.status;

    // Se itens foram atualizados, recalcular totais
    if (validatedData.itens) {
      let subtotal = 0;
      const itensComTotal = validatedData.itens.map((item, index) => {
        const totalItem = item.quantidade * item.precoUnitario - item.desconto;
        subtotal += totalItem;

        return {
          ...item,
          total: totalItem,
          ordem: index,
        };
      });

      // Aplicar desconto geral
      const descontoFinal = validatedData.desconto ?? orcamentoExistente.desconto;
      const descontoTipoFinal = validatedData.descontoTipo ?? orcamentoExistente.descontoTipo;

      let descontoValor = Number(descontoFinal);
      if (descontoTipoFinal === "percentual") {
        descontoValor = (subtotal * Number(descontoFinal)) / 100;
      }

      const total = subtotal - descontoValor;

      updateData.subtotal = subtotal;
      updateData.total = total;

      // Deletar itens antigos e criar novos
      updateData.itens = {
        deleteMany: {},
        create: itensComTotal
      };
    }

    // Atualizar orçamento
    const orcamentoAtualizado = await prisma.orcamento.update({
      where: { id: id },
      data: updateData,
      include: {
        itens: {
          include: {
            itemProduto: {
              include: {
                variacaoProduto: {
                  include: {
                    tipoProduto: true
                  }
                }
              }
            }
          },
          orderBy: {
            ordem: "asc"
          }
        }
      }
    });

    return NextResponse.json(orcamentoAtualizado);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Erro ao atualizar orçamento:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar orçamento" },
      { status: 500 }
    );
  }
}

// DELETE - Excluir orçamento
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

    // Verificar se orçamento existe
    const orcamento = await prisma.orcamento.findUnique({
      where: { id: id },
    });

    if (!orcamento) {
      return NextResponse.json(
        { error: "Orçamento não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se pode deletar (apenas rascunhos e rejeitados podem ser deletados)
    if (!["rascunho", "rejeitado"].includes(orcamento.status)) {
      return NextResponse.json(
        { error: "Apenas orçamentos em rascunho ou rejeitados podem ser excluídos" },
        { status: 400 }
      );
    }

    // Deletar orçamento (itens serão deletados em cascata)
    await prisma.orcamento.delete({
      where: { id: id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Erro ao excluir orçamento:", error);
    return NextResponse.json(
      { error: "Erro ao excluir orçamento" },
      { status: 500 }
    );
  }
}
