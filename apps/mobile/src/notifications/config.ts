export const notificationChannels = [
  { id: 'default', name: 'General', sound: true },
  { id: 'reminders-water', name: 'Water reminders', sound: true },
  { id: 'reminders-meals', name: 'Meal reminders', sound: true },
  { id: 'reminders-fasting', name: 'Fasting reminders', sound: true },
  { id: 'insights', name: 'Insights', sound: false },
  { id: 'security', name: 'Security', sound: false },
] as const
