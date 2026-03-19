export const formatCurrency = (
  value: number,
  currency: string,
  locale: string,
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value)
}

export const formatShortDate = (isoDate: string, locale: string): string => {
  return new Date(isoDate).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

export const toInputDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}
