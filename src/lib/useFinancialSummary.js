import { useMemo } from 'react'
import { useFinance } from './FinanceContext'
import { translate } from './i18n'

// Resumen para Boti construido con los valores que ya calcula FinanceContext
export function useFinancialSummary() {
  const { totals, transactions, accounts, accountBalances, profile, rates, fmt } = useFinance()

  return useMemo(() => {
    const es = (key) => translate('es', key)

    const byCategory = {}
    for (const tx of transactions) {
      if (tx.type === 'expense') byCategory[tx.category] = (byCategory[tx.category] ?? 0) + tx.usd
    }
    const topCategories = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, usd]) => ({
        categoria: es(`categories.${id}`),
        monto: fmt(usd),
        porcentaje: totals.expense ? `${Math.round((usd / totals.expense) * 100)}%` : '0%',
      }))

    // La app no tiene un módulo de deudas: se consideran deudas las cuentas con saldo negativo
    const debts = accounts
      .filter((acc) => (accountBalances[acc.id] ?? 0) < 0)
      .map((acc) => ({ cuenta: acc.name, saldo: fmt(accountBalances[acc.id]) }))

    return {
      moneda_principal: profile.currency,
      saldo_total: fmt(totals.balance),
      ingresos_totales: fmt(totals.income),
      gastos_totales: fmt(totals.expense),
      ingresos_este_mes: fmt(totals.monthIncome),
      gastos_este_mes: fmt(totals.monthExpense),
      cantidad_movimientos: transactions.length,
      principales_categorias_gasto: topCategories.length ? topCategories : 'Sin gastos registrados',
      deudas_pendientes: debts.length ? debts : 'Ninguna (no hay cuentas con saldo negativo)',
      cuentas: accounts.map((acc) => ({
        nombre: acc.name,
        moneda: acc.currency,
        saldo: fmt(accountBalances[acc.id] ?? 0),
      })),
      tasas_en_bs: { USD: rates.USD, EUR: rates.EUR, USDT: rates.USDT },
    }
  }, [totals, transactions, accounts, accountBalances, profile.currency, rates, fmt])
}
