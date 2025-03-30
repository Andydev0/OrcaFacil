import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Quote, Client, CompanySettings, QuoteItem } from '@/types';
import { formatCurrency, formatDate, calculateTaxAmount } from './utils';

type PdfTemplate = 'standard' | 'compact' | 'detailed' | 'modern';

interface GeneratePdfOptions {
  template?: PdfTemplate;
  companySettings: CompanySettings;
}

export const generateQuotePdf = async (
  quote: Quote,
  client: Client,
  options: GeneratePdfOptions
): Promise<Blob> => {
  const { template = 'standard', companySettings } = options;
  
  // Create PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Add fonts if needed
  // doc.addFont('Inter-Regular.ttf', 'Inter', 'normal');
  // doc.addFont('Inter-Bold.ttf', 'Inter', 'bold');
  // doc.setFont('Inter');
  
  // Use appropriate template
  switch (template) {
    case 'compact':
      return generateCompactTemplate(doc, quote, client, companySettings);
    case 'detailed':
      return generateDetailedTemplate(doc, quote, client, companySettings);
    case 'modern':
      return generateModernTemplate(doc, quote, client, companySettings);
    case 'standard':
    default:
      return generateStandardTemplate(doc, quote, client, companySettings);
  }
};

const generateStandardTemplate = async (
  doc: jsPDF,
  quote: Quote,
  client: Client,
  companySettings: CompanySettings
): Promise<Blob> => {
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  
  // Add company logo if available
  if (companySettings.logo) {
    try {
      doc.addImage(companySettings.logo, 'JPEG', margin, margin, 40, 20, undefined, 'FAST');
    } catch (error) {
      console.error('Error adding logo to PDF:', error);
    }
  }
  
  // Company information
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const companyYPos = companySettings.logo ? 50 : margin;
  
  doc.text(companySettings.name, margin, companyYPos);
  if (companySettings.document) {
    doc.text(`CNPJ/CPF: ${companySettings.document}`, margin, companyYPos + 5);
  }
  if (companySettings.address) {
    doc.text(companySettings.address, margin, companyYPos + 10);
  }
  if (companySettings.email) {
    doc.text(`Email: ${companySettings.email}`, margin, companyYPos + 15);
  }
  if (companySettings.phone) {
    doc.text(`Telefone: ${companySettings.phone}`, margin, companyYPos + 20);
  }
  
  // Quote title
  const titleYPos = companyYPos + 30;
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'bold');
  doc.text('ORÇAMENTO', pageWidth / 2, titleYPos, { align: 'center' });
  
  // Quote number and date
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Orçamento Nº: ${quote.id}`, pageWidth / 2, titleYPos + 8, { align: 'center' });
  doc.text(`Data de Emissão: ${formatDate(quote.createdAt)}`, pageWidth / 2, titleYPos + 13, { align: 'center' });
  doc.text(`Validade: ${formatDate(quote.validUntil)}`, pageWidth / 2, titleYPos + 18, { align: 'center' });
  
  // Client information
  const clientYPos = titleYPos + 30;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'bold');
  doc.text('CLIENTE', margin, clientYPos);
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Nome: ${client.name}`, margin, clientYPos + 7);
  if (client.document) {
    doc.text(`CNPJ/CPF: ${client.document}`, margin, clientYPos + 14);
  }
  if (client.email) {
    doc.text(`Email: ${client.email}`, margin, clientYPos + 21);
  }
  if (client.phone) {
    doc.text(`Telefone: ${client.phone}`, margin, clientYPos + 28);
  }
  if (client.address) {
    doc.text(`Endereço: ${client.address}`, margin, clientYPos + 35);
  }
  
  // Quote Title
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text(quote.title, margin, clientYPos + 45);
  
  // Items table
  const tableYPos = clientYPos + 50;
  
  const tableHeaders = [['Item', 'Qtde', 'Preço Unit.', 'Desconto', 'Subtotal']];
  const tableBody = quote.items.map(item => [
    item.description || (item.product ? item.product.name : 'Produto'),
    item.quantity.toString(),
    formatCurrency(item.unitPrice),
    `${item.discount}%`,
    formatCurrency(item.subtotal)
  ]);
  
  autoTable(doc, {
    head: tableHeaders,
    body: tableBody,
    startY: tableYPos,
    margin: { left: margin, right: margin },
    headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    bodyStyles: { textColor: [50, 50, 50] },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 25, halign: 'center' },
      4: { cellWidth: 30, halign: 'right' }
    }
  });
  
  // Calculate the ending Y position of the table
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Subtotal, taxes and total
  const itemsSubtotal = quote.items.reduce((sum, item) => sum + item.subtotal, 0);
  let taxAmount = 0;
  
  if (quote.includeTaxes && quote.taxDetails) {
    const taxRate = (quote.taxDetails.iss + quote.taxDetails.pis + quote.taxDetails.cofins);
    taxAmount = calculateTaxAmount(itemsSubtotal, taxRate);
  }
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('Subtotal:', pageWidth - margin - 30, finalY);
  doc.text(formatCurrency(itemsSubtotal), pageWidth - margin, finalY, { align: 'right' });
  
  if (quote.includeTaxes && quote.taxDetails) {
    const taxRate = (quote.taxDetails.iss + quote.taxDetails.pis + quote.taxDetails.cofins);
    doc.text(`Impostos (${taxRate.toFixed(2)}%):`, pageWidth - margin - 30, finalY + 7);
    doc.text(formatCurrency(taxAmount), pageWidth - margin, finalY + 7, { align: 'right' });
  }
  
  doc.setFont(undefined, 'bold');
  doc.text('Total:', pageWidth - margin - 30, finalY + (quote.includeTaxes ? 14 : 7));
  doc.text(formatCurrency(itemsSubtotal + taxAmount), pageWidth - margin, finalY + (quote.includeTaxes ? 14 : 7), { align: 'right' });
  
  // Payment and delivery information
  const paymentYPos = finalY + (quote.includeTaxes ? 25 : 18);
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('CONDIÇÕES COMERCIAIS', margin, paymentYPos);
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  if (quote.paymentMethod) {
    doc.text(`Forma de Pagamento: ${quote.customPayment || quote.paymentMethod}`, margin, paymentYPos + 7);
  }
  if (quote.paymentTerms) {
    doc.text(`Condições de Pagamento: ${quote.customPayment || quote.paymentTerms}`, margin, paymentYPos + 14);
  }
  if (quote.deliveryTime) {
    doc.text(`Prazo de Entrega: ${quote.deliveryTime}`, margin, paymentYPos + 21);
  }
  
  // Notes
  if (quote.notes) {
    const notesYPos = paymentYPos + 35;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('OBSERVAÇÕES', margin, notesYPos);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    const textLines = doc.splitTextToSize(quote.notes, pageWidth - (margin * 2));
    doc.text(textLines, margin, notesYPos + 7);
  }
  
  // Footer
  const footerYPos = doc.internal.pageSize.height - 10;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Documento gerado pelo sistema OrçaFácil', pageWidth / 2, footerYPos, { align: 'center' });
  
  // Return the PDF as blob
  return doc.output('blob');
};

const generateCompactTemplate = async (
  doc: jsPDF,
  quote: Quote,
  client: Client,
  companySettings: CompanySettings
): Promise<Blob> => {
  // Implement compact template
  // (Using similar approach to standard but with more compact layout)
  
  return generateStandardTemplate(doc, quote, client, companySettings);
};

const generateDetailedTemplate = async (
  doc: jsPDF,
  quote: Quote,
  client: Client,
  companySettings: CompanySettings
): Promise<Blob> => {
  // Implement detailed template
  // (Using similar approach to standard but with more details)
  
  return generateStandardTemplate(doc, quote, client, companySettings);
};

const generateModernTemplate = async (
  doc: jsPDF,
  quote: Quote,
  client: Client,
  companySettings: CompanySettings
): Promise<Blob> => {
  // Implement modern template
  // (Using similar approach to standard but with modern styling)
  
  return generateStandardTemplate(doc, quote, client, companySettings);
};

export default {
  generateQuotePdf
};
