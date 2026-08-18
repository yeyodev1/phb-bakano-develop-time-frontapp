import APIBase from './httpBase'
import type { TrafficReport } from '@/types'

class MetricsService extends APIBase {
  async traffic(days = 30) {
    const { data } = await this.get<TrafficReport>(`metrics/traffic?days=${days}`, undefined, {
      timeout: 120000,
    })
    return data
  }
}

export const metricsService = new MetricsService()
