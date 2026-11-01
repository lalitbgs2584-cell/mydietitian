import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { notificationChannels } from './config'
export async function setupNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') return
  for (const channel of notificationChannels) {
    try {
      await Notifications.setNotificationChannelAsync(channel.id, { name: channel.name, importance: Notifications.AndroidImportance.HIGH, vibrationPattern: [0, 250, 250, 250], sound: channel.sound ? 'notification_sound.wav' : undefined, showBadge: true })
    } catch {
      await Notifications.setNotificationChannelAsync(channel.id, { name: channel.name, importance: Notifications.AndroidImportance.HIGH, showBadge: true }).catch(() => undefined)
    }
  }
}
