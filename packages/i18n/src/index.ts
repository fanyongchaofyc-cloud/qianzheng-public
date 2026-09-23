import type { LocaleCode } from '@vcc/types'

const messages: Partial<Record<LocaleCode, Record<string, string>>> = {}

export function setMessages (locale: LocaleCode, value: Record<string, string>): void {
  messages[locale] = value
}

export function translate (key: string, locale: LocaleCode = 'zh-CN'): string {
  return messages[locale]?.[key] ?? key
}
