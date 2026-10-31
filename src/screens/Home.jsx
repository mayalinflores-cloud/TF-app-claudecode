import { ArrowDownLeft, ArrowUpRight, Bot, Eraser, Eye, EyeOff, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { useFinance } from '../lib/FinanceContext'
import TransactionItem from '../components/TransactionItem'
import CategoryBars from '../components/CategoryBars'
import EmptyState from '../components/EmptyState'

export default function Home({ onAdd, onRates, onClear, onSeeAll, onBoti }) {
  const { profile, totals, transactions, t, fmt, rates } = useFinance()
  const [hidden, setHidden] = useState(false)
  const recent = transactions.slice(0, 5)
  const mask = (s) => (hidden ? '••••••' : s)

  const quick = [
    { label: t('incomeOne'), icon: ArrowDownLeft, onClick: () => onAdd('income'), cls: 'bg-emerald-500/15 text-emerald-400' },
    { label: t('expense'), icon: ArrowUpRight, onClick: () => onAdd('expense'), cls: 'bg-rose-500/15 text-rose-400' },
    { label: t('rates'), icon: RefreshCw, onClick: onRates, cls: 'bg-brand/15 text-brand-pale' },
    { label: t('clear'), icon: Eraser, onClick: onClear, cls: 'bg-slate-500/15 text-slate-300' },
  ]

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{t('greeting')},</p>
          <h1 className="text-xl font-bold text-white">{profile.name} 👋</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onBoti}
            className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/80 text-brand-pale transition hover:border-brand hover:text-white"
            aria-label="Abrir Boti, tu asistente financiero"
            title="Boti — Tu Asistente Financiero"
          >
            <Bot size={20} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-light ring-2 ring-slate-900" />
          </button>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-light to-brand-dark text-sm font-extrabold text-white shadow-brand">
            TF
          </div>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
        {/* Tarjeta de saldo total */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-light via-brand to-brand-dark p-5 shadow-brand">
          <div className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-brand-pale/20 blur-2xl" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-blue-100">{t('totalBalance')}</p>
              <button onClick={() => setHidden((h) => !h)} className="rounded-full p-1.5 text-blue-100 hover:bg-white/10" aria-label="toggle">
                {hidden ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="mt-1 text-3xl font-extrabold tracking-tight text-white md:text-4xl">{mask(fmt(totals.balance))}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-medium text-blue-50">
              {['USD', 'EUR', 'Bs', 'USDT']
                .filter((c) => c !== profile.currency)
                .map((c) => (
                  <span key={c} className="rounded-full bg-white/15 px-2.5 py-1 backdrop-blur">
                    {mask(fmt(totals.balance, c))}
                  </span>
                ))}
            </div>
            <p className="mt-3 text-[11px] text-blue-100/80">1 USD = Bs {rates.USD}</p>
          </div>
        </section>

        {/* Ingresos y gastos */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
          <div className="card p-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                <TrendingUp size={15} />
              </span>
              {t('income')}
            </div>
            <p className="mt-2 text-lg font-bold text-white">{mask(fmt(totals.income))}</p>
            <p className="text-[11px] text-slate-500">
              {t('thisMonth')}: <span className="text-emerald-400">{mask(fmt(totals.monthIncome))}</span>
            </p>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/15 text-rose-400">
                <TrendingDown size={15} />
              </span>
              {t('expenses')}
            </div>
            <p className="mt-2 text-lg font-bold text-white">{mask(fmt(totals.expense))}</p>
            <p className="text-[11px] text-slate-500">
              {t('thisMonth')}: <span className="text-rose-400">{mask(fmt(totals.monthExpense))}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <section>
        <h2 className="section-title mb-3">{t('quickActions')}</h2>
        <div className="grid grid-cols-4 gap-3">
          {quick.map(({ label, icon: Icon, onClick, cls }) => (
            <button key={label} onClick={onClick} className="card flex flex-col items-center gap-2 py-3.5 transition hover:border-slate-700 hover:bg-slate-800/70 active:scale-95">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${cls}`}>
                <Icon size={19} />
              </span>
              <span className="text-xs font-medium text-slate-300">{label}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        <section className="card p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="section-title">{t('recent')}</h2>
            {transactions.length > 0 && (
              <button onClick={onSeeAll} className="text-xs font-medium text-brand-pale hover:text-white">
                {t('seeAll')}
              </button>
            )}
          </div>
          {recent.length ? (
            <ul className="-mx-2">
              {recent.map((tx) => (
                <TransactionItem key={tx.id} tx={tx} />
              ))}
            </ul>
          ) : (
            <EmptyState title={t('noTransactions')} hint={t('noTransactionsHint')} />
          )}
        </section>

        <section className="card p-4">
          <h2 className="section-title mb-4">{t('byCategory')}</h2>
          <CategoryBars type="expense" limit={6} />
        </section>
      </div>
    </div>
  )
}
