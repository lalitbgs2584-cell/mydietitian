export const notificationCategories = ['SYSTEM','REFERRAL','WATER_REMINDER','MEAL_REMINDER','FASTING_REMINDER','GOAL_PROGRESS','WEEKLY_SUMMARY','BUDGET_ALERT','SECURITY'] as const
export type NotificationCategory = typeof notificationCategories[number]
export type NotificationPayload = { category: NotificationCategory; href?: string; ids?: Record<string, string> }
