import { jsPDF } from 'jspdf'
import type { Session } from '../types/domain'
import { formatCurrency, formatShortDate } from './format'

export function generateSessionPdf(session: Session) {
  const pdf = new jsPDF({
    unit: 'pt',
    format: 'a4',
  })

  const margin = 48
  const rowHeight = 24
  let cursorY = 54

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(18)
  pdf.text('Candy Shop Session Report', margin, cursorY)

  cursorY += 28
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(11)
  pdf.text(`Session ID: ${session.id}`, margin, cursorY)
  cursorY += 18
  pdf.text(`Session Date: ${formatShortDate(session.date)}`, margin, cursorY)
  cursorY += 26

  const columns = [
    { label: 'Candy', x: margin },
    { label: 'Qty', x: 290 },
    { label: 'Unit Price', x: 350 },
    { label: 'Subtotal', x: 455 },
  ]

  pdf.setFont('helvetica', 'bold')
  columns.forEach((column) => pdf.text(column.label, column.x, cursorY))
  cursorY += 10
  pdf.line(margin, cursorY, 548, cursorY)
  cursorY += 18

  pdf.setFont('helvetica', 'normal')

  session.items.forEach((item) => {
    pdf.text(item.candyName, margin, cursorY)
    pdf.text(String(item.quantity), 290, cursorY)
    pdf.text(formatCurrency(item.unitPrice), 350, cursorY)
    pdf.text(formatCurrency(item.subtotal), 455, cursorY)
    cursorY += rowHeight

    if (cursorY > 760) {
      pdf.addPage()
      cursorY = 54
    }
  })

  cursorY += 10
  pdf.line(margin, cursorY, 548, cursorY)
  cursorY += 24
  pdf.setFont('helvetica', 'bold')
  pdf.text(`Total Sold: ${formatCurrency(session.totalSold)}`, margin, cursorY)

  pdf.save(`session-${session.id}.pdf`)
}
