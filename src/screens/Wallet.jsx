import { useMemo, useState } from 'react'
import { Plus, Search, Trash2, ListFilter } from 'lucide-react'
import { ACCOUNT_TYPES, CURRENCIES } from '../lib/constants'
import { useFinance } from '../lib/FinanceContext'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import TransactionForm from '../components/TransactionForm'
import TransactionItem from '../components/TransactionItem'
import EmptyState from '../components/EmptyState'

function AccountCard({ account, onDelete }) {
  const { accountBalances, convert, fmtRaw, fmt, t, profile } = useFinance()
  const meta = ACCOUNT_TYPES[account.type] ?? ACCOUNT_TYPES.wallet
  const Icon = meta.icon
  const usdBalance = accountBalances[account.id] ?? 0
  return (
    <div className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${meta.gradient} p-4 shadow-lg`}>
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
      <div className="relative flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur">
          <Icon size={20} />
        </span>
        <button
          onClick={() => onDelete(account)}
          className="rounded-lg p-1.5 text-white/60 transition hover:bg-black/20 hover:text-white md:opacity-0 md:group-hover:opacity-100"
          aria-label={t('deleteAccount')}
        >
          <Trash2 size={15} />
        </button>
      </div>
      <p className="relative mt-4 text-sm font-medium text-white/80">{account.name}</p>
      <p className="relative text-xl font-bold text-white">{fmtRaw(convert(usdBalance, account.currency), account.currency)}</p>
      <div className="relative mt-1 flex items-center justify-between text-[11px] text-white/70">
        <span>{t(`accountTypes.${account.type}`)} · {account.currency}</span>
        {account.currency !== profile.currency && <span>≈ {fmt(usdBalance)}</span>}
      </div>
    </div>
  )
}

function AddAccountForm({ onDone }) {
  const { t, addAccount } = useFinance()
  const [form, setForm] = useState({ name: '', type: 'bank', currency: 'USD', initial: '' })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    addAccount({ ...form, name: form.name.trim(), initial: parseFloat(String(form.initial).replace(',', '.')) || 0 })
    onDone()
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label" htmlFor="acc-name">{t('accountName')}</label>
        <input id="acc-name" className="input" value={form.name} onChange={set('name')} placeholder="Zelle, Zinli, Mercantil…" maxLength={30} autoFocus />
      </div>
      <div>
        <label className="label">{t('accountType')}</label>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(ACCOUNT_TYPES).map(([id, { icon: Icon }]) => (
            <button
              type="button"
              key={id}
              onClick={() => setForm((f) => ({ ...f, type: id }))}
              className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-[10px] transition ${
                form.type === id ? 'border-brand bg-brand/15 text-brand-pale' : 'border-slate-700 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Icon size={18} />
              <span className="truncate">{t(`accountTypes.${id}`)}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <div>
          <label className="label" htmlFor="acc-init">{t('initialBalance')}</label>
          <input id="acc-init" className="input" inputMode="decimal" placeholder="0.00" value={form.initial} onChange={set('initial')} />
        </div>
        <div>
          <label className="label" htmlFor="acc-cur">{t('currency')}</label>
          <select id="acc-cur" className="input w-28" value={form.currency} onChange={set('currency')}>
            {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <button type="submit" className="btn-primary w-full py-3" disabled={!form.name.trim()}>
        {t('save')}
      </button>
    </form>
  )
}

export default function Wallet({ tab, onTabChange }) {
  const { t, accounts, transactions, deleteAccount, deleteTransaction, totals, fmt } = useFinance()
  const [showAdd, setShowAdd] = useState(false)
  const [toDelete, setToDelete] = useState(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return transactions.filter(
      (tx) =>
        (filter === 'all' || tx.type === filter) &&
        (!q || tx.description.toLowerCase().includes(q) || t(`categories.${tx.category}`).toLowerCase().includes(q)),
    )
  }, [transactions, query, filter, t])

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">{t('walletTitle')}</h1>
          <p className="text-sm text-slate-400">
            {t('totalBalance')}: <span className="font-semibold text-brand-pale">{fmt(totals.balance)}</span>
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 rounded-xl bg-slate-900 p-1 ring-1 ring-slate-800">
        {['accounts', 'movements'].map((id) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`rounded-lg py-2 text-sm font-semibold transition ${tab === id ? 'bg-brand text-white shadow-brand' : 'text-slate-400 hover:text-slate-200'}`}
          >
            {t(id)}
          </button>
        ))}
      </div>

      {tab === 'accounts' ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {accounts.map((acc) => (
            <AccountCard key={acc.id} account={acc} onDelete={setToDelete} />
          ))}
          <button
            onClick={() => setShowAdd(true)}
            className="flex min-h-[148px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-700 text-slate-400 transition hover:border-brand hover:bg-brand/5 hover:text-brand-pale"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800">
              <Plus size={20} />
            </span>
            <span className="text-sm font-medium">{t('addAccount')}</span>
          </button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-[1fr_1.2fr] md:items-start">
          <section className="card p-4">
            <h2 className="section-title mb-4">{t('newMovement')}</h2>
            <TransactionForm />
          </section>

          <section className="card p-4">
            <h2 className="section-title mb-3">
              {t('allMovements')} <span className="text-slate-500">({filtered.length})</span>
            </h2>
            <div className="mb-3 flex gap-2">
              <div className="relative flex-1">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input className="input pl-9" placeholder={t('search')} value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <div className="relative">
                <ListFilter size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <select className="input w-32 pl-9" value={filter} onChange={(e) => setFilter(e.target.value)}>
                  <option value="all">{t('all')}</option>
                  <option value="income">{t('income')}</option>
                  <option value="expense">{t('expenses')}</option>
                </select>
              </div>
            </div>
            {filtered.length ? (
              <ul className="-mx-2 max-h-[60vh] divide-y divide-slate-800/60 overflow-y-auto no-scrollbar md:max-h-[70vh]">
                {filtered.map((tx) => (
                  <TransactionItem key={tx.id} tx={tx} onDelete={deleteTransaction} />
                ))}
              </ul>
            ) : (
              <EmptyState title={t('noTransactions')} hint={transactions.length ? null : t('noTransactionsHint')} />
            )}
          </section>
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title={t('newAccount')}>
        <AddAccountForm onDone={() => setShowAdd(false)} />
      </Modal>
      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => deleteAccount(toDelete.id)}
        title={`${t('deleteAccount')}: ${toDelete?.name ?? ''}`}
        message={t('deleteAccountConfirm')}
      />
    </div>
  )
}
