import APIBase from './httpBase'
import type { Comment, DevRequest, RequestDetail, RequestPriority, RequestStatus } from '@/types'

export interface CreateRequestPayload {
  title: string
  description?: string
  category?: string
  priority?: RequestPriority
  estimatedHours?: number
  dueDate?: string
  assignees?: string[]
  tools?: string[]
}

export interface RequestFilters {
  status?: string
  priority?: string
  assignee?: string
  mine?: string
  search?: string
}

class RequestService extends APIBase {
  async list(filters: RequestFilters = {}) {
    const query = new URLSearchParams(
      Object.entries(filters).filter(([, value]) => !!value) as [string, string][],
    ).toString()

    const { data } = await this.get<DevRequest[]>(`requests${query ? `?${query}` : ''}`)
    return data
  }

  async detail(id: string) {
    const { data } = await this.get<RequestDetail>(`requests/${id}`)
    return data
  }

  async create(payload: CreateRequestPayload) {
    const { data } = await this.post<DevRequest>('requests', payload)
    return data
  }

  async update(id: string, payload: Partial<DevRequest>) {
    const { data } = await this.patch<DevRequest>(`requests/${id}`, payload)
    return data
  }

  async changeStatus(id: string, status: RequestStatus, note = '') {
    const { data } = await this.patch<DevRequest>(`requests/${id}/status`, { status, note })
    return data
  }

  async comment(id: string, message: string) {
    const { data } = await this.post<Comment>(`requests/${id}/comments`, { message })
    return data
  }

  async remove(id: string) {
    const { data } = await this.delete<{ message: string }>(`requests/${id}`)
    return data
  }
}

export const requestService = new RequestService()
