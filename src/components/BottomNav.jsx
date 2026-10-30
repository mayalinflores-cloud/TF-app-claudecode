import { BarChart3, Home, Plus, User, Wallet } from 'lucide-react'
import { useFinance } from '../lib/FinanceContext'

const TABS = [
  { id: 'home', icon: Home },
  { id: 'stats', icon: BarChart3 },
  null,
  { id: 'wallet', icon: Wallet },
  { id: 'profile', icon: User },
]

export default function BottomNav({ active, onChange, onAdd }) {
  const { t } = useFinance()
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-md px-3 pb-3 md:max-w-3xl">
        <div className="relative grid grid-cols-5 items-center rounded-2xl border border-slate-800 bg-slate-900/90 px-2 py-2 shadow-2xl backdrop-blur-xl">
          {TABS.map((tab, i) =>
            tab ? (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`flex flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-medium transition ${
                  active === tab.id ? 'text-brand-pale' : 'text-slate-500 hover:text-slate-300'
                }`}
                aria-current={active === tab.id ? 'page' : undefined}
              >
                <tab.icon size={21} strokeWidth={active === tab.id ? 2.4 : 2} />
                {t(`nav.${tab.id}`)}
                <span className={`h-1 w-1 rounded-full ${active === tab.id ? 'bg-brand-light' : 'bg-transparent'}`} />
              </button>
            ) : (
              <div key={`fab-${i}`} className="flex justify-center">
                <button
                  onClick={onAdd}
                  className="-mt-9 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-light to-brand-dark text-white shadow-brand ring-4 ring-slate-950 transition hover:scale-105 active:scale-95"
                  aria-label={t('newMovement')}
                >
                  <Plus size={28} strokeWidth={2.5} />
                </button>
              </div>
            ),
          )}
        </div>
      </div>
    </nav>
  )
}
