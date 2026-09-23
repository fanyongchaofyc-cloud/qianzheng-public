import { createContext, useContext, useState, PropsWithChildren } from 'react'
import zhCN from '../../locales/zh-CN.json'
import en from '../../locales/en.json'
import ja from '../../locales/ja.json'
import ko from '../../locales/ko.json'

export type LocaleCode = 'zh-CN' | 'en' | 'ja' | 'ko'

const dictionaries: Record<LocaleCode, Record<string, string>> = {
  'zh-CN': zhCN as Record<string, string>,
  en: en as Record<string, string>,
  ja: ja as Record<string, string>,
  ko: ko as Record<string, string>
}

interface I18nContextValue {
  locale: LocaleCode
  setLocale: (locale: LocaleCode) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'zh-CN',
  setLocale: () => {},
  t: (key) => key
})

export function I18nProvider ({ children }: PropsWithChildren<any>) {
  const [locale, setLocale] = useState<LocaleCode>('zh-CN')

  const t = (key: string): string => {
    return dictionaries[locale][key] ?? dictionaries['zh-CN'][key] ?? key
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n () {
  return useContext(I18nContext)
}
