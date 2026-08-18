export interface ApiError {
  status: number
  message: string
  data?: unknown
}

export type UserRole = 'admin' | 'client' | 'developer'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  position?: string
  color: string
  isActive: boolean
  hourlyRate?: number
  lastLoginAt?: string
}

export interface UserRef {
  _id: string
  name: string
  email?: string
  role?: UserRole
  color?: string
}

export type RequestStatus =
  | 'pending'
  | 'approved'
  | 'in_progress'
  | 'blocked'
  | 'review'
  | 'done'
  | 'cancelled'

export type RequestPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface StatusChange {
  from: RequestStatus | null
  to: RequestStatus
  by?: UserRef
  note?: string
  at: string
}

export interface DevRequest {
  _id: string
  code: string
  title: string
  description: string
  category: string
  status: RequestStatus
  priority: RequestPriority
  requestedBy: UserRef
  assignees: UserRef[]
  estimatedHours: number
  loggedHours: number
  tools: string[]
  dueDate?: string
  startedAt?: string
  completedAt?: string
  history: StatusChange[]
  createdAt: string
  updatedAt: string
}

export interface TimeLog {
  _id: string
  request: Pick<DevRequest, '_id' | 'code' | 'title' | 'status'>
  user: UserRef
  date: string
  hours: number
  action: string
  phase?: string
  tools: string[]
  createdAt: string
}

export interface Comment {
  _id: string
  request: string
  user: UserRef
  message: string
  createdAt: string
}

export interface RequestDetail {
  request: DevRequest
  timeLogs: TimeLog[]
  comments: Comment[]
}

export interface HoursByUser {
  userId: string
  name: string
  color: string
  role: UserRole
  position?: string
  hours: number
  entries: number
}

export interface HoursByRequest {
  requestId: string
  code: string
  title: string
  status: RequestStatus
  estimatedHours: number
  hours: number
}

export interface ReportSummary {
  range: { from: string; to: string }
  requests: {
    byStatus: Record<RequestStatus, number>
    total: number
    estimatedHours: number
    loggedHours: number
    open: number
    avgResolutionDays: number
  }
  hours: {
    total: number
    entries: number
    byUser: HoursByUser[]
    byRequest: HoursByRequest[]
    byDay: Array<{ day: string; hours: number }>
  }
}

export interface DeveloperReport {
  user: UserRef & { position?: string }
  range: { from: string; to: string }
  totalHours: number
  entries: number
  assignedRequests: number
  deliveredRequests: number
  logs: TimeLog[]
}

export interface SiteTraffic {
  site: string
  zoneId: string
  days: number
  firstDay: string | null
  lastDay: string | null
  uniques: number
  pageViews: number
  requests: number
  threatsBlocked: number
  humanPageViews: number
  botPageViews: number
  humanShare: number
  estimatedHumanUniques: number
  peak: { date: string; uniques: number } | null
  countries: Array<{ code: string; requests: number }>
  browsers: Array<{ name: string; pageViews: number; human: boolean }>
  statuses: Array<{ status: number; requests: number }>
  daily: Array<{ day: string; uniques: number; pageViews: number }>
  scanning: Array<{ path: string; count: number }>
  warnings: string[]
}

export interface TrafficReport {
  cached: boolean
  generatedAt: string
  sites: SiteTraffic[]
}
