import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface OrcamentoPDFProps {
  orcamento: {
    numero: string;
    clienteNome: string;
    clienteEmail: string | null;
    clienteTelefone: string | null;
    clienteCNPJ: string | null;
    validade: string;
    subtotal: number;
    desconto: number;
    descontoTipo: string;
    total: number;
    status: string;
    observacoes: string | null;
    createdAt: string;
    itens: Array<{
      descricao: string;
      quantidade: number;
      precoUnitario: number;
      desconto: number;
      total: number;
    }>;
    user: {
      nome: string;
      email: string;
    };
  };
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatDate = (dateString: string) => {
  return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
};

const statusMap: Record<string, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
  expirado: "Expirado",
};

export function generateOrcamentoPDF({ orcamento }: OrcamentoPDFProps): Buffer {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(24);
  doc.setTextColor(37, 99, 235);
  doc.text("Prezzo", 20, 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text("Sistema Inteligente de Precificação", 20, 27);

  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text(`Orçamento #${orcamento.numero}`, 20, 37);

  doc.setFontSize(8);
  doc.setTextColor(30, 64, 175);
  doc.text(statusMap[orcamento.status] || orcamento.status, 20, 43);

  // Linha divisória
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(2);
  doc.line(20, 47, 190, 47);

  let yPos = 57;

  // Informações do Orçamento
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text("Informações do Orçamento", 20, yPos);
  yPos += 7;

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("Data de Emissão:", 20, yPos);
  doc.setTextColor(15, 23, 42);
  doc.text(formatDate(orcamento.createdAt), 65, yPos);

  doc.setTextColor(100, 116, 139);
  doc.text("Validade:", 115, yPos);
  doc.setTextColor(15, 23, 42);
  doc.text(formatDate(orcamento.validade), 140, yPos);
  yPos += 6;

  doc.setTextColor(100, 116, 139);
  doc.text("Responsável:", 20, yPos);
  doc.setTextColor(15, 23, 42);
  doc.text(orcamento.user.nome, 65, yPos);
  yPos += 10;

  // Dados do Cliente
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text("Dados do Cliente", 20, yPos);
  yPos += 7;

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("Nome/Razão Social:", 20, yPos);
  doc.setTextColor(15, 23, 42);
  doc.text(orcamento.clienteNome, 65, yPos);
  yPos += 6;

  if (orcamento.clienteCNPJ) {
    doc.setTextColor(100, 116, 139);
    doc.text("CNPJ/CPF:", 20, yPos);
    doc.setTextColor(15, 23, 42);
    doc.text(orcamento.clienteCNPJ, 65, yPos);
    yPos += 6;
  }

  if (orcamento.clienteEmail) {
    doc.setTextColor(100, 116, 139);
    doc.text("Email:", 20, yPos);
    doc.setTextColor(15, 23, 42);
    doc.text(orcamento.clienteEmail, 65, yPos);
    yPos += 6;
  }

  if (orcamento.clienteTelefone) {
    doc.setTextColor(100, 116, 139);
    doc.text("Telefone:", 20, yPos);
    doc.setTextColor(15, 23, 42);
    doc.text(orcamento.clienteTelefone, 65, yPos);
    yPos += 6;
  }

  yPos += 4;

  // Itens do Orçamento
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text("Itens do Orçamento", 20, yPos);
  yPos += 5;

  const tableData = orcamento.itens.map((item) => [
    item.descricao,
    item.quantidade.toString(),
    formatCurrency(Number(item.precoUnitario)),
    formatCurrency(Number(item.total)),
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [["Descrição", "Qtd.", "Preço Unit.", "Total"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [241, 245, 249], textColor: [71, 85, 105], fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 20, halign: "right" },
      2: { cellWidth: 35, halign: "right" },
      3: { cellWidth: 35, halign: "right" },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Observações
  if (orcamento.observacoes) {
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("Observações", 20, yPos);
    yPos += 7;

    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    const lines = doc.splitTextToSize(orcamento.observacoes, 170);
    doc.text(lines, 20, yPos);
    yPos += lines.length * 5 + 5;
  }

  // Totais
  const descontoValor =
    orcamento.descontoTipo === "percentual"
      ? (Number(orcamento.subtotal) * Number(orcamento.desconto)) / 100
      : Number(orcamento.desconto);

  doc.setFillColor(239, 246, 255);
  doc.rect(20, yPos, 170, 35, "F");

  yPos += 8;
  doc.setFontSize(10);
  doc.setTextColor(30, 64, 175);
  doc.text("Subtotal:", 25, yPos);
  doc.text(formatCurrency(Number(orcamento.subtotal)), 185, yPos, { align: "right" });
  yPos += 7;

  if (Number(orcamento.desconto) > 0) {
    doc.text(
      `Desconto (${orcamento.descontoTipo === "percentual" ? `${orcamento.desconto}%` : "R$"}):`,
      25,
      yPos
    );
    doc.text(`- ${formatCurrency(descontoValor)}`, 185, yPos, { align: "right" });
    yPos += 7;
  }

  yPos += 3;
  doc.setFontSize(14);
  doc.text("TOTAL:", 25, yPos);
  doc.setTextColor(22, 163, 74);
  doc.setFontSize(16);
  doc.text(formatCurrency(Number(orcamento.total)), 185, yPos, { align: "right" });

  // Footer
  yPos = 280;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(20, yPos, 190, yPos);

  yPos += 5;
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Orçamento gerado em ${formatDate(new Date().toISOString())}`, 105, yPos, {
    align: "center",
  });
  yPos += 4;
  doc.text(`Este orçamento tem validade até ${formatDate(orcamento.validade)}`, 105, yPos, {
    align: "center",
  });

  return Buffer.from(doc.output("arraybuffer"));
}
