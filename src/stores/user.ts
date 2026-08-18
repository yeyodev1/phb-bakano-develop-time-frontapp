import { defineStore } from 'pinia'
import { authService } from '@/services/auth.service'
import type { User } from '@/types'

interface UserState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: null,
    isAuthenticated: false,
    loading: false,
  }),

  getters: {
    isAdmin: (state) => state.user?.role === 'admin',
    isDeveloper: (state) => state.user?.role === 'developer',
    isClient: (state) => state.user?.role === 'client',
    canLogHours: (state) => state.user?.role === 'admin' || state.user?.role === 'developer',
    initials: (state) =>
      (state.user?.name || '')
        .split(' ')
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join(''),
  },

  actions: {
    async login(email: string, password: string) {
      this.loading = true
      try {
        const { token, user } = await authService.login(email, password)
        localStorage.setItem('access_token', token)
        localStorage.setItem('user_id', user.id)
        this.user = user
        this.isAuthenticated = true
        return user
      } finally {
        this.loading = false
      }
    },

    async hydrate() {
      const token = localStorage.getItem('access_token')
      if (!token) return null

      try {
        this.user = await authService.me()
        this.isAuthenticated = true
        return this.user
      } catch {
        this.logout()
        return null
      }
    },

    logout() {
      this.user = null
      this.isAuthenticated = false
      localStorage.removeItem('access_token')
      localStorage.removeItem('user_id')
    },
  },
})
