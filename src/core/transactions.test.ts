import { describe, expect, it } from 'vitest'
import { buildTransactionDates } from './transactions'

describe('buildTransactionDates', () => {
  it('gera parcelas mensais', () => {
    const dates = buildTransactionDates({
      startDate: '2026-01-10',
      installments: 3,
      recurrenceFrequency: 'none',
      recurrenceInterval: 1,
    })

    expect(dates).toEqual(['2026-01-10', '2026-02-10', '2026-03-10'])
  })

  it('gera recorrência semanal até data final', () => {
    const dates = buildTransactionDates({
      startDate: '2026-01-01',
      installments: 1,
      recurrenceFrequency: 'weekly',
      recurrenceInterval: 1,
      recurrenceEndDate: '2026-01-22',
    })

    expect(dates).toEqual([
      '2026-01-01',
      '2026-01-08',
      '2026-01-15',
      '2026-01-22',
    ])
  })
})
