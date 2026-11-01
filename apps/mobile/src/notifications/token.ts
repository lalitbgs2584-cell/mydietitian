import * as Device from 'expo-device'
import Constants from 'expo-constants'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
export async function getExpoPushToken(): Promise<string | null> {
  if (Platform.OS === 'web' || !Device.isDevice) return null
  const projectId = Constants.expoConfig?.extra?.eas?.projectId
  if (!projectId) return null
  return (await Notifications.getExpoPushTokenAsync({ projectId })).data
}
