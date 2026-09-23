import type { LocaleCode } from '@vcc/types'

const CURRENCY_NAMES: Record<string, string> = {
  CNY: '人民币',
  JPY: '日元',
  KRW: '韩元',
  EUR: '欧元',
  USD: '美元'
}

export function currencyName (currency: string): string {
  return CURRENCY_NAMES[currency] ?? currency
}

export function formatCurrency (amountMinor: number, currency: string, locale: LocaleCode): string {
  const amount = amountMinor / 100
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol'
  }).format(amount)
  return `${formatted} (${currencyName(currency)})`
}
