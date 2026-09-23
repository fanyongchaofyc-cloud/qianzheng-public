import type { DestinationCode, LocalizedText, VisaCategoryCode } from '@vcc/types'

export interface PolicyVersion {
  id: string
  destination: DestinationCode
  category: VisaCategoryCode
  version: string
  effectiveAt: string
  status: 'draft' | 'published' | 'retired'
}

export interface RequirementItem {
  id: string
  name: LocalizedText
  required: boolean
}

export interface ProcessStep {
  id: string
  title: LocalizedText
  order: number
}

export interface VisaRuleSet {
  policy: PolicyVersion
  requirements: RequirementItem[]
  steps: ProcessStep[]
}
