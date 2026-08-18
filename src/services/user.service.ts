import APIBase from './httpBase'
import type { User, UserRole } from '@/types'

export interface UserPayload {
  name: string
  email: string
  password?: string
  role: UserRole
  position?: string
  color?: string
  hourlyRate?: number
  isActive?: boolean
}

class UserService extends APIBase {
  async list(role?: string) {
    const { data } = await this.get<User[]>(`users${role ? `?role=${role}` : ''}`)
    return data
  }

  async create(payload: UserPayload) {
    const { data } = await this.post<User>('users', payload)
    return data
  }

  async update(id: string, payload: Partial<UserPayload>) {
    const { data } = await this.patch<User>(`users/${id}`, payload)
    return data
  }

  async deactivate(id: string) {
    const { data } = await this.delete<User>(`users/${id}`)
    return data
  }
}

export const userService = new UserService()
