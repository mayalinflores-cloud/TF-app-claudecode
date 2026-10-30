import { useCallback, useState } from 'react'
import { useFinance } from './lib/FinanceContext'
import BottomNav from './components/BottomNav'
import Modal from './components/Modal'
import ConfirmDialog from './components/ConfirmDialog'
import TransactionForm from './components/TransactionForm'
import RatesEditor from './components/RatesEditor'
import Home from './screens/Home'
import Stats from './screens/Stats'
import Wallet from './screens/Wallet'
import Profile from './screens/Profile'

export default function App() {
  const { t, clearTransactions, resetAll } = useFinance()
  const [tab, setTab] = useState('home')
  const [walletTab, setWalletTab] = useState('accounts')
  const [txModal, setTxModal] = useState(null) // 'income' | 'expense' | null
  const [ratesOpen, setRatesOpen] = useState(false)
  const [confirm, setConfirm] = useState(null) // 'movements' | 'all' | null

  const go = (next) => {
    setTab(next)
    window.scrollTo({ top: 0 })
  }
  const closeTx = useCallback(() => setTxModal(null), [])
  const closeRates = useCallback(() => setRatesOpen(false), [])
  const closeConfirm = useCallback(() => setConfirm(null), [])

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-72 bg-gradient-to-b from-brand/10 to-transparent" />
      <main className="relative mx-auto max-w-md px-4 pb-32 pt-6 md:max-w-3xl md:px-6 md:pt-10">
        {tab === 'home' && (
          <Home
            onAdd={setTxModal}
            onRates={() => setRatesOpen(true)}
            onClear={() => setConfirm('movements')}
            onSeeAll={() => {
              setWalletTab('movements')
              go('wallet')
            }}
          />
        )}
        {tab === 'stats' && <Stats />}
        {tab === 'wallet' && <Wallet tab={walletTab} onTabChange={setWalletTab} />}
        {tab === 'profile' && <Profile onClearAll={() => setConfirm('all')} />}
      </main>

      <BottomNav active={tab} onChange={go} onAdd={() => setTxModal('expense')} />

      <Modal open={!!txModal} onClose={closeTx} title={t('newMovement')}>
        {txModal && <TransactionForm key={txModal} initialType={txModal} onDone={closeTx} />}
      </Modal>

      <Modal open={ratesOpen} onClose={closeRates} title={t('exchangeRates')}>
        <RatesEditor onSaved={closeRates} />
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        onClose={closeConfirm}
        onConfirm={confirm === 'all' ? resetAll : clearTransactions}
        title={confirm === 'all' ? t('clearAll') : t('clearMovements')}
        message={confirm === 'all' ? t('clearAllConfirm') : t('clearMovementsConfirm')}
      />
    </div>
  )
}
