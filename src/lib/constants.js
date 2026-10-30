import {
  Banknote,
  Briefcase,
  Bus,
  Car,
  Coffee,
  CreditCard,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  Landmark,
  Laptop,
  MoreHorizontal,
  Receipt,
  ShoppingBag,
  TrendingUp,
  Tv,
  UtensilsCrossed,
  Wallet,
  Bitcoin,
  Store,
} from 'lucide-react'

export const CURRENCIES = ['USD', 'EUR', 'Bs', 'USDT']

export const CURRENCY_SYMBOLS = { USD: '$', EUR: '€', Bs: 'Bs', USDT: '₮' }

// Tasas por defecto: cuántos Bs equivalen a 1 unidad de cada moneda
export const DEFAULT_RATES = { USD: 40, EUR: 43.5, USDT: 40.8 }

export const CATEGORIES = {
  income: [
    { id: 'salary', color: '#22c55e', icon: Briefcase },
    { id: 'freelance', color: '#3D7FFF', icon: Laptop },
    { id: 'investments', color: '#a855f7', icon: TrendingUp },
    { id: 'sales', color: '#f59e0b', icon: Store },
    { id: 'gifts', color: '#ec4899', icon: Gift },
    { id: 'otherIncome', color: '#64748b', icon: MoreHorizontal },
  ],
  expense: [
    { id: 'food', color: '#f97316', icon: UtensilsCrossed },
    { id: 'transport', color: '#06b6d4', icon: Bus },
    { id: 'housing', color: '#0057FF', icon: Home },
    { id: 'utilities', color: '#eab308', icon: Receipt },
    { id: 'health', color: '#ef4444', icon: HeartPulse },
    { id: 'entertainment', color: '#a855f7', icon: Tv },
    { id: 'shopping', color: '#ec4899', icon: ShoppingBag },
    { id: 'education', color: '#14b8a6', icon: GraduationCap },
    { id: 'coffee', color: '#a16207', icon: Coffee },
    { id: 'car', color: '#7AABFF', icon: Car },
    { id: 'otherExpense', color: '#64748b', icon: MoreHorizontal },
  ],
}

export const ALL_CATEGORIES = [...CATEGORIES.income, ...CATEGORIES.expense]

export const getCategory = (id) =>
  ALL_CATEGORIES.find((c) => c.id === id) ?? { id, color: '#64748b', icon: MoreHorizontal }

export const ACCOUNT_TYPES = {
  cash: { icon: Banknote, gradient: 'from-emerald-500 to-emerald-700' },
  bank: { icon: Landmark, gradient: 'from-brand to-brand-dark' },
  crypto: { icon: Bitcoin, gradient: 'from-amber-400 to-amber-600' },
  wallet: { icon: Wallet, gradient: 'from-sky-500 to-indigo-600' },
  card: { icon: CreditCard, gradient: 'from-fuchsia-500 to-purple-700' },
}

export const DEFAULT_ACCOUNTS = [
  { id: 'acc-cash', name: 'Efectivo', type: 'cash', currency: 'USD', initial: 0 },
  { id: 'acc-bank', name: 'Banco', type: 'bank', currency: 'Bs', initial: 0 },
  { id: 'acc-binance', name: 'Binance', type: 'crypto', currency: 'USDT', initial: 0 },
  { id: 'acc-paypal', name: 'PayPal', type: 'wallet', currency: 'USD', initial: 0 },
]
