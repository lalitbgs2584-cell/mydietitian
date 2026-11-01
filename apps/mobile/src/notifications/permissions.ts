import * as Notifications from 'expo-notifications'
export async function hasNotificationPermission(): Promise<boolean> { return (await Notifications.getPermissionsAsync()).status === 'granted' }
export async function requestNotificationPermission(): Promise<boolean> { return (await Notifications.requestPermissionsAsync()).status === 'granted' }
