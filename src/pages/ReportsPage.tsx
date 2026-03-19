import { useEffect, useMemo, useState } from 'react'
import { LuDownload } from 'react-icons/lu'
import { AccessDenied } from '../components/AccessDenied'
import { PageSkeleton } from '../components/PageSkeleton'
import { Panel } from '../components/Panel'
import { CustomSelect } from '../components/fields/CustomSelect'
import { fetchCategoryReport, fetchMonthlyReport } from '../lib/db'
import { formatCurrency, formatShortDate } from '../lib/format'
import type {
  CategoryKind,
  CategoryReportRow,
  MonthlyReportRow,
  UserPreferences,
} from '../types/finance'

interface ReportsPageProps {
  userId: string
  preferences: UserPreferences
  moduleAccess: {
    can_view: boolean
    can_list: boolean
    can_create: boolean
    can_edit: boolean
    can_delete: boolean
  }
}

const toCsv = (rows: MonthlyReportRow[]): string => {
  const header = 'month_start,currency,total_income,total_expense,net_result'
  const lines = rows.map(
    (item) =>
      `${item.month_start},${item.currency},${item.total_income},${item.total_expense},${item.net_result}`,
  )
  return [header, ...lines].join('\n')
}

export const ReportsPage = ({
  userId,
  preferences,
  moduleAccess,
}: ReportsPageProps) => {
  const [monthlyRows, setMonthlyRows] = useState<MonthlyReportRow[]>([])
  const [categoryRows, setCategoryRows] = useState<CategoryReportRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [kindFilter, setKindFilter] = useState<CategoryKind>('expense')

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      setLoading(true)
      setError('')

      try {
        const [monthlyData, categoryData] = await Promise.all([
          fetchMonthlyReport(userId),
          fetchCategoryReport(userId),
        ])

        if (!isMounted) return

        setMonthlyRows(monthlyData)
        setCategoryRows(categoryData)

        if (monthlyData[0]) {
          setSelectedMonth(monthlyData[0].month_start)
        }
      } catch (loadError) {
        if (!isMounted) return
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Erro ao carregar relatórios.',
        )
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    void load()

    return () => {
      isMounted = false
    }
  }, [userId])

  const filteredCategoryRows = useMemo(() => {
    return categoryRows.filter(
      (item) => item.month_start === selectedMonth && item.kind === kindFilter,
    )
  }, [categoryRows, selectedMonth, kindFilter])

  const totalByKind = useMemo(
    () =>
      filteredCategoryRows.reduce((sum, item) => sum + Number(item.total_amount), 0),
    [filteredCategoryRows],
  )

  const handleExportCsv = () => {
    const blob = new Blob([toCsv(monthlyRows)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'monthly_report.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  if (!moduleAccess.can_view) return <AccessDenied moduleLabel="Relatórios" />
  if (loading) return <PageSkeleton cards={2} lines={6} withTable />
  if (error) {
    return (
      <div className="border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
        {error}
      </div>
    )
  }

  const months = Array.from(new Set(monthlyRows.map((row) => row.month_start))).sort(
    (a, b) => b.localeCompare(a),
  )

  return (
    <div className="grid gap-4">
      {moduleAccess.can_list ? (
        <Panel
          title="Resumo mensal"
          subtitle="Consolidado de receitas, despesas e resultado"
          actions={
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 border border-primary/40 px-3 py-2 text-xs font-medium uppercase tracking-[0.14em] text-primary transition hover:bg-primary/10"
            >
              <LuDownload className="h-3.5 w-3.5" />
              Exportar CSV
            </button>
          }
        >
          <div className="overflow-auto">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-[0.14em] text-muted">
                  <th className="pb-2 pr-2">Mês</th>
                  <th className="pb-2 pr-2 text-right">Receitas</th>
                  <th className="pb-2 pr-2 text-right">Despesas</th>
                  <th className="pb-2 text-right">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {monthlyRows.map((row) => (
                  <tr
                    key={`${row.month_start}-${row.currency}`}
                    className="border-b border-border/60"
                  >
                    <td className="py-3 pr-2 text-ink">
                      {formatShortDate(row.month_start, preferences.locale).slice(3)}
                    </td>
                    <td className="py-3 pr-2 text-right text-ink">
                      {formatCurrency(
                        Number(row.total_income),
                        row.currency,
                        preferences.locale,
                      )}
                    </td>
                    <td className="py-3 pr-2 text-right text-ink">
                      {formatCurrency(
                        Number(row.total_expense),
                        row.currency,
                        preferences.locale,
                      )}
                    </td>
                    <td className="py-3 text-right font-medium text-ink">
                      {formatCurrency(
                        Number(row.net_result),
                        row.currency,
                        preferences.locale,
                      )}
                    </td>
                  </tr>
                ))}
                {monthlyRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-muted">
                      Nenhum dado mensal.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Panel>
      ) : (
        <AccessDenied moduleLabel="Resumo mensal" />
      )}

      {moduleAccess.can_list ? (
        <Panel title="Análise por categoria">
          <div className="mb-4 grid gap-3 md:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className="text-muted">Mês</span>
              <CustomSelect
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
              >
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </CustomSelect>
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-muted">Tipo</span>
              <CustomSelect
                value={kindFilter}
                onChange={(event) => setKindFilter(event.target.value as CategoryKind)}
              >
                <option value="expense">Despesa</option>
                <option value="income">Receita</option>
              </CustomSelect>
            </label>
          </div>

          <div className="grid gap-2">
            {filteredCategoryRows.map((row) => {
              const ratio =
                totalByKind > 0 ? (Number(row.total_amount) / totalByKind) * 100 : 0
              return (
                <div
                  key={`${row.category_id}-${row.month_start}`}
                  className="border border-border bg-white/80 p-3"
                >
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="text-ink">{row.category_name}</span>
                    <strong className="text-ink">
                      {formatCurrency(
                        Number(row.total_amount),
                        row.currency,
                        preferences.locale,
                      )}
                    </strong>
                  </div>
                  <div className="h-2 bg-neutral-200">
                    <div className="h-2 bg-primary" style={{ width: `${ratio}%` }} />
                  </div>
                </div>
              )
            })}

            {filteredCategoryRows.length === 0 ? (
              <p className="text-sm text-muted">
                Nenhum dado de categoria para o filtro atual.
              </p>
            ) : null}
          </div>
        </Panel>
      ) : (
        <AccessDenied moduleLabel="Análise por categoria" />
      )}
    </div>
  )
}
