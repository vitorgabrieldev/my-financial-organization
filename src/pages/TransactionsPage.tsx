import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { LuDownload, LuTrash2 } from 'react-icons/lu'
import { AccessDenied } from '../components/AccessDenied'
import { PageSkeleton } from '../components/PageSkeleton'
import { Panel } from '../components/Panel'
import { CustomDateInput } from '../components/fields/CustomDateInput'
import { CustomFileUpload } from '../components/fields/CustomFileUpload'
import { CustomSelect } from '../components/fields/CustomSelect'
import {
  fetchAccounts,
  fetchCategories,
  fetchGoals,
  fetchTransactions,
} from '../lib/db'
import { formatCurrency, formatShortDate, toInputDate } from '../lib/format'
import { getExchangeRate } from '../lib/currency'
import { maskCurrencyInput, parseCurrencyInput } from '../lib/masks/valueMask'
import { supabase } from '../lib/supabase'
import { buildTransactionDates } from '../lib/transactions'
import type {
  Account,
  Category,
  Goal,
  RecurrenceFrequency,
  Transaction,
  TransactionType,
  UserPreferences,
} from '../types/finance'

interface TransactionsPageProps {
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

const recurrenceOptions: {
  value: RecurrenceFrequency
  label: string
}[] = [
  { value: 'none', label: 'Sem recorrência' },
  { value: 'daily', label: 'Diária' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
  { value: 'yearly', label: 'Anual' },
]

const sanitizeFileName = (name: string): string =>
  name.replace(/[^a-zA-Z0-9._-]/g, '_')

export const TransactionsPage = ({
  userId,
  preferences,
  moduleAccess,
}: TransactionsPageProps) => {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [type, setType] = useState<TransactionType>('expense')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState(preferences.default_currency)
  const [accountId, setAccountId] = useState('')
  const [transferAccountId, setTransferAccountId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [goalId, setGoalId] = useState('')
  const [occursOn, setOccursOn] = useState(toInputDate(new Date()))
  const [notes, setNotes] = useState('')
  const [recurrenceFrequency, setRecurrenceFrequency] =
    useState<RecurrenceFrequency>('none')
  const [recurrenceInterval, setRecurrenceInterval] = useState('1')
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('')
  const [installments, setInstallments] = useState('1')
  const [file, setFile] = useState<File | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [accountsData, categoriesData, goalsData, transactionsData] =
        await Promise.all([
          fetchAccounts(userId),
          fetchCategories(userId),
          fetchGoals(userId),
          fetchTransactions(userId, 400),
        ])

      setAccounts(accountsData)
      setCategories(categoriesData)
      setGoals(goalsData)
      setTransactions(transactionsData)

      setAccountId((current) => current || accountsData[0]?.id || '')
      setCategoryId((current) => {
        if (current) return current
        const fallbackCategory =
          categoriesData.find((item) => item.kind === 'expense') ?? categoriesData[0]
        return fallbackCategory?.id || ''
      })
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Erro ao carregar transações.',
      )
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    setCurrency(preferences.default_currency)
  }, [preferences.default_currency])

  const availableCategories = useMemo(() => {
    if (type === 'transfer') return []
    const kind = type === 'income' ? 'income' : 'expense'
    return categories.filter((item) => item.kind === kind)
  }, [categories, type])

