import { Inbox } from 'lucide-react'

export default function EmptyState({ title, hint, icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-slate-500">
        <Icon size={22} />
      </div>
      <p className="text-sm font-medium text-slate-300">{title}</p>
      {hint && <p className="mt-1 max-w-[16rem] text-xs text-slate-500">{hint}</p>}
    </div>
  )
}
