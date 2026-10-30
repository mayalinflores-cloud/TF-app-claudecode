import { useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, Check } from 'lucide-react'
import { CATEGORIES, CURRENCIES } from '../lib/constants'
import { todayISO, useFinance } from '../lib/FinanceContext'

export default function TransactionForm({ initialType = 'expense', onDone }) {
  const { t, accounts, addTransaction, fmt, usd, profile } = useFinance()
  const [type, setType] = useState(initialType)
  const [form, setForm] = useState({
    date: todayISO(),
    description: '',
    category: CATEGORIES[initialType][0].id,
    amount: '',
    currency: accounts[0]?.currency ?? profile.currency,
    accountId: accounts[0]?.id ?? '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const switchType = (next) => {
    setType(next)
    setForm((f) => ({ ...f, category: CATEGORIES[next][0].id }))
  }

  const onAccountChange = (e) => {
    const acc = accounts.find((a) => a.id === e.target.value)
    setForm((f) => ({ ...f, accountId: e.target.value, currency: acc?.currency ?? f.currency }))
  }

  const submit = (e) => {
    e.preventDefault()
    const amount = parseFloat(String(form.amount).replace(',', '.'))
    if (!form.description.trim() || !(amount > 0)) {
      setError(t('required'))
      return
    }
    addTransaction({ ...form, description: form.description.trim(), amount, type })
    setError('')
    setForm((f) => ({ ...f, description: '', amount: '' }))
    setSuccess(true)
    setTimeout(() => setSuccess(false), 1500)
    onDone?.()
  }

  const amountNum = parseFloat(String(form.amount).replace(',', '.')) || 0

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-800/60 p-1">
        {[
          { id: 'income', label: t('incomeOne'), icon: ArrowDownLeft, active: 'bg-emerald-500/90 text-white' },
          { id: 'expense', label: t('expense'), icon: ArrowUpRight, active: 'bg-rose-500/90 text-white' },
        ].map(({ id, label, icon: Icon, active }) => (
          <button
            key={id}
            type="button"
            onClick={() => switchType(id)}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition ${
              type === id ? active : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="tx-date">{t('date')}</label>
          <input id="tx-date" type="date" className="input" value={form.date} onChange={set('date')} required />
        </div>
        <div>
          <label className="label" htmlFor="tx-account">{t('account')}</label>
          <select id="tx-account" className="input" value={form.accountId} onChange={onAccountChange}>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="tx-desc">{t('description')}</label>
        <input
          id="tx-desc"
          className="input"
          placeholder={t('descriptionPh')}
          value={form.description}
          onChange={set('description')}
          maxLength={60}
        />
      </div>

      <div>
        <label className="label" htmlFor="tx-cat">{t('category')}</label>
        <select id="tx-cat" className="input" value={form.category} onChange={set('category')}>
          {CATEGORIES[type].map((c) => (
            <option key={c.id} value={c.id}>{t(`categories.${c.id}`)}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-3">
        <div>
          <label className="label" htmlFor="tx-amount">{t('amount')}</label>
          <input
            id="tx-amount"
            className="input text-base font-semibold"
            inputMode="decimal"
            placeholder="0.00"
            value={form.amount}
            onChange={set('amount')}
          />
        </div>
        <div>
          <label className="label" htmlFor="tx-cur">{t('currency')}</label>
          <select id="tx-cur" className="input w-28" value={form.currency} onChange={set('currency')}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {amountNum > 0 && form.currency !== 'USD' && (
        <p className="text-xs text-slate-400">
          {t('equivalent')} <span className="font-semibold text-brand-pale">{fmt(usd(amountNum, form.currency), 'USD')}</span>
        </p>
      )}
      {error && <p className="text-xs text-rose-400">{error}</p>}

      <button type="submit" className="btn-primary w-full py-3">
        {success ? <><Check size={18} /> {t('saved')}</> : t('save')}
      </button>
    </form>
  )
}
