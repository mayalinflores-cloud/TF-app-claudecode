import { useEffect, useRef, useState } from 'react'
import { AlertCircle, ArrowLeft, Bot, SendHorizontal, Sparkles } from 'lucide-react'
import { useFinance } from '../lib/FinanceContext'
import { useFinancialSummary } from '../lib/useFinancialSummary'
import { estimateCost, formatUsd } from '../lib/pricing'
import BotiMarkdown from './BotiMarkdown'

const uid = () => Math.random().toString(36).slice(2, 10)

const WELCOME =
  '¡Hola! Soy **Boti**, tu asistente financiero de TF Finance. 👋\n\nPuedo ayudarte a entender tus gastos, revisar tus cuentas o darte ideas para ahorrar. ¿Qué te gustaría saber?'

const SUGGESTIONS = [
  '¿Cómo van mis finanzas este mes?',
  '¿En qué categoría gasto más?',
  'Hazme una tabla con el saldo de mis cuentas',
  'Dame 3 consejos para ahorrar',
]

function BotiAvatar({ size = 'h-8 w-8' }) {
  return (
    <div className={`flex ${size} shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-light to-brand-dark text-white shadow-brand`}>
      <Bot size={17} />
    </div>
  )
}

function UserAvatar({ name }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-700 text-[11px] font-bold text-slate-100">
      {initials || 'TU'}
    </div>
  )
}

function Message({ message, userName }) {
  if (message.role === 'user') {
    return (
      <div className="flex items-end justify-end gap-2">
        <div className="max-w-[80%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-brand px-4 py-2.5 text-sm text-white shadow-brand">
          {message.content}
        </div>
        <UserAvatar name={userName} />
      </div>
    )
  }

  return (
    <div className="flex items-start gap-2">
      <BotiAvatar />
      <div className="min-w-0 max-w-[85%]">
        <div
          className={`rounded-2xl rounded-tl-md border px-4 py-2.5 ${
            message.error ? 'border-red-500/40 bg-red-500/10' : 'border-slate-800 bg-slate-900'
          }`}
        >
          {message.error ? (
            <p className="flex gap-2 text-sm text-red-200">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
              {message.content}
            </p>
          ) : (
            <BotiMarkdown>{message.content}</BotiMarkdown>
          )}
          {message.truncated && (
            <p className="mt-2 text-[11px] text-amber-300">La respuesta se cortó por su longitud. Pide que continúe.</p>
          )}
        </div>
        {message.usage && (
          <p className="mt-1 pl-1 text-[11px] text-slate-500">
            {(message.usage.input_tokens + message.usage.output_tokens).toLocaleString('es-VE')} tokens · {formatUsd(message.cost)}
          </p>
        )}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2" role="status" aria-live="polite">
      <BotiAvatar />
      <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-slate-800 bg-slate-900 px-4 py-3">
        <span className="flex gap-1">
          {[0, 150, 300].map((delay) => (
            <span key={delay} className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-light" style={{ animationDelay: `${delay}ms` }} />
          ))}
        </span>
        <span className="text-xs text-slate-400">Escribiendo...</span>
      </div>
    </div>
  )
}

export default function Boti({ onClose }) {
  const { profile } = useFinance()
  const summary = useFinancialSummary()
  // El historial vive solo en memoria: se reinicia cada vez que se abre Boti
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)
  const abortRef = useRef(null)

  const sessionCost = messages.reduce((sum, m) => sum + (m.cost ?? 0), 0)
  const canSend = input.trim().length > 0 && !loading

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
      abortRef.current?.abort()
    }
  }, [onClose])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  // Ajusta la altura del textarea al contenido (máx. ~5 líneas)
  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`
  }, [input])

  const send = async (text) => {
    const content = (text ?? input).trim()
    if (!content || loading) return

    const userMessage = { id: uid(), role: 'user', content }
    const history = [...messages.filter((m) => !m.error), userMessage].map(({ role, content: c }) => ({ role, content: c }))
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    const controller = new AbortController()
    abortRef.current = controller
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, summary }),
        signal: controller.signal,
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.reply) {
        throw new Error(data?.error || `El servidor respondió con un error (${res.status}).`)
      }
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: 'assistant',
          content: data.reply,
          usage: data.usage,
          truncated: data.truncated,
          cost: estimateCost(data.model, data.usage),
        },
      ])
    } catch (error) {
      if (error.name === 'AbortError') return
      const content =
        error instanceof TypeError ? 'No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.' : error.message
      setMessages((prev) => [...prev, { id: uid(), role: 'assistant', content, error: true }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const onSubmit = (e) => {
    e.preventDefault()
    send()
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex h-[100dvh] flex-col bg-slate-950" role="dialog" aria-modal="true" aria-label="Boti — Tu Asistente Financiero">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-brand/15 to-transparent" />

      <header className="relative border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3 md:max-w-3xl md:px-6">
          <button
            onClick={onClose}
            className="flex items-center gap-1 rounded-xl py-1.5 pl-1 pr-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
            aria-label="Volver a Inicio"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Inicio</span>
          </button>
          <BotiAvatar size="h-10 w-10" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-bold text-white">Boti</h1>
            <p className="truncate text-xs text-slate-400">Tu Asistente Financiero</p>
          </div>
          <div className="text-right" title="Costo estimado de esta sesión">
            <p className="text-[10px] uppercase tracking-wide text-slate-500">Sesión</p>
            <p className="text-sm font-semibold text-brand-pale" data-testid="session-cost">{formatUsd(sessionCost)}</p>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="relative flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto flex max-w-md flex-col gap-4 px-4 py-5 md:max-w-3xl md:px-6">
          <Message message={{ role: 'assistant', content: WELCOME }} userName={profile.name} />

          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2 pl-10">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-300 transition hover:border-brand hover:text-white"
                >
                  <Sparkles size={12} className="text-brand-pale" />
                  {s}
                </button>
              ))}
            </div>
          )}

          {messages.map((m) => (
            <Message key={m.id} message={m} userName={profile.name} />
          ))}
          {loading && <TypingIndicator />}
        </div>
      </div>

      <footer className="relative border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
        <form onSubmit={onSubmit} className="mx-auto flex max-w-md items-end gap-2 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 md:max-w-3xl md:px-6">
          <label htmlFor="boti-input" className="sr-only">Escribe tu pregunta para Boti</label>
          <textarea
            id="boti-input"
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Pregúntale algo a Boti…"
            maxLength={2000}
            autoFocus
            className="input max-h-32 min-h-[44px] flex-1 resize-none py-2.5 leading-5"
          />
          <button
            type="submit"
            disabled={!canSend}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-white shadow-brand transition hover:bg-brand-light active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none"
            aria-label="Enviar mensaje"
          >
            <SendHorizontal size={19} />
          </button>
        </form>
      </footer>
    </div>
  )
}
