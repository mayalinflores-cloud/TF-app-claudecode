import { Trash2 } from 'lucide-react'
import { getCategory } from '../lib/constants'
import { useFinance } from '../lib/FinanceContext'

export default function TransactionItem({ tx, onDelete }) {
  const { t, fmt, fmtRaw, accounts, profile } = useFinance()
  const cat = getCategory(tx.category)
  const Icon = cat.icon
  const isIncome = tx.type === 'income'
  const account = accounts.find((a) => a.id === tx.accountId)
  const date = new Date(`${tx.date}T00:00:00`).toLocaleDateString(profile.lang === 'es' ? 'es-VE' : 'en-US', {
    day: '2-digit',
    month: 'short',
  })
  const showEquivalent = tx.currency !== profile.currency

  return (
    <li className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-slate-800/50">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${cat.color}22`, color: cat.color }}
      >
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-100">{tx.description}</p>
        <p className="truncate text-xs text-slate-500">
          {t(`categories.${tx.category}`)} · {date}
          {account ? ` · ${account.name}` : ''}
        </p>
      </div>
      <div className="text-right">
        <p className={`text-sm font-semibold ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isIncome ? '+' : '-'}
          {fmtRaw(tx.amount, tx.currency)}
        </p>
        {showEquivalent && <p className="text-[11px] text-slate-500">≈ {fmt(tx.usd)}</p>}
      </div>
      {onDelete && (
        <button
          onClick={() => onDelete(tx.id)}
          className="rounded-lg p-1.5 text-slate-600 transition hover:bg-rose-500/10 hover:text-rose-400 md:opacity-0 md:group-hover:opacity-100"
          aria-label={t('delete')}
        >
          <Trash2 size={16} />
        </button>
      )}
    </li>
  )
}
