import { defineStore } from 'pinia'
import {
  requestService,
  type CreateRequestPayload,
  type RequestFilters,
} from '@/services/request.service'
import type { DevRequest, RequestDetail, RequestStatus } from '@/types'

interface RequestsState {
  items: DevRequest[]
  current: RequestDetail | null
  filters: RequestFilters
  loading: boolean
  error: string
}

export const useRequestsStore = defineStore('requests', {
  state: (): RequestsState => ({
    items: [],
    current: null,
    filters: {},
    loading: false,
    error: '',
  }),

  getters: {
    openItems: (state) =>
      state.items.filter((item) => !['done', 'cancelled'].includes(item.status)),
    totalLogged: (state) => state.items.reduce((acc, item) => acc + item.loggedHours, 0),
  },

  actions: {
    async fetchAll(filters?: RequestFilters) {
      this.loading = true
      this.error = ''
      if (filters) this.filters = filters

      try {
        this.items = await requestService.list(this.filters)
      } catch (error) {
        this.error = (error as { message?: string }).message || 'No se pudieron cargar las solicitudes'
      } finally {
        this.loading = false
      }
    },

    async fetchOne(id: string) {
      this.loading = true
      this.error = ''
      try {
        this.current = await requestService.detail(id)
        return this.current
      } catch (error) {
        this.error = (error as { message?: string }).message || 'No se pudo cargar la solicitud'
        return null
      } finally {
        this.loading = false
      }
    },

    async create(payload: CreateRequestPayload) {
      const created = await requestService.create(payload)
      this.items.unshift(created)
      return created
    },

    async changeStatus(id: string, status: RequestStatus, note = '') {
      const updated = await requestService.changeStatus(id, status, note)
      const index = this.items.findIndex((item) => item._id === id)
      if (index >= 0) this.items[index] = updated
      if (this.current?.request._id === id) this.current.request = updated
      return updated
    },

    async comment(id: string, message: string) {
      const comment = await requestService.comment(id, message)
      if (this.current?.request._id === id) this.current.comments.unshift(comment)
      return comment
    },

    async remove(id: string) {
      await requestService.remove(id)
      this.items = this.items.filter((item) => item._id !== id)
    },
  },
})
