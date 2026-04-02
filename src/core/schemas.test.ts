import { describe, expect, it } from 'vitest'
import { transactionCreateSchema } from './schemas'

describe('transactionCreateSchema', () => {
  it('rejeita transferências sem conta de destino', () => {
    const parsed = transactionCreateSchema.safeParse({
      account_id: '9a1eb00d-44ba-4c1d-b312-02ab07e8c40a',
      category_id: null,
      goal_id: null,
      type: 'transfer',
      description: 'Transfer',
      amount: 100,
      currency: 'BRL',
      default_currency: 'BRL',
      occurs_on: '2026-01-01',
    })

    expect(parsed.success).toBe(false)
  })

  it('aceita despesa válida', () => {
    const parsed = transactionCreateSchema.safeParse({
      account_id: '9a1eb00d-44ba-4c1d-b312-02ab07e8c40a',
      transfer_account_id: null,
      category_id: 'c2e3f4c8-1dd7-4682-92a1-10f5f3ca5000',
      goal_id: null,
      type: 'expense',
      description: 'Mercado',
      amount: 120.5,
      currency: 'brl',
      default_currency: 'brl',
      occurs_on: '2026-01-01',
    })

    expect(parsed.success).toBe(true)

    if (parsed.success) {
      expect(parsed.data.currency).toBe('BRL')
      expect(parsed.data.default_currency).toBe('BRL')
    }
  })
})