  useEffect(() => {
    if (availableCategories.length > 0) {
      setCategoryId(availableCategories[0].id)
    } else {
      setCategoryId('')
    }
  }, [availableCategories])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!moduleAccess.can_create) {
      setError('Seu perfil não possui permissão para criar transações.')
      return
    }
    setSaving(true)
    setError('')

    const parsedAmount = parseCurrencyInput(amount)
    const parsedInstallments = Math.max(1, Number(installments))
    const parsedRecurrenceInterval = Math.max(1, Number(recurrenceInterval))

    if (!accountId) {
      setError('Selecione uma conta.')
      setSaving(false)
      return
    }

    if (type === 'transfer' && (!transferAccountId || transferAccountId === accountId)) {
      setError('Selecione uma conta de destino diferente para a transferência.')
      setSaving(false)
      return
    }

    if (type !== 'transfer' && !categoryId) {
      setError('Selecione uma categoria.')
      setSaving(false)
      return
    }

    if (recurrenceFrequency !== 'none' && !recurrenceEndDate && parsedInstallments <= 1) {
      setError('Informe a data final para recorrência.')
      setSaving(false)
      return
    }

    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Valor inválido.')
      setSaving(false)
      return
    }

    let attachmentPath: string | null = null

    if (file) {
      const path = `${userId}/${Date.now()}-${sanitizeFileName(file.name)}`
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(path, file)

      if (uploadError) {
        setError(uploadError.message)
        setSaving(false)
        return
      }

      attachmentPath = path
    }

    try {
      const rate = await getExchangeRate(currency, preferences.default_currency)
      const transactionDates = buildTransactionDates({
        startDate: occursOn,
        installments: parsedInstallments,
        recurrenceFrequency,
        recurrenceInterval: parsedRecurrenceInterval,
        recurrenceEndDate,
      })

      const installmentGroupId = parsedInstallments > 1 ? crypto.randomUUID() : null

      const payload = transactionDates.map((date, index) => ({
        user_id: userId,
        account_id: accountId,
        transfer_account_id: type === 'transfer' ? transferAccountId : null,
        category_id: type === 'transfer' ? null : categoryId,
        goal_id: goalId || null,
        type,
        description: description.trim(),
        notes: notes || null,
        amount: parsedAmount,
        currency: currency.toUpperCase(),
        amount_in_default_currency: Number((parsedAmount * rate).toFixed(2)),
        default_currency: preferences.default_currency,
        exchange_rate: rate,
        occurs_on: date,
        attachment_path: attachmentPath,
        recurrence_frequency: parsedInstallments > 1 ? 'none' : recurrenceFrequency,
        recurrence_interval:
          parsedInstallments > 1
            ? 1
            : recurrenceFrequency === 'none'
              ? 1
              : parsedRecurrenceInterval,
        recurrence_end_date:
          parsedInstallments > 1 || recurrenceFrequency === 'none'
            ? null
            : recurrenceEndDate,
        installment_group_id: installmentGroupId,
        installment_number: parsedInstallments > 1 ? index + 1 : null,
        installment_total: parsedInstallments > 1 ? parsedInstallments : null,
      }))

      const { error: insertError } = await supabase.from('transactions').insert(payload)
      if (insertError) {
        setError(insertError.message)
        return
      }

      setDescription('')
      setAmount('')
      setTransferAccountId('')
      setGoalId('')
      setNotes('')
      setRecurrenceFrequency('none')
      setRecurrenceInterval('1')
      setRecurrenceEndDate('')
      setInstallments('1')
      setFile(null)

      await load()
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Falha ao salvar transação.',
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item: Transaction) => {
    if (!moduleAccess.can_delete) {
      setError('Seu perfil não possui permissão para excluir transações.')
      return
    }
    const { error: deleteError } = await supabase
      .from('transactions')
      .delete()
      .eq('id', item.id)
    if (deleteError) {
      setError(deleteError.message)
      return
    }

    if (item.attachment_path) {
      await supabase.storage.from('receipts').remove([item.attachment_path])
    }

    await load()
  }

  const handleOpenReceipt = async (path: string) => {
    const { data, error: signedUrlError } = await supabase.storage
      .from('receipts')
      .createSignedUrl(path, 60)

    if (signedUrlError || !data?.signedUrl) {
      setError(signedUrlError?.message || 'Não foi possível abrir o comprovante.')
      return
    }

    window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
  }

  if (!moduleAccess.can_view) return <AccessDenied moduleLabel="Transações" />
  if (loading) return <PageSkeleton cards={1} lines={8} withForm withTable />

  const accountMap = new Map(accounts.map((account) => [account.id, account]))
  const categoryMap = new Map(categories.map((category) => [category.id, category]))

  return (
    <div className="grid gap-4">
      <Panel
        title="Nova transação"
        subtitle="Com recorrência, parcelamento e conversão de moeda"
      >
        {moduleAccess.can_create ? (
          <form onSubmit={handleSubmit} className="grid gap-3 lg:grid-cols-3">
            <label className="grid gap-1 text-sm">
              <span className="text-muted">Tipo</span>
              <CustomSelect
                value={type}
                onChange={(event) => setType(event.target.value as TransactionType)}
              >
                <option value="expense">Despesa</option>
                <option value="income">Receita</option>
                <option value="transfer">Transferência</option>
              </CustomSelect>
            </label>

            <label className="grid gap-1 text-sm lg:col-span-2">
              <span className="text-muted">Descrição</span>
              <input
                required
                minLength={2}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="input"
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-muted">Valor</span>
              <input
                required
                value={amount}
                onChange={(event) => setAmount(maskCurrencyInput(event.target.value))}
                placeholder="0,00"
                className="input"
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-muted">Moeda</span>
              <input
                required
                maxLength={3}
                value={currency}
                onChange={(event) => setCurrency(event.target.value.toUpperCase())}
                className="input uppercase"
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-muted">Data</span>
              <CustomDateInput
                value={occursOn}
                onChange={(event) => setOccursOn(event.target.value)}
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-muted">Conta de origem</span>
              <CustomSelect
                required
                value={accountId}
                onChange={(event) => setAccountId(event.target.value)}
              >
                <option value="">Selecione</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </CustomSelect>
            </label>

            {type === 'transfer' ? (
              <label className="grid gap-1 text-sm">
                <span className="text-muted">Conta de destino</span>
                <CustomSelect
                  required
                  value={transferAccountId}
                  onChange={(event) => setTransferAccountId(event.target.value)}
                >
                  <option value="">Selecione</option>
                  {accounts
                    .filter((account) => account.id !== accountId)
                    .map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                </CustomSelect>
              </label>
            ) : (
              <label className="grid gap-1 text-sm">
                <span className="text-muted">Categoria</span>
                <CustomSelect
                  required
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                >
                  {availableCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </CustomSelect>
              </label>
            )}

            <label className="grid gap-1 text-sm">
              <span className="text-muted">Meta (opcional)</span>
              <CustomSelect value={goalId} onChange={(event) => setGoalId(event.target.value)}>
                <option value="">Nenhuma</option>
                {goals.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.name}
                  </option>
                ))}
              </CustomSelect>
            </label>

            <label className="grid gap-1 text-sm lg:col-span-3">
              <span className="text-muted">Observações</span>
              <input
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="input"
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-muted">Parcelas</span>
              <input
                type="text"
                value={installments}
                onChange={(event) =>
                  setInstallments(event.target.value.replace(/\D/g, '').slice(0, 3))
                }
                placeholder="1"
                className="input"
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-muted">Recorrência</span>
              <CustomSelect
                value={recurrenceFrequency}
                onChange={(event) =>
                  setRecurrenceFrequency(event.target.value as RecurrenceFrequency)
                }
                disabled={Number(installments || '1') > 1}
              >
                {recurrenceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </CustomSelect>
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-muted">Intervalo</span>
              <input
                type="text"
                value={recurrenceInterval}
                onChange={(event) =>
                  setRecurrenceInterval(event.target.value.replace(/\D/g, '').slice(0, 3))
                }
                disabled={recurrenceFrequency === 'none' || Number(installments || '1') > 1}
                className="input"
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-muted">Recorrência até</span>
              <CustomDateInput
                value={recurrenceEndDate}
                onChange={(event) => setRecurrenceEndDate(event.target.value)}
                disabled={recurrenceFrequency === 'none' || Number(installments || '1') > 1}
              />
            </label>

            <label className="grid gap-1 text-sm lg:col-span-2">
              <span className="text-muted">Comprovante (opcional)</span>
              <CustomFileUpload
                value={file}
                onChange={setFile}
                accept=".png,.jpg,.jpeg,.webp,.pdf"
                placeholder="Clique para anexar arquivo"
              />
            </label>

            <div className="lg:col-span-3">
              <button
                type="submit"
                disabled={saving}
                className="border border-primary bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-dark disabled:opacity-60"
              >
                {saving ? 'Salvando...' : 'Registrar transação'}
              </button>
            </div>
          </form>
        ) : (
          <AccessDenied moduleLabel="Cadastro de transações" />
        )}

        {error ? (
          <p className="mt-3 border border-rose-200 bg-rose-50 p-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}
      </Panel>

      {moduleAccess.can_list ? (
        <Panel title="Histórico" subtitle="Lançamentos mais recentes">
          <div className="overflow-auto">
            <table className="w-full min-w-[980px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-[0.14em] text-muted">
                  <th className="pb-2 pr-2">Data</th>
                  <th className="pb-2 pr-2">Descrição</th>
                  <th className="pb-2 pr-2">Conta</th>
                  <th className="pb-2 pr-2">Categoria</th>
                  <th className="pb-2 pr-2">Tipo</th>
                  <th className="pb-2 pr-2 text-right">Valor</th>
                  <th className="pb-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((item) => (
                  <tr key={item.id} className="border-b border-border/60">
                    <td className="py-3 pr-2 text-muted">
                      {formatShortDate(item.occurs_on, preferences.locale)}
                    </td>
                    <td className="py-3 pr-2 text-ink">{item.description}</td>
                    <td className="py-3 pr-2 text-ink">
                      {accountMap.get(item.account_id)?.name ?? 'Conta removida'}
                    </td>
                    <td className="py-3 pr-2 text-muted">
                      {item.type === 'transfer'
                        ? 'Transferência'
                        : (categoryMap.get(item.category_id ?? '')?.name ?? '-')}
                    </td>
                    <td className="py-3 pr-2 capitalize text-muted">{item.type}</td>
                    <td className="py-3 pr-2 text-right font-medium text-ink">
                      {formatCurrency(item.amount, item.currency, preferences.locale)}
                    </td>
                    <td className="py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        {item.attachment_path ? (
                          <button
                            type="button"
                            onClick={() => void handleOpenReceipt(item.attachment_path!)}
                            className="inline-flex items-center gap-1 border border-border px-2 py-1 text-xs text-muted transition hover:border-primary/50 hover:text-primary"
                          >
                            <LuDownload className="h-3.5 w-3.5" />
                            Comprovante
                          </button>
                        ) : null}
                        <button
                          type="button"
                          disabled={!moduleAccess.can_delete}
                          onClick={() => void handleDelete(item)}
                          className="inline-flex items-center gap-1 border border-border px-2 py-1 text-xs text-muted transition hover:border-rose-300 hover:text-rose-700 disabled:cursor-not-allowed"
                        >
                          <LuTrash2 className="h-3.5 w-3.5" />
                          Remover
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-muted">
                      Nenhuma transação cadastrada.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Panel>
      ) : (
        <AccessDenied moduleLabel="Histórico de transações" />
      )}
    </div>
  )
}
