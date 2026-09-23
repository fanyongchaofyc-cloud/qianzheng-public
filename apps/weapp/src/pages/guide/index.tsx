import { useEffect, useState } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useI18n } from '../../i18n'
import { destinations } from '../../data/destinations'
import { guideQuestions, sampleChecklist } from '../../data/guide'
import './index.scss'

export default function Guide () {
  const { t } = useI18n()
  const router = useRouter()
  const code = (router.params.code as string) || ''
  const destination = destinations.find(item => item.code === code)

  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  useEffect(() => {
    Taro.setNavigationBarTitle({ title: t('guide.title') })
  }, [])

  const choose = (value: string) => {
    const question = guideQuestions[step]
    if (!question) return

    setAnswers(prev => ({ ...prev, [question.id]: value }))
    setStep(step + 1)
  }

  const restart = () => {
    setStep(0)
    setAnswers({})
  }

  if (!destination) {
    return (
      <View className='guide guide--empty'>
        <Text>{t('guide.not_found')}</Text>
      </View>
    )
  }

  const done = step >= guideQuestions.length
  const question = guideQuestions[step]

  return (
    <View className='guide'>
      <View className='guide-header'>
        <Text className='guide-destination'>
          {destination.flag} {t(destination.nameKey)}
        </Text>
      </View>

      {!done ? (
        <View className='guide-step'>
          <Text className='guide-progress'>{step + 1} / {guideQuestions.length}</Text>
          <Text className='guide-question'>{t(question.titleKey)}</Text>
          <View className='guide-options'>
            {question.options.map(option => (
              <Button
                key={option.value}
                className='guide-option'
                onClick={() => choose(option.value)}
              >
                {t(option.labelKey)}
              </Button>
            ))}
          </View>
          {step > 0 && (
            <Button className='guide-back' onClick={() => setStep(step - 1)}>
              {t('common.back')}
            </Button>
          )}
        </View>
      ) : (
        <View className='guide-result'>
          <Text className='guide-result-title'>{t('guide.result.title')}</Text>
          <View className='guide-summary'>
            {guideQuestions.map(q => {
              const answer = answers[q.id]
              if (!answer) return null
              const option = q.options.find(item => item.value === answer)
              return (
                <View key={q.id} className='guide-summary-row'>
                  <Text className='guide-summary-question'>{t(q.titleKey)}</Text>
                  <Text className='guide-summary-answer'>{option ? t(option.labelKey) : answer}</Text>
                </View>
              )
            })}
          </View>
          <View className='checklist'>
            {sampleChecklist.map((item, index) => (
              <View key={item.nameKey} className='checklist-item'>
                <Text className='checklist-index'>{index + 1}</Text>
                <Text className='checklist-name'>{t(item.nameKey)}</Text>
                {item.required && <Text className='checklist-required'>*</Text>}
              </View>
            ))}
          </View>
          <Text className='guide-disclaimer'>{t('guide.result.disclaimer')}</Text>
          <Button className='guide-restart' onClick={restart}>
            {t('guide.restart')}
          </Button>
        </View>
      )}
    </View>
  )
}
