import { describe, expect, it } from 'vitest'
import { maskPhoneBR, sanitizePhoneBR } from './phoneMask'

describe('phoneMask', () => {
  it('aplica máscara de telefone brasileiro', () => {
    expect(maskPhoneBR('119')).toBe('(11) 9')
    expect(maskPhoneBR('11987654321')).toBe('(11) 98765-4321')
    expect(maskPhoneBR('11-9876-4321')).toBe('(11) 9876-4321')
  })

  it('normaliza telefone para somente dígitos', () => {
    expect(sanitizePhoneBR('(11) 98765-4321')).toBe('11987654321')
    expect(sanitizePhoneBR('11987abc654321')).toBe('11987654321')
  })
})
