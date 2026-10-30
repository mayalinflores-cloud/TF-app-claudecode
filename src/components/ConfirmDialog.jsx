import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'
import { useFinance } from '../lib/FinanceContext'

export default function ConfirmDialog({ open, onClose, onConfirm, title, message }) {
  const { t } = useFinance()
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="flex gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
        <AlertTriangle className="shrink-0 text-red-400" size={22} />
        <p className="text-sm text-red-100">{message}</p>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button className="btn-ghost" onClick={onClose}>
          {t('cancel')}
        </button>
        <button
          className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500"
          onClick={() => {
            onConfirm()
            onClose()
          }}
        >
          {t('confirm')}
        </button>
      </div>
    </Modal>
  )
}
