import { useState } from 'react'
import { Check, DollarSign, Euro, Coins } from 'lucide-react'
import { useFinance } from '../lib/FinanceContext'

const FIELDS = [
  { key: 'USD', icon: DollarSign, color: 'text-emerald-400' },
  { key: 'EUR', icon: Euro, color: 'text-sky-400' },
  { key: 'USDT', icon: Coins, color: 'text-amber-400' },
]

export default function RatesEditor({ onSaved }) {
  const { rates, updateRates, t } = useFinance()
  const [draft, setDraft] = useState(() => ({ ...rates }))
  const [saved, setSaved] = useState(false)

  const save = (e) => {
    e.preventDefault()
    const next = {}
    for (const { key } of FIELDS) {
      const n = parseFloat(String(draft[key]).replace(',', '.'))
      next[key] = n > 0 ? n : rates[key]
    }
    updateRates(next)
    setDraft(next)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
    onSaved?.()
  }

  return (
    <form onSubmit={save} className="space-y-3">
      <p className="text-xs text-slate-400">{t('ratesHint')}</p>
      {FIELDS.map(({ key, icon: Icon, color }) => (
        <div key={key} className="flex items-center gap-3 rounded-xl bg-slate-800/50 p-2 pl-3">
          <Icon size={18} className={color} />
          <span className="w-24 text-sm font-medium text-slate-200">1 {key} =</span>
          <div className="relative flex-1">
            <input
              className="input pr-10 text-right font-semibold"
              inputMode="decimal"
              value={draft[key]}
              onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
              aria-label={`${key} en Bs`}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">Bs</span>
          </div>
        </div>
      ))}
      <button type="submit" className="btn-primary w-full">
        {saved ? <><Check size={16} /> {t('ratesSaved')}</> : t('save')}
      </button>
    </form>
  )
}
