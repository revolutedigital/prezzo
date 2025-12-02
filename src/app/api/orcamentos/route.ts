import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const orcamentoSchema = z.object({
  clienteNome: z.string().min(2, "Nome do cliente é obrigatório"),
  clienteEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  clienteTelefone: z.string().optional(),
  clienteCNPJ: z.string().optional(),
  validade: z.string().transform((val) => new Date(val)),
  observacoes: z.string().optional(),
  desconto: z.number().min(0).default(0),
  descontoTipo: z.enum(["percentual", "valor"]).default("percentual"),
  itens: z.array(z.object({
    itemProdutoId: z.string(),
    descricao: z.string(),
    quantidade: z.number().positive(),
    precoUnitario: z.number().positive(),
    desconto: z.number().min(0).default(0),
  })).min(1, "Adicione pelo menos um item"),
});

// Gerar número do orçamento
async function gerarNumeroOrcamento() {
  const ano = new Date().getFullYear();
  const ultimoOrcamento = await prisma.orcamento.findFirst({
    where: {
      numero: {
        startsWith: `${ano}-`
      }
    },
    orderBy: {
      numero: "desc"
    }
  });

  let proximoNumero = 1;
  if (ultimoOrcamento) {
    const partes = ultimoOrcamento.numero.split("-");
    proximoNumero = parseInt(partes[1]) + 1;
  }

  return `${ano}-${String(proximoNumero).padStart(4, "0")}`;
}

// GET - Listar orçamentos
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") || "desc";

    const where: any = {};

    if (search) {
      where.OR = [
        { numero: { contains: search, mode: "insensitive" } },
        { clienteNome: { contains: search, mode: "insensitive" } },
        { clienteEmail: { contains: search, mode: "insensitive" } },
        { clienteCNPJ: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    // Validar campos de ordenação permitidos
    const allowedSortFields = ['numero', 'clienteNome', 'status', 'valorTotal', 'validade', 'createdAt'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const validOrder = (order === 'asc' || order === 'desc') ? order : 'desc';

    const [orcamentos, total] = await Promise.all([
      prisma.orcamento.findMany({
        where,
        skip,
        take: limit,
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
            }
          },
          _count: {
            select: { itens: true }
          }
        },
        orderBy: {
          [validSortBy]: validOrder
        }
      }),
      prisma.orcamento.count({ where })
    ]);

    return NextResponse.json({
      data: orcamentos,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Erro ao buscar orçamentos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar orçamentos" },
      { status: 500 }
    );
  }
}

// POST - Criar orçamento
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = orcamentoSchema.parse(body);

    // Gerar número
    const numero = await gerarNumeroOrcamento();

    // Calcular subtotal e total
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
    let descontoValor = validatedData.desconto;
    if (validatedData.descontoTipo === "percentual") {
      descontoValor = (subtotal * validatedData.desconto) / 100;
    }

    const total = subtotal - descontoValor;

    // Criar orçamento
    const orcamento = await prisma.orcamento.create({
      data: {
        numero,
        clienteNome: validatedData.clienteNome,
        clienteEmail: validatedData.clienteEmail || null,
        clienteTelefone: validatedData.clienteTelefone || null,
        clienteCNPJ: validatedData.clienteCNPJ || null,
        validade: validatedData.validade,
        observacoes: validatedData.observacoes || null,
        desconto: validatedData.desconto,
        descontoTipo: validatedData.descontoTipo,
        subtotal,
        total,
        status: "rascunho",
        userId: session.user.id,
        itens: {
          create: itensComTotal
        }
      },
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
          }
        }
      }
    });

    return NextResponse.json(orcamento, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Erro ao criar orçamento:", error);
    return NextResponse.json(
      { error: "Erro ao criar orçamento" },
      { status: 500 }
    );
  }
}
