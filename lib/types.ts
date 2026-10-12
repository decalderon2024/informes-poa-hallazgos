export type Unit = {
  id: number
  name: string
}

export type Plan = {
  id: number
  year: number
  name: string
  status: string
}

export type FollowUp = {
  id: number
  actionId: number
  month: number
  executionComment: string | null
  evaluationResponse: string | null
  createdAt: string
}

export type Observation = {
  id: number
  actionId: number
  text: string
  createdAt: string
}

export type ActionMonthStatus = {
  month: number
  status: 'done' | 'missed'
}

export type ActionNode = {
  id: number
  descriptorId: number
  description: string
  executionUnitId: number | null
  evaluationUnitId: number | null
  executionUnitName: string | null
  evaluationUnitName: string | null
  startMonth: number | null
  endMonth: number | null
  completionPercentage: number
  monthStatuses: ActionMonthStatus[]
  followUps: FollowUp[]
  observations: Observation[]
}

export type DescriptorNode = {
  id: number
  objectiveId: number
  text: string
  initiative: string | null
  indicator: string | null
  actions: ActionNode[]
}

export type ObjectiveNode = {
  id: number
  categoryId: number
  text: string
  descriptors: DescriptorNode[]
}

export type CategoryNode = {
  id: number
  planId: number
  name: string
  description: string | null
  color: string
  objectives: ObjectiveNode[]
}
