import type { NotificationPayload } from './types'
const categoryRoutes: Record<NotificationPayload['category'], string> = {
  SYSTEM: '/(tabs)', REFERRAL: '/(tabs)', WATER_REMINDER: '/(tabs)', MEAL_REMINDER: '/(tabs)', FASTING_REMINDER: '/(tabs)', GOAL_PROGRESS: '/(tabs)', WEEKLY_SUMMARY: '/(tabs)', BUDGET_ALERT: '/(tabs)', SECURITY: '/(tabs)',
}
export function notificationRoute(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null
  const category = (value as { category?: unknown }).category
  return typeof category === 'string' && category in categoryRoutes ? categoryRoutes[category as NotificationPayload['category']] : null
}
