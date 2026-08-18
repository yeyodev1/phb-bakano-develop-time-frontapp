import APIBase from './httpBase'
import type { TimeLog } from '@/types'

export interface TimeLogFilters {
  from?: string
  to?: string
  request?: string
  user?: string
  mine?: string
}

export interface TimeLogPayload {
  request: string
  hours: number
  action: string
  date?: string
  phase?: string
  tools?: string[]
  user?: string
}

class TimeLogService extends APIBase {
  async list(filters: TimeLogFilters = {}) {
    const query = new URLSearchParams(
      Object.entries(filters).filter(([, value]) => !!value) as [string, string][],
    ).toString()

    const { data } = await this.get<TimeLog[]>(`time-logs${query ? `?${query}` : ''}`)
    return data
  }

  async create(payload: TimeLogPayload) {
    const { data } = await this.post<TimeLog>('time-logs', payload)
    return data
  }

  async update(id: string, payload: Partial<TimeLogPayload>) {
    const { data } = await this.patch<TimeLog>(`time-logs/${id}`, payload)
    return data
  }

  async remove(id: string) {
    const { data } = await this.delete<{ message: string }>(`time-logs/${id}`)
    return data
  }
}

export const timeLogService = new TimeLogService()
