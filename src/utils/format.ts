export function formatCurrency(valueInCents: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valueInCents / 100)
}

export function formatShortDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))
}

export function fromCents(valueInCents: number) {
  return Number((valueInCents / 100).toFixed(2))
}

export function toCents(value: number) {
  return Math.round(value * 100)
}
