import type { SaleOrder, SalesSession } from '../types/session'
import { formatCurrency } from './inventoryFormat'

export async function generateSessionPdf(session: SalesSession, orders: SaleOrder[]) {
  const { jsPDF } = await import('jspdf')
  const document = new jsPDF()
  const rows = orders.flatMap((order) => order.lines)
  let y = 22

  document.setFontSize(18)
  document.text('Relatório da sessão de vendas', 14, y)
  y += 10
  document.setFontSize(10)
  document.text(`Sessão: ${session.id}`, 14, y)
  y += 6
  document.text(`Data: ${new Date(session.openedAt).toLocaleString('pt-BR')}`, 14, y)
  y += 10

  document.setFont('helvetica', 'bold')
  document.text('Doce', 14, y)
  document.text('Qtd.', 104, y)
  document.text('Preço unit.', 126, y)
  document.text('Subtotal', 170, y)
  document.line(14, y + 2, 196, y + 2)
  document.setFont('helvetica', 'normal')
  y += 8

  for (const row of rows) {
    if (y > 275) {
      document.addPage()
      y = 20
    }
    document.text(row.candyName.slice(0, 42), 14, y)
    document.text(String(row.quantity), 104, y)
    document.text(formatCurrency(row.unitPrice), 126, y)
    document.text(formatCurrency(row.subtotal), 170, y)
    y += 7
  }

  y += 3
  document.setFont('helvetica', 'bold')
  document.text(`Total vendido: ${formatCurrency(session.total)}`, 14, y)
  document.save(`sessao-${session.id}.pdf`)
}
