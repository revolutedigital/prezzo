import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar todos os produtos com composições
    const produtos = await prisma.itemProduto.findMany({
      where: { ativo: true },
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
      },
    });

    // Criar documento PDF
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text("Relatório de Custos de Produtos", 14, 20);

    // Data do relatório
    doc.setFontSize(10);
    doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 14, 28);

    // Preparar dados para a tabela
    const dadosTabela = produtos.map((produto) => {
      // Calcular custo de matérias-primas
      const custoMateriasPrimas = produto.variacaoProduto.composicao.reduce(
        (acc, comp) => acc + Number(comp.quantidade) * Number(comp.materiaPrima.custoUnitario),
        0
      );

      // Calcular custo de mão de obra
      const custoMaoDeObra = produto.variacaoProduto.composicaoMaoDeObra.reduce((acc, comp) => {
        const custoBase = Number(comp.tipoMaoDeObra.custoHora);
        const custoMaquina = comp.tipoMaoDeObra.incluiMaquina
          ? Number(comp.tipoMaoDeObra.custoMaquinaHora || 0)
          : 0;
        const custoTotal = (custoBase + custoMaquina) * Number(comp.horasNecessarias);
        return acc + custoTotal;
      }, 0);

      // Custo total
      const custoTotal = custoMateriasPrimas + custoMaoDeObra;

      // Preço de venda e margem
      const precoVenda = Number(produto.precoVenda);
      const margemLucro = precoVenda > 0 ? ((precoVenda - custoTotal) / precoVenda) * 100 : 0;

      return [
        `${produto.variacaoProduto.tipoProduto.nome} - ${produto.variacaoProduto.nome}`,
        `R$ ${custoMateriasPrimas.toFixed(2)}`,
        `R$ ${custoMaoDeObra.toFixed(2)}`,
        `R$ ${custoTotal.toFixed(2)}`,
        `R$ ${precoVenda.toFixed(2)}`,
        `${margemLucro.toFixed(1)}%`,
      ];
    });

    // Adicionar tabela ao PDF
    autoTable(doc, {
      head: [
        ["Produto", "Custo MP", "Custo MO", "Custo Total", "Preço Venda", "Margem"],
      ],
      body: dadosTabela,
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 66, 66] },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 25, halign: "right" },
        2: { cellWidth: 25, halign: "right" },
        3: { cellWidth: 28, halign: "right" },
        4: { cellWidth: 28, halign: "right" },
        5: { cellWidth: 22, halign: "right" },
      },
    });

    // Calcular totais
    const totalCustoMP = produtos.reduce((acc, produto) => {
      const custo = produto.variacaoProduto.composicao.reduce(
        (sum, comp) => sum + Number(comp.quantidade) * Number(comp.materiaPrima.custoUnitario),
        0
      );
      return acc + custo;
    }, 0);

    const totalCustoMO = produtos.reduce((acc, produto) => {
      const custo = produto.variacaoProduto.composicaoMaoDeObra.reduce((sum, comp) => {
        const custoBase = Number(comp.tipoMaoDeObra.custoHora);
        const custoMaquina = comp.tipoMaoDeObra.incluiMaquina
          ? Number(comp.tipoMaoDeObra.custoMaquinaHora || 0)
          : 0;
        return sum + (custoBase + custoMaquina) * Number(comp.horasNecessarias);
      }, 0);
      return acc + custo;
    }, 0);

    const totalCustoGeral = totalCustoMP + totalCustoMO;
    const totalPrecoVenda = produtos.reduce((acc, p) => acc + Number(p.precoVenda), 0);
    const margemMedia =
      totalPrecoVenda > 0 ? ((totalPrecoVenda - totalCustoGeral) / totalPrecoVenda) * 100 : 0;

    // Adicionar resumo no final
    const finalY = (doc as any).lastAutoTable.finalY || 35;

    doc.setFontSize(12);
    doc.text("Resumo Geral", 14, finalY + 15);

    doc.setFontSize(10);
    doc.text(`Total de Produtos: ${produtos.length}`, 14, finalY + 25);
    doc.text(`Custo Total em Matérias-Primas: R$ ${totalCustoMP.toFixed(2)}`, 14, finalY + 32);
    doc.text(`Custo Total em Mão de Obra: R$ ${totalCustoMO.toFixed(2)}`, 14, finalY + 39);
    doc.text(`Custo Total Geral: R$ ${totalCustoGeral.toFixed(2)}`, 14, finalY + 46);
    doc.text(`Preço de Venda Total: R$ ${totalPrecoVenda.toFixed(2)}`, 14, finalY + 53);
    doc.text(`Margem Média: ${margemMedia.toFixed(2)}%`, 14, finalY + 60);

    // Gerar buffer do PDF
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    // Retornar arquivo
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="relatorio-custos-${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Erro ao exportar relatório de custos:", error);
    return NextResponse.json({ error: "Erro ao exportar relatório de custos" }, { status: 500 });
  }
}
