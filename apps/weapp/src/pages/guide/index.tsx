import { useEffect, useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { Button, Cell } from '@nutui/nutui-react-taro'
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
                type='primary'
                size='large'
                block
                onClick={() => choose(option.value)}
              >
                {t(option.labelKey)}
              </Button>
            ))}
          </View>
          {step > 0 && (
            <Button type='default' size='large' block onClick={() => setStep(step - 1)}>
              {t('common.back')}
            </Button>
          )}
        </View>
      ) : (
        <View className='guide-result'>
          <Cell.Group title={t('guide.summary')}>
            {guideQuestions.map(q => {
              const answer = answers[q.id]
              if (!answer) return null
              const option = q.options.find(item => item.value === answer)
              return (
                <Cell
                  key={q.id}
                  title={t(q.titleKey)}
                  description={option ? t(option.labelKey) : answer}
                />
              )
            })}
          </Cell.Group>

          <Cell.Group title={t('guide.result.title')}>
            {sampleChecklist.map((item, index) => (
              <Cell
                key={item.nameKey}
                title={t(item.nameKey)}
                extra={item.required ? `${index + 1} *` : `${index + 1}`}
              />
            ))}
          </Cell.Group>

          <Text className='guide-disclaimer'>{t('guide.result.disclaimer')}</Text>
          <Button type='primary' size='large' block onClick={restart}>
            {t('guide.restart')}
          </Button>
        </View>
      )}
    </View>
  )
}
