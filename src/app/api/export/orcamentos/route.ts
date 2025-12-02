import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar todos os orçamentos
    const orcamentos = await prisma.orcamento.findMany({
      include: {
        itens: {
          include: {
            itemProduto: {
              include: {
                variacaoProduto: {
                  include: {
                    tipoProduto: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Preparar dados para exportação - Sheet 1: Resumo de Orçamentos
    const resumoOrcamentos = orcamentos.map((orc) => {
      const statusMap = {
        rascunho: "Rascunho",
        enviado: "Enviado",
        aprovado: "Aprovado",
        rejeitado: "Rejeitado",
      };

      return {
        Número: orc.numero,
        Cliente: orc.clienteNome,
        Email: orc.clienteEmail || "-",
        Telefone: orc.clienteTelefone || "-",
        Status: statusMap[orc.status as keyof typeof statusMap] || orc.status,
        "Qtd. Itens": orc.itens.length,
        Subtotal: Number(orc.subtotal).toFixed(2),
        Desconto: Number(orc.desconto).toFixed(2),
        Total: Number(orc.total).toFixed(2),
        "Data de Criação": new Date(orc.createdAt).toLocaleDateString("pt-BR"),
        "Última Atualização": new Date(orc.updatedAt).toLocaleDateString("pt-BR"),
      };
    });

    // Preparar dados para exportação - Sheet 2: Detalhes dos Itens
    const detalhesItens = orcamentos.flatMap((orc) =>
      orc.itens.map((item) => ({
        "Número Orçamento": orc.numero,
        Cliente: orc.clienteNome,
        "Tipo de Produto": item.itemProduto.variacaoProduto.tipoProduto.nome,
        Variação: item.itemProduto.variacaoProduto.nome,
        Largura: Number(item.itemProduto.largura),
        Altura: Number(item.itemProduto.altura),
        Quantidade: Number(item.quantidade),
        "Preço Unitário": Number(item.precoUnitario).toFixed(2),
        Total: Number(item.total).toFixed(2),
      }))
    );

    // Preparar dados para exportação - Sheet 3: Análise por Status
    const statusCounts = orcamentos.reduce(
      (acc, orc) => {
        const status = orc.status;
        if (!acc[status]) {
          acc[status] = { count: 0, total: 0 };
        }
        acc[status].count += 1;
        acc[status].total += Number(orc.total);
        return acc;
      },
      {} as Record<string, { count: number; total: number }>
    );

    const analiseStatus = Object.entries(statusCounts).map(([status, data]) => {
      const statusMap = {
        rascunho: "Rascunho",
        enviado: "Enviado",
        aprovado: "Aprovado",
        rejeitado: "Rejeitado",
      };

      return {
        Status: statusMap[status as keyof typeof statusMap] || status,
        Quantidade: data.count,
        "Valor Total": data.total.toFixed(2),
        "Valor Médio": (data.total / data.count).toFixed(2),
      };
    });

    // Criar workbook
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Resumo de Orçamentos
    const worksheetResumo = XLSX.utils.json_to_sheet(resumoOrcamentos);
    worksheetResumo["!cols"] = [
      { wch: 12 }, // Número
      { wch: 25 }, // Cliente
      { wch: 25 }, // Email
      { wch: 15 }, // Telefone
      { wch: 12 }, // Status
      { wch: 10 }, // Qtd. Itens
      { wch: 12 }, // Subtotal
      { wch: 12 }, // Desconto
      { wch: 12 }, // Total
      { wch: 15 }, // Data de Criação
      { wch: 15 }, // Última Atualização
    ];
    XLSX.utils.book_append_sheet(workbook, worksheetResumo, "Resumo");

    // Sheet 2: Detalhes dos Itens
    if (detalhesItens.length > 0) {
      const worksheetDetalhes = XLSX.utils.json_to_sheet(detalhesItens);
      worksheetDetalhes["!cols"] = [
        { wch: 15 }, // Número Orçamento
        { wch: 25 }, // Cliente
        { wch: 25 }, // Tipo de Produto
        { wch: 25 }, // Variação
        { wch: 10 }, // Largura
        { wch: 10 }, // Altura
        { wch: 10 }, // Quantidade
        { wch: 15 }, // Preço Unitário
        { wch: 12 }, // Total
      ];
      XLSX.utils.book_append_sheet(workbook, worksheetDetalhes, "Itens");
    }

    // Sheet 3: Análise por Status
    const worksheetStatus = XLSX.utils.json_to_sheet(analiseStatus);
    worksheetStatus["!cols"] = [
      { wch: 15 }, // Status
      { wch: 12 }, // Quantidade
      { wch: 15 }, // Valor Total
      { wch: 15 }, // Valor Médio
    ];
    XLSX.utils.book_append_sheet(workbook, worksheetStatus, "Análise por Status");

    // Gerar buffer do arquivo Excel
    const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Retornar arquivo
    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="orcamentos-${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Erro ao exportar orçamentos:", error);
    return NextResponse.json({ error: "Erro ao exportar orçamentos" }, { status: 500 });
  }
}
