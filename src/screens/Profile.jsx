import { useState } from 'react'
import { Check, Globe, HardDrive, Pencil, ShieldAlert, Trash2, Coins, ArrowLeftRight } from 'lucide-react'
import { CURRENCIES } from '../lib/constants'
import { useFinance } from '../lib/FinanceContext'
import RatesEditor from '../components/RatesEditor'

export default function Profile({ onClearAll }) {
  const { profile, updateProfile, t, transactions, accounts } = useFinance()
  const [name, setName] = useState(profile.name)
  const [editing, setEditing] = useState(false)

  const saveName = (e) => {
    e.preventDefault()
    if (name.trim()) updateProfile({ name: name.trim() })
    setEditing(false)
  }

  const initials = profile.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-white">{t('profileTitle')}</h1>

      <div className="grid gap-5 md:grid-cols-2 md:items-start">
        <div className="space-y-5">
          {/* Nombre */}
          <section className="card flex items-center gap-4 p-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-light to-brand-dark text-xl font-bold text-white shadow-brand">
              {initials || 'TF'}
            </div>
            {editing ? (
              <form onSubmit={saveName} className="flex flex-1 gap-2">
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoFocus aria-label={t('name')} />
                <button type="submit" className="btn-primary px-3" aria-label={t('save')}>
                  <Check size={18} />
                </button>
              </form>
            ) : (
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">{t('name')}</p>
                <div className="flex items-center gap-2">
                  <p className="truncate text-lg font-semibold text-white">{profile.name}</p>
                  <button onClick={() => {
                      setName(profile.name)
                      setEditing(true)
                    }} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-brand-pale" aria-label="Editar">
                    <Pencil size={15} />
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  {transactions.length} {t('stats.movements').toLowerCase()} · {accounts.length} {t('stats.accounts').toLowerCase()}
                </p>
              </div>
            )}
          </section>

          {/* Preferencias */}
          <section className="card p-4">
            <h2 className="section-title mb-4">{t('preferences')}</h2>
            <div className="space-y-4">
              <div>
                <p className="label flex items-center gap-1.5"><Globe size={13} /> {t('language')}</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'es', label: 'Español' },
                    { id: 'en', label: 'English' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      onClick={() => updateProfile({ lang: l.id })}
                      className={`rounded-xl border py-2.5 text-sm font-medium transition ${
                        profile.lang === l.id ? 'border-brand bg-brand/15 text-brand-pale' : 'border-slate-700 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="label flex items-center gap-1.5"><Coins size={13} /> {t('mainCurrency')}</p>
                <div className="grid grid-cols-4 gap-2">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => updateProfile({ currency: c })}
                      className={`rounded-xl border py-2.5 text-sm font-medium transition ${
                        profile.currency === c ? 'border-brand bg-brand/15 text-brand-pale' : 'border-slate-700 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-5">
          {/* Tasas */}
          <section className="card p-4">
            <h2 className="section-title mb-3 flex items-center gap-2">
              <ArrowLeftRight size={15} className="text-brand-pale" /> {t('exchangeRates')}
            </h2>
            <RatesEditor />
          </section>

          {/* Zona de riesgo */}
          <section className="rounded-2xl border border-red-500/30 bg-red-500/5 p-4">
            <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-red-400">
              <ShieldAlert size={16} /> {t('dangerZone')}
            </h2>
            <p className="mb-4 text-xs text-slate-400">{t('dangerHint')}</p>
            <button
              onClick={onClearAll}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/50 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-600 hover:text-white"
            >
              <Trash2 size={16} /> {t('clearAll')}
            </button>
          </section>

          <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-600">
            <HardDrive size={12} /> {t('storageNote')} · TF Finance v1.0
          </p>
        </div>
      </div>
    </div>
  )
}
