const onlyDigits = (value: string): string => value.replace(/\D/g, '')

export const maskCurrencyInput = (value: string): string => {
  const digits = onlyDigits(value)
  if (!digits) return ''

  const normalized = Number(digits) / 100
  return normalized.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export const parseCurrencyInput = (value: string): number => {
  if (!value.trim()) return 0
  const normalized = value.replace(/\./g, '').replace(',', '.')
  const parsed = Number(normalized)
  return Number.isNaN(parsed) ? 0 : parsed
}
