import APIBase from './httpBase'
import type { DeveloperReport, ReportSummary } from '@/types'

class ReportService extends APIBase {
  async summary(from?: string, to?: string) {
    const query = new URLSearchParams(
      Object.entries({ from, to }).filter(([, value]) => !!value) as [string, string][],
    ).toString()

    const { data } = await this.get<ReportSummary>(`reports/summary${query ? `?${query}` : ''}`)
    return data
  }

  async developer(id: string, from?: string, to?: string) {
    const query = new URLSearchParams(
      Object.entries({ from, to }).filter(([, value]) => !!value) as [string, string][],
    ).toString()

    const { data } = await this.get<DeveloperReport>(
      `reports/developer/${id}${query ? `?${query}` : ''}`,
    )
    return data
  }

  async sendWeeklyDigest(to?: string[]) {
    const { data } = await this.post<{ sentTo: string[] }>('reports/weekly-digest', { to })
    return data
  }
}

export const reportService = new ReportService()
