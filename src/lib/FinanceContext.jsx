import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { DEFAULT_ACCOUNTS, DEFAULT_RATES } from './constants'
import { formatMoney, fromUSD, toUSD } from './currency'
import { translate } from './i18n'

const STORAGE_KEY = 'tf-finance:v1'

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

export const todayISO = () => {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

const createDefaultState = () => ({
  profile: { name: 'Usuario TF', lang: 'es', currency: 'USD' },
  rates: { ...DEFAULT_RATES },
  accounts: DEFAULT_ACCOUNTS.map((a) => ({ ...a })),
  transactions: [],
})

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createDefaultState()
    const parsed = JSON.parse(raw)
    const base = createDefaultState()
    return {
      profile: { ...base.profile, ...parsed.profile },
      rates: { ...base.rates, ...parsed.rates },
      accounts: Array.isArray(parsed.accounts) ? parsed.accounts : base.accounts,
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
    }
  } catch {
    return createDefaultState()
  }
}

const FinanceContext = createContext(null)

export function FinanceProvider({ children }) {
  const [state, setState] = useState(loadState)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* almacenamiento lleno o bloqueado */
    }
  }, [state])

  const { profile, rates, accounts, transactions } = state

  // Helpers de moneda e idioma
  const t = useCallback((key) => translate(profile.lang, key), [profile.lang])
  const usd = useCallback((amount, currency) => toUSD(amount, currency, rates), [rates])
  const convert = useCallback((usdAmount, currency) => fromUSD(usdAmount, currency, rates), [rates])
  const fmt = useCallback(
    (usdAmount, currency = profile.currency) => formatMoney(fromUSD(usdAmount, currency, rates), currency, profile.lang),
    [rates, profile.currency, profile.lang],
  )
  const fmtRaw = useCallback((amount, currency) => formatMoney(amount, currency, profile.lang), [profile.lang])

  // Movimientos enriquecidos con su valor en USD, ordenados por fecha desc
  const txs = useMemo(
    () =>
      transactions
        .map((tx) => ({ ...tx, usd: toUSD(tx.amount, tx.currency, rates) }))
        .sort((a, b) => (b.date === a.date ? b.createdAt - a.createdAt : b.date.localeCompare(a.date))),
    [transactions, rates],
  )

  const accountBalances = useMemo(() => {
    const map = {}
    for (const acc of accounts) map[acc.id] = toUSD(acc.initial, acc.currency, rates)
    for (const tx of txs) {
      if (map[tx.accountId] === undefined) continue
      map[tx.accountId] += tx.type === 'income' ? tx.usd : -tx.usd
    }
    return map
  }, [accounts, txs, rates])

  const totals = useMemo(() => {
    const income = txs.filter((x) => x.type === 'income').reduce((s, x) => s + x.usd, 0)
    const expense = txs.filter((x) => x.type === 'expense').reduce((s, x) => s + x.usd, 0)
    const balance = Object.values(accountBalances).reduce((s, v) => s + v, 0)
    const month = todayISO().slice(0, 7)
    const monthTx = txs.filter((x) => x.date.startsWith(month))
    return {
      income,
      expense,
      balance,
      monthIncome: monthTx.filter((x) => x.type === 'income').reduce((s, x) => s + x.usd, 0),
      monthExpense: monthTx.filter((x) => x.type === 'expense').reduce((s, x) => s + x.usd, 0),
    }
  }, [txs, accountBalances])

  // Acciones
  const addTransaction = (tx) =>
    setState((s) => ({
      ...s,
      transactions: [...s.transactions, { ...tx, id: uid(), amount: Number(tx.amount), createdAt: Date.now() }],
    }))
  const deleteTransaction = (id) =>
    setState((s) => ({ ...s, transactions: s.transactions.filter((x) => x.id !== id) }))
  const clearTransactions = () => setState((s) => ({ ...s, transactions: [] }))

  const addAccount = (acc) =>
    setState((s) => ({ ...s, accounts: [...s.accounts, { ...acc, id: uid(), initial: Number(acc.initial) || 0 }] }))
  const deleteAccount = (id) =>
    setState((s) => ({
      ...s,
      accounts: s.accounts.filter((a) => a.id !== id),
      transactions: s.transactions.filter((x) => x.accountId !== id),
    }))

  const updateProfile = (patch) => setState((s) => ({ ...s, profile: { ...s.profile, ...patch } }))
  const updateRates = (next) => setState((s) => ({ ...s, rates: { ...s.rates, ...next } }))

  const resetAll = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* noop */
    }
    setState(createDefaultState())
  }

  useEffect(() => {
    document.documentElement.lang = profile.lang
  }, [profile.lang])

  const value = {
    profile,
    rates,
    accounts,
    transactions: txs,
    accountBalances,
    totals,
    t,
    usd,
    convert,
    fmt,
    fmtRaw,
    addTransaction,
    deleteTransaction,
    clearTransactions,
    addAccount,
    deleteAccount,
    updateProfile,
    updateRates,
    resetAll,
  }

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useFinance = () => {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance debe usarse dentro de FinanceProvider')
  return ctx
}
