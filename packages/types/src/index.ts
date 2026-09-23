export type LocaleCode = 'zh-CN' | 'en' | 'ja' | 'ko'

export type VisaCategoryCode = 'tourist' | 'student' | 'business' | 'family_visit'

export type DestinationCode = 'japan' | 'south_korea' | 'schengen_fr' | 'schengen_de' | 'schengen_it' | 'united_states'

export interface LocalizedText {
  'zh-CN': string
  en: string
  ja: string
  ko: string
}
