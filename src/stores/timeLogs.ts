import { defineStore } from 'pinia'
import { timeLogService, type TimeLogFilters, type TimeLogPayload } from '@/services/timeLog.service'
import type { TimeLog } from '@/types'

interface TimeLogsState {
  items: TimeLog[]
  filters: TimeLogFilters
  loading: boolean
  error: string
}

export const useTimeLogsStore = defineStore('timeLogs', {
  state: (): TimeLogsState => ({
    items: [],
    filters: {},
    loading: false,
    error: '',
  }),

  getters: {
    totalHours: (state) => state.items.reduce((acc, item) => acc + item.hours, 0),
  },

  actions: {
    async fetchAll(filters?: TimeLogFilters) {
      this.loading = true
      this.error = ''
      if (filters) this.filters = filters

      try {
        this.items = await timeLogService.list(this.filters)
      } catch (error) {
        this.error = (error as { message?: string }).message || 'No se pudieron cargar las horas'
      } finally {
        this.loading = false
      }
    },

    async create(payload: TimeLogPayload) {
      const created = await timeLogService.create(payload)
      this.items.unshift(created)
      return created
    },

    async remove(id: string) {
      await timeLogService.remove(id)
      this.items = this.items.filter((item) => item._id !== id)
    },
  },
})
