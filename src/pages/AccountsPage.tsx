import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { LuTrash2 } from 'react-icons/lu'
import { AccessDenied } from '../components/AccessDenied'
import { PageSkeleton } from '../components/PageSkeleton'
import { Panel } from '../components/Panel'
import { CustomSelect } from '../components/fields/CustomSelect'
import { fetchAccounts, fetchTransactions } from '../lib/db'
import { formatCurrency } from '../lib/format'
import { maskCurrencyInput, parseCurrencyInput } from '../lib/masks/valueMask'
import { supabase } from '../lib/supabase'
import type {
  Account,
  AccountType,
  Transaction,
  UserPreferences,
} from '../types/finance'

interface AccountsPageProps {
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

const accountTypeOptions: { value: AccountType; label: string }[] = [
  { value: 'checking', label: 'Conta corrente' },
  { value: 'savings', label: 'Poupança' },
  { value: 'cash', label: 'Carteira' },
  { value: 'credit', label: 'Cartão de crédito' },
  { value: 'investment', label: 'Investimento' },
  { value: 'other', label: 'Outro' },
]

export const AccountsPage = ({
  userId,
  preferences,
  moduleAccess,
}: AccountsPageProps) => {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [type, setType] = useState<AccountType>('checking')
  const [currency, setCurrency] = useState(preferences.default_currency)
  const [initialBalance, setInitialBalance] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [accountsData, transactionsData] = await Promise.all([
        fetchAccounts(userId),
        fetchTransactions(userId, 500),
      ])
      setAccounts(accountsData)
      setTransactions(transactionsData)
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : 'Erro ao carregar contas.',
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

  const balances = useMemo(() => {
    const accountMap: Record<string, number> = {}

    for (const account of accounts) {
      accountMap[account.id] = Number(account.initial_balance)
    }

    for (const item of transactions) {
      if (item.type === 'income') {
        accountMap[item.account_id] = (accountMap[item.account_id] ?? 0) + item.amount
      } else if (item.type === 'expense') {
        accountMap[item.account_id] = (accountMap[item.account_id] ?? 0) - item.amount
      } else if (item.type === 'transfer' && item.transfer_account_id) {
        accountMap[item.account_id] = (accountMap[item.account_id] ?? 0) - item.amount
        accountMap[item.transfer_account_id] =
          (accountMap[item.transfer_account_id] ?? 0) + item.amount
      }
    }

    return accountMap
  }, [accounts, transactions])

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!moduleAccess.can_create) {
      setError('Seu perfil não possui permissão para criar contas.')
      return
    }
    setSaving(true)
    setError('')

    const { error: insertError } = await supabase.from('accounts').insert({
      user_id: userId,
      name: name.trim(),
      type,
      currency: currency.toUpperCase(),
      initial_balance: parseCurrencyInput(initialBalance),
    })

    setSaving(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    setName('')
    setInitialBalance('')
    await load()
  }

  const handleDelete = async (accountId: string) => {
    if (!moduleAccess.can_delete) {
      setError('Seu perfil não possui permissão para excluir contas.')
      return
    }
    const { error: deleteError } = await supabase
      .from('accounts')
      .delete()
      .eq('id', accountId)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    await load()
  }

  if (!moduleAccess.can_view) return <AccessDenied moduleLabel="Contas" />
  if (loading) return <PageSkeleton cards={1} lines={6} withForm withTable />

  return (
    <div className="grid gap-4">
      {moduleAccess.can_create ? (
        <Panel title="Nova conta" subtitle="Controle por tipo de conta e moeda">
          <form onSubmit={handleCreate} className="grid gap-3 lg:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className="text-muted">Nome da conta</span>
              <input
                required
                minLength={2}
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="input"
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-muted">Tipo</span>
              <CustomSelect
                value={type}
                onChange={(event) => setType(event.target.value as AccountType)}
              >
                {accountTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </CustomSelect>
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-muted">Moeda (ISO 4217)</span>
              <input
                required
                maxLength={3}
                value={currency}
                onChange={(event) => setCurrency(event.target.value.toUpperCase())}
                className="input uppercase"
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-muted">Saldo inicial</span>
              <input
                type="text"
                value={initialBalance}
                onChange={(event) =>
                  setInitialBalance(maskCurrencyInput(event.target.value))
                }
                placeholder="0,00"
                className="input"
              />
            </label>

            <div className="lg:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="border border-primary bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-dark disabled:opacity-60"
              >
                {saving ? 'Salvando...' : 'Criar conta'}
              </button>
            </div>
          </form>

          {error ? (
            <p className="mt-3 border border-rose-200 bg-rose-50 p-2 text-sm text-rose-700">
              {error}
            </p>
          ) : null}
        </Panel>
      ) : null}

      {moduleAccess.can_list ? (
        <Panel title="Contas cadastradas">
          <div className="grid gap-2">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border border-border bg-white/80 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-ink">{account.name}</p>
                  <p className="text-xs uppercase tracking-[0.14em] text-muted">
                    {account.type} - {account.currency}
                  </p>
                </div>
                <strong className="font-medium text-ink">
                  {formatCurrency(
                    balances[account.id] ?? Number(account.initial_balance),
                    account.currency,
                    preferences.locale,
                  )}
                </strong>
                <button
                  type="button"
                  disabled={!moduleAccess.can_delete}
                  onClick={() => void handleDelete(account.id)}
                  className="inline-flex items-center gap-1 border border-border px-2 py-1 text-xs text-muted transition hover:border-rose-300 hover:text-rose-700 disabled:cursor-not-allowed"
                >
                  <LuTrash2 className="h-3.5 w-3.5" />
                  Remover
                </button>
              </div>
            ))}

            {accounts.length === 0 ? (
              <p className="text-sm text-muted">Nenhuma conta cadastrada.</p>
            ) : null}
          </div>
        </Panel>
      ) : (
        <AccessDenied moduleLabel="Listagem de contas" />
      )}
    </div>
  )
}
