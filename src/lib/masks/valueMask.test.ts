import { describe, expect, it } from 'vitest'
import { maskCurrencyInput, parseCurrencyInput } from './valueMask'

describe('valueMask', () => {
  it('aplica máscara de moeda em pt-BR', () => {
    expect(maskCurrencyInput('1')).toBe('0,01')
    expect(maskCurrencyInput('123')).toBe('1,23')
    expect(maskCurrencyInput('123456')).toBe('1.234,56')
  })

  it('converte valor mascarado para número', () => {
    expect(parseCurrencyInput('1.234,56')).toBe(1234.56)
    expect(parseCurrencyInput('0,01')).toBe(0.01)
    expect(parseCurrencyInput('')).toBe(0)
  })
})
