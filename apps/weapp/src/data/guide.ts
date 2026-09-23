export interface GuideOption {
  value: string
  labelKey: string
}

export interface GuideQuestion {
  id: string
  titleKey: string
  options: GuideOption[]
}

export const guideQuestions: GuideQuestion[] = [
  {
    id: 'first_time',
    titleKey: 'guide.question.first_time',
    options: [
      { value: 'yes', labelKey: 'guide.answer.yes' },
      { value: 'no', labelKey: 'guide.answer.no' }
    ]
  },
  {
    id: 'stay_days',
    titleKey: 'guide.question.stay_days',
    options: [
      { value: 'short', labelKey: 'guide.stay.short' },
      { value: 'medium', labelKey: 'guide.stay.medium' },
      { value: 'long', labelKey: 'guide.stay.long' }
    ]
  },
  {
    id: 'purpose',
    titleKey: 'guide.question.purpose',
    options: [
      { value: 'tourism', labelKey: 'guide.purpose.tourism' }
    ]
  }
]

export interface ChecklistItem {
  nameKey: string
  required: boolean
}

export const sampleChecklist: ChecklistItem[] = [
  { nameKey: 'checklist.passport', required: true },
  { nameKey: 'checklist.photo', required: true },
  { nameKey: 'checklist.form', required: true },
  { nameKey: 'checklist.funds', required: true }
]
