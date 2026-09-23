import { useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useI18n, LocaleCode } from '../../i18n'
import { destinations } from '../../data/destinations'
import './index.scss'

const LOCALES: { code: LocaleCode, label: string }[] = [
  { code: 'zh-CN', label: '中文' },
  { code: 'en', label: 'EN' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' }
]

export default function Index () {
  const { locale, setLocale, t } = useI18n()

  useLoad(() => {
    console.log('Home loaded.')
  })

  useEffect(() => {
    Taro.setNavigationBarTitle({ title: t('home.title') })
  }, [locale])

  const openGuide = (code: string) => {
    Taro.navigateTo({ url: `/pages/guide/index?code=${code}` })
  }

  return (
    <View className='home'>
      <View className='locale-bar'>
        {LOCALES.map(item => (
          <View
            key={item.code}
            className={`locale-item ${locale === item.code ? 'locale-item--active' : ''}`}
            onClick={() => setLocale(item.code)}
          >
            <Text>{item.label}</Text>
          </View>
        ))}
      </View>

      <View className='hero'>
        <Text className='hero-title'>{t('home.title')}</Text>
        <Text className='hero-subtitle'>{t('home.subtitle')}</Text>
      </View>

      <View className='destination-grid'>
        {destinations.map(item => (
          <View key={item.code} className='destination-card' onClick={() => openGuide(item.code)}>
            <Text className='destination-flag'>{item.flag}</Text>
            <Text className='destination-name'>{t(item.nameKey)}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
