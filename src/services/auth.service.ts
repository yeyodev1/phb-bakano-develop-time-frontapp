import APIBase from './httpBase'
import type { User } from '@/types'

interface LoginResponse {
  token: string
  user: User
}

class AuthService extends APIBase {
  async login(email: string, password: string) {
    const { data } = await this.post<LoginResponse>('auth/login', { email, password })
    return data
  }

  async me() {
    const { data } = await this.get<User>('auth/me')
    return data
  }

  async changePassword(currentPassword: string, newPassword: string) {
    const { data } = await this.post<{ message: string }>('auth/change-password', {
      currentPassword,
      newPassword,
    })
    return data
  }
}

export const authService = new AuthService()
