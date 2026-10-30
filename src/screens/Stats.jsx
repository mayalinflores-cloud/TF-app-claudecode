import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { PiggyBank, Scale, CalendarRange, BarChart3 } from 'lucide-react'
import { getCategory } from '../lib/constants'
import { formatCompact } from '../lib/currency'
import { todayISO, useFinance } from '../lib/FinanceContext'
import EmptyState from '../components/EmptyState'
import CategoryBars from '../components/CategoryBars'

const ChartTooltip = ({ active, payload, label, fmt }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/95 px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 font-semibold text-slate-200">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-2 text-slate-300">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.payload?.color ?? p.color }} />
          {p.name}: <span className="font-semibold text-white">{fmt(p.value)}</span>
        </p>
      ))}
    </div>
  )
}

export default function Stats() {
  const { transactions, t, fmt, convert, profile } = useFinance()
  const [catType, setCatType] = useState('expense')
  const locale = profile.lang === 'es' ? 'es-VE' : 'en-US'
  // Los gráficos trabajan en USD internamente; los ejes y tooltips se muestran en la moneda principal
  const fmtAxis = (v) => formatCompact(convert(v, profile.currency), profile.currency)

  const monthly = useMemo(() => {
    const now = new Date(`${todayISO()}T00:00:00`)
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      months.push({ key, label: d.toLocaleDateString(locale, { month: 'short' }).replace('.', ''), income: 0, expense: 0 })
    }
    for (const tx of transactions) {
      const m = months.find((x) => x.key === tx.date.slice(0, 7))
      if (m) m[tx.type] += tx.usd
    }
    return months.map((m) => ({ ...m, net: m.income - m.expense }))
  }, [transactions, locale])

  const categoryData = useMemo(() => {
    const totals = {}
    for (const tx of transactions) if (tx.type === catType) totals[tx.category] = (totals[tx.category] ?? 0) + tx.usd
    return Object.entries(totals)
      .map(([id, value]) => ({ id, name: t(`categories.${id}`), value, color: getCategory(id).color }))
      .sort((a, b) => b.value - a.value)
  }, [transactions, catType, t])

  const income6 = monthly.reduce((s, m) => s + m.income, 0)
  const expense6 = monthly.reduce((s, m) => s + m.expense, 0)
  const savingsRate = income6 > 0 ? ((income6 - expense6) / income6) * 100 : 0

  const kpis = [
    { label: t('net'), value: fmt(income6 - expense6), icon: Scale, cls: income6 - expense6 >= 0 ? 'text-emerald-400' : 'text-rose-400' },
    { label: t('savingsRate'), value: `${savingsRate.toFixed(0)}%`, icon: PiggyBank, cls: 'text-brand-pale' },
    { label: t('avgMonthly'), value: fmt(expense6 / 6), icon: CalendarRange, cls: 'text-amber-400', sub: t('expenses') },
  ]

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-bold text-white">{t('statsTitle')}</h1>
        <p className="text-sm text-slate-400">{t('last6')}</p>
      </header>

      <div className="grid grid-cols-3 gap-3">
        {kpis.map(({ label, value, icon: Icon, cls, sub }) => (
          <div key={label} className="card p-3">
            <Icon size={16} className={cls} />
            <p className="mt-2 truncate text-sm font-bold text-white md:text-base">{value}</p>
            <p className="truncate text-[11px] text-slate-500">
              {label}
              {sub ? ` · ${sub}` : ''}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <section className="card p-4">
          <h2 className="section-title">{t('monthlyRevenue')}</h2>
          <p className="mb-4 text-xs text-slate-500">
            {t('income')} vs {t('expenses').toLowerCase()} · {profile.currency}
          </p>
          {transactions.length ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly} barGap={4} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmtAxis} width={52} />
                  <Tooltip cursor={{ fill: '#1e293b80' }} content={<ChartTooltip fmt={fmt} />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                  <Bar dataKey="income" name={t('income')} fill="#3D7FFF" radius={[6, 6, 0, 0]} maxBarSize={22} />
                  <Bar dataKey="expense" name={t('expenses')} fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title={t('noTransactions')} hint={t('noTransactionsHint')} icon={BarChart3} />
          )}
        </section>

        <section className="card p-4">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <h2 className="section-title">{t('categoryBreakdown')}</h2>
              <p className="text-xs text-slate-500">{profile.currency}</p>
            </div>
            <div className="flex rounded-lg bg-slate-800/70 p-0.5 text-xs">
              {['expense', 'income'].map((ty) => (
                <button
                  key={ty}
                  onClick={() => setCatType(ty)}
                  className={`rounded-md px-2.5 py-1 font-medium transition ${catType === ty ? 'bg-brand text-white' : 'text-slate-400'}`}
                >
                  {ty === 'expense' ? t('expenses') : t('income')}
                </button>
              ))}
            </div>
          </div>
          {categoryData.length ? (
            <div style={{ height: Math.max(160, categoryData.length * 38) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmtAxis} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#cbd5e1', fontSize: 11 }} axisLine={false} tickLine={false} width={96} />
                  <Tooltip cursor={{ fill: '#1e293b80' }} content={<ChartTooltip fmt={fmt} />} />
                  <Bar dataKey="value" name={t('amount')} radius={[0, 6, 6, 0]} maxBarSize={20}>
                    {categoryData.map((d) => (
                      <Cell key={d.id} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState title={t('noTransactions')} icon={BarChart3} />
          )}
        </section>
      </div>

      {categoryData.length > 0 && (
        <section className="card p-4">
          <h2 className="section-title mb-4">{catType === 'expense' ? t('byCategory') : t('income')}</h2>
          <CategoryBars type={catType} />
        </section>
      )}
    </div>
  )
}
