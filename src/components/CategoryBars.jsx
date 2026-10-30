import { PieChart } from 'lucide-react'
import { getCategory } from '../lib/constants'
import { useFinance } from '../lib/FinanceContext'
import EmptyState from './EmptyState'

export default function CategoryBars({ type = 'expense', limit }) {
  const { transactions, t, fmt } = useFinance()
  const totals = {}
  for (const tx of transactions) {
    if (tx.type !== type) continue
    totals[tx.category] = (totals[tx.category] ?? 0) + tx.usd
  }
  const sum = Object.values(totals).reduce((s, v) => s + v, 0)
  let rows = Object.entries(totals).sort((a, b) => b[1] - a[1])
  if (limit) rows = rows.slice(0, limit)

  if (!rows.length) return <EmptyState title={t(type === 'expense' ? 'noExpenses' : 'noTransactions')} icon={PieChart} />

  return (
    <ul className="space-y-3.5">
      {rows.map(([id, value]) => {
        const cat = getCategory(id)
        const Icon = cat.icon
        const pct = sum ? (value / sum) * 100 : 0
        return (
          <li key={id}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-300">
                <Icon size={14} style={{ color: cat.color }} />
                {t(`categories.${id}`)}
              </span>
              <span className="font-medium text-slate-100">
                {fmt(value)} <span className="ml-1 text-xs text-slate-500">{pct.toFixed(0)}%</span>
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
