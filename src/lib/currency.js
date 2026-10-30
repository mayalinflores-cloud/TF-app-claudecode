import { CURRENCY_SYMBOLS } from './constants'

// rates = { USD, EUR, USDT } expresadas en Bs por unidad
const bsPerUnit = (currency, rates) => {
  if (currency === 'Bs') return 1
  const r = Number(rates[currency])
  return r > 0 ? r : 1
}

export const toUSD = (amount, currency, rates) => {
  if (currency === 'USD') return Number(amount) || 0
  return ((Number(amount) || 0) * bsPerUnit(currency, rates)) / bsPerUnit('USD', rates)
}

export const fromUSD = (usd, currency, rates) => {
  if (currency === 'USD') return usd
  return (usd * bsPerUnit('USD', rates)) / bsPerUnit(currency, rates)
}

export const formatMoney = (amount, currency, locale = 'es') => {
  const n = Number(amount) || 0
  const formatted = Math.abs(n).toLocaleString(locale === 'es' ? 'es-VE' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const sign = n < 0 ? '-' : ''
  if (currency === 'USDT') return `${sign}${formatted} USDT`
  if (currency === 'Bs') return `${sign}Bs ${formatted}`
  return `${sign}${CURRENCY_SYMBOLS[currency] ?? ''}${formatted}`
}

export const formatCompact = (amount, currency) => {
  const n = Number(amount) || 0
  const abs = Math.abs(n)
  const s = abs >= 1e6 ? `${(abs / 1e6).toFixed(1)}M` : abs >= 1e3 ? `${(abs / 1e3).toFixed(1)}k` : abs.toFixed(0)
  const sym = currency === 'USDT' ? '₮' : currency === 'Bs' ? 'Bs ' : CURRENCY_SYMBOLS[currency]
  return `${n < 0 ? '-' : ''}${sym}${s}`
}
