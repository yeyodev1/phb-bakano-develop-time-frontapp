import type { RequestPriority, RequestStatus } from '@/types'

export const STATUS_LABELS: Record<RequestStatus, string> = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  in_progress: 'En progreso',
  blocked: 'Bloqueada',
  review: 'En revisión',
  done: 'Completada',
  cancelled: 'Cancelada',
}

export const STATUS_ORDER: RequestStatus[] = [
  'pending',
  'approved',
  'in_progress',
  'blocked',
  'review',
  'done',
  'cancelled',
]

export const STATUS_ICONS: Record<RequestStatus, string> = {
  pending: 'fa-hourglass-half',
  approved: 'fa-circle-check',
  in_progress: 'fa-bolt',
  blocked: 'fa-ban',
  review: 'fa-magnifying-glass',
  done: 'fa-check-double',
  cancelled: 'fa-xmark',
}

export const CATEGORY_ICONS: Record<string, string> = {
  desarrollo: 'fa-code',
  'diseño': 'fa-pen-nib',
  'automatización / IA': 'fa-robot',
  contenido: 'fa-file-lines',
  accesos: 'fa-key',
  soporte: 'fa-headset',
  infraestructura: 'fa-server',
}

export const PRIORITY_LABELS: Record<RequestPriority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente',
}

export const PRIORITY_ORDER: RequestPriority[] = ['low', 'medium', 'high', 'urgent']

export const CATEGORIES = [
  'desarrollo',
  'diseño',
  'automatización / IA',
  'contenido',
  'accesos',
  'soporte',
  'infraestructura',
]

export const TOOL_SUGGESTIONS = [
  'GoHighLevel',
  'Conversation AI',
  'Workflows GHL',
  'Inbound Webhook',
  'LeadConnector',
  'Meta Ads',
  'Zoom',
  'Prompt Engineering',
  'JSON / POST testing',
  'Vue 3',
  'Node / Express',
  'MongoDB',
  'Figma',
  'WordPress',
  'Vercel',
]
