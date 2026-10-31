import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'
import { Platform } from 'react-native'

// 1. Configure foreground notification presentation
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export interface PushRegistrationResult {
  expoPushToken: string | null
  devicePushToken: string | null
  permissionGranted: boolean
  error: string | null
}

/**
 * Sets up the Android notification channel with high priority.
 * Gracefully falls back to system sound if the custom sound asset
 * is not yet compiled into the native APK.
 */
export async function setupNotificationChannelsAsync(): Promise<void> {
  if (Platform.OS !== 'android') return

  try {
    // Attempt with custom sound
    await Notifications.setNotificationChannelAsync('default', {
      name: 'General Notifications',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#CA8A04',
      enableLights: true,
      enableVibrate: true,
      showBadge: true,
      sound: 'notification_sound.wav',
    })
    console.log('[Notifications] Android channel configured with custom sound.')
  } catch (err) {
    console.warn(
      '[Notifications] Custom sound not in native APK yet, falling back to system sound:',
      err
    )
    try {
      // Fallback without custom sound
      await Notifications.setNotificationChannelAsync('default', {
        name: 'General Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#CA8A04',
        enableLights: true,
        enableVibrate: true,
        showBadge: true,
      })
      console.log('[Notifications] Android channel configured with system default sound.')
    } catch (fallbackErr) {
      console.error('[Notifications] Failed to create Android notification channel:', fallbackErr)
    }
  }
}

/**
 * Registers device for push notifications, configures channels,
 * requests runtime permissions (Android 13+ / iOS), and retrieves tokens.
 */
export async function registerForPushNotificationsAsync(): Promise<PushRegistrationResult> {
  if (Platform.OS === 'web') {
    return {
      expoPushToken: null,
      devicePushToken: null,
      permissionGranted: false,
      error: 'Push notifications are not supported on web.',
    }
  }

  // Ensure Android channel exists first so incoming notifications are never dropped
  await setupNotificationChannelsAsync()

  // Verify / request permissions
  let permissionGranted = false
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    permissionGranted = finalStatus === 'granted'
    if (!permissionGranted) {
      return {
        expoPushToken: null,
        devicePushToken: null,
        permissionGranted: false,
        error: `Notification permission denied (status: ${finalStatus}). Please enable notifications in device settings.`,
      }
    }
  } catch (permError) {
    console.error('[Notifications] Error requesting permissions:', permError)
    return {
      expoPushToken: null,
      devicePushToken: null,
      permissionGranted: false,
      error: `Failed to request notification permission: ${permError instanceof Error ? permError.message : String(permError)}`,
    }
  }

  if (!Device.isDevice) {
    console.warn('[Notifications] Physical device recommended for remote push notifications.')
  }

  let expoPushToken: string | null = null
  let devicePushToken: string | null = null
  let tokenError: string | null = null

  // 1. Fetch Expo Push Token (for expo.dev/notifications & Expo Push API)
  try {
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId ??
      '1ce41204-9557-4c79-bffb-6f3765ca5f86'

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId })
    expoPushToken = tokenData.data

    console.log('\n====================================================')
    console.log('📱 EXPO PUSH TOKEN:')
    console.log(expoPushToken)
    console.log('====================================================\n')
  } catch (err) {
    tokenError = err instanceof Error ? err.message : String(err)
    console.error('[Notifications] Failed to obtain Expo push token:', err)
  }

  // 2. Fetch native device token (FCM token on Android, APNs on iOS)
  try {
    const deviceData = await Notifications.getDevicePushTokenAsync()
    devicePushToken =
      typeof deviceData.data === 'string' ? deviceData.data : JSON.stringify(deviceData.data)
    console.log('🔥 NATIVE DEVICE (FCM) TOKEN:', devicePushToken)
  } catch (err) {
    console.warn(
      '[Notifications] getDevicePushTokenAsync failed (expected in some emulators):',
      err
    )
  }

  return {
    expoPushToken,
    devicePushToken,
    permissionGranted: true,
    error: expoPushToken ? null : tokenError,
  }
}

/**
 * Sends an immediate local test notification with high priority
 * and explicit channel assignment.
 */
export async function sendLocalTestNotificationAsync(): Promise<string> {
  if (Platform.OS === 'web') {
    alert('Local notifications not supported on web')
    return ''
  }

  await setupNotificationChannelsAsync()

  // Try with custom sound first; fallback to default if native asset is absent
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔔 Test Notification',
        body: 'Push and local notifications are working in MyDietitian!',
        data: { source: 'test-button', timestamp: new Date().toISOString() },
        sound: 'notification_sound.wav',
      },
      trigger: {
        channelId: 'default',
      },
    })
    console.log('[Notifications] Test notification delivered with ID:', id)
    return id
  } catch (err) {
    console.warn('[Notifications] Scheduling with custom sound failed, using default sound:', err)
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔔 Test Notification',
        body: 'Push and local notifications are working in MyDietitian!',
        data: { source: 'test-button', timestamp: new Date().toISOString() },
      },
      trigger: {
        channelId: 'default',
      },
    })
    console.log('[Notifications] Test notification delivered (fallback) with ID:', id)
    return id
  }
}
