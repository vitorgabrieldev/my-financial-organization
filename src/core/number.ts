export const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : Number.NaN
  }

  return Number.NaN
}

export const roundMoney = (value: number): number => {
  return Math.round((value + Number.EPSILON) * 100) / 100
}
