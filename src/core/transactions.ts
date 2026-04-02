import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  isAfter,
  parseISO,
} from 'date-fns'
import type { RecurrenceFrequency } from './types'

const MAX_OCCURRENCES = 120

export const buildTransactionDates = (params: {
  startDate: string
  installments: number
  recurrenceFrequency: RecurrenceFrequency
  recurrenceInterval: number
  recurrenceEndDate?: string | null | undefined
}): string[] => {
  const {
    startDate,
    installments,
    recurrenceFrequency,
    recurrenceInterval,
    recurrenceEndDate,
  } = params

  const initial = parseISO(startDate)

  if (installments > 1) {
    return Array.from({ length: installments }, (_, index) =>
      addMonths(initial, index).toISOString().slice(0, 10),
    )
  }

  if (recurrenceFrequency === 'none') {
    return [startDate]
  }

  if (!recurrenceEndDate) {
    return [startDate]
  }

  const dates: string[] = []
  const end = parseISO(recurrenceEndDate)
  let cursor = initial
  let guard = 0

  while (!isAfter(cursor, end) && guard < MAX_OCCURRENCES) {
    dates.push(cursor.toISOString().slice(0, 10))
    guard += 1

    switch (recurrenceFrequency) {
      case 'daily':
        cursor = addDays(cursor, recurrenceInterval)
        break
      case 'weekly':
        cursor = addWeeks(cursor, recurrenceInterval)
        break
      case 'monthly':
        cursor = addMonths(cursor, recurrenceInterval)
        break
      case 'yearly':
        cursor = addYears(cursor, recurrenceInterval)
        break
      default:
        break
    }
  }

  return dates
}
