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

    // Buscar todos os produtos com suas relações
    const produtos = await prisma.itemProduto.findMany({
      where: { ativo: true },
      include: {
        variacaoProduto: {
          include: {
            tipoProduto: true,
          },
        },
        composicoesMateriasPrimas: {
          include: {
            materiaPrima: true,
          },
        },
        composicoesMaoDeObra: {
          include: {
            tipoMaoDeObra: true,
          },
        },
      },
      orderBy: {
        variacaoProduto: {
          tipoProduto: {
            nome: "asc",
          },
        },
      },
    });

    // Preparar dados para exportação
    const dadosExportacao = produtos.map((produto) => {
      // Calcular custo de matérias-primas
      const custoMateriasPrimas = produto.composicoesMateriasPrimas.reduce(
        (acc, comp) => acc + Number(comp.quantidade) * Number(comp.materiaPrima.precoUnitario),
        0
      );

      // Calcular custo de mão de obra
      const custoMaoDeObra = produto.composicoesMaoDeObra.reduce((acc, comp) => {
        const custoBase = Number(comp.tipoMaoDeObra.custoHora);
        const custoMaquina = comp.tipoMaoDeObra.incluiMaquina
          ? Number(comp.tipoMaoDeObra.custoMaquinaHora || 0)
          : 0;
        const custoTotal = (custoBase + custoMaquina) * Number(comp.tempoHoras);
        return acc + custoTotal;
      }, 0);

      // Custo total
      const custoTotal = custoMateriasPrimas + custoMaoDeObra;

      // Preço de venda e margem
      const precoVenda = Number(produto.precoVenda);
      const margemLucro = precoVenda > 0 ? ((precoVenda - custoTotal) / precoVenda) * 100 : 0;

      return {
        "Tipo de Produto": produto.variacaoProduto.tipoProduto.nome,
        Variação: produto.variacaoProduto.nome,
        Largura: Number(produto.largura),
        Altura: Number(produto.altura),
        "Custo Matérias-Primas": custoMateriasPrimas.toFixed(2),
        "Custo Mão de Obra": custoMaoDeObra.toFixed(2),
        "Custo Total": custoTotal.toFixed(2),
        "Preço de Venda": precoVenda.toFixed(2),
        "Margem de Lucro (%)": margemLucro.toFixed(2),
        Status: produto.ativo ? "Ativo" : "Inativo",
      };
    });

    // Criar workbook e worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(dadosExportacao);

    // Ajustar largura das colunas
    const columnWidths = [
      { wch: 25 }, // Tipo de Produto
      { wch: 25 }, // Variação
      { wch: 10 }, // Largura
      { wch: 10 }, // Altura
      { wch: 20 }, // Custo Matérias-Primas
      { wch: 20 }, // Custo Mão de Obra
      { wch: 15 }, // Custo Total
      { wch: 15 }, // Preço de Venda
      { wch: 20 }, // Margem de Lucro
      { wch: 10 }, // Status
    ];
    worksheet["!cols"] = columnWidths;

    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Produtos");

    // Gerar buffer do arquivo Excel
    const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Retornar arquivo
    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="produtos-${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Erro ao exportar produtos:", error);
    return NextResponse.json({ error: "Erro ao exportar produtos" }, { status: 500 });
  }
}
