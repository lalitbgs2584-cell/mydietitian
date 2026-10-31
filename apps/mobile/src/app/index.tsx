import { useAudioPlayer } from 'expo-audio'
import * as Notifications from 'expo-notifications'
import { useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import {
  registerForPushNotificationsAsync,
  sendLocalTestNotificationAsync,
  setupNotificationChannelsAsync,
  type PushRegistrationResult,
} from '@/lib/notifications'

export default function IndexScreen() {
  const router = useRouter()
  const [expoToken, setExpoToken] = useState<string | null>(null)
  const [deviceToken, setDeviceToken] = useState<string | null>(null)
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSendingLocal, setIsSendingLocal] = useState(false)
  const [lastNotification, setLastNotification] = useState<Notifications.Notification | null>(null)

  const soundPlayer = useAudioPlayer(require('@/assets/sounds/notification_sound.wav'))

  const notificationListener = useRef<Notifications.EventSubscription | null>(null)
  const responseListener = useRef<Notifications.EventSubscription | null>(null)

  const initToken = async () => {
    setIsLoading(true)
    setTokenError(null)
    try {
      const result: PushRegistrationResult = await registerForPushNotificationsAsync()
      setExpoToken(result.expoPushToken)
      setDeviceToken(result.devicePushToken)
      setPermissionGranted(result.permissionGranted)
      if (result.error) {
        setTokenError(result.error)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setTokenError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (Platform.OS === 'web') {
      setIsLoading(false)
      return
    }

    // Ensure channels are ready
    setupNotificationChannelsAsync()
    initToken()

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('🔔 [Notifications] Notification Received in foreground:', notification)
      setLastNotification(notification)
    })

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('👉 [Notifications] Notification Tapped:', response)
    })

    return () => {
      notificationListener.current?.remove()
      responseListener.current?.remove()
    }
  }, [])

  const handlePlaySound = async () => {
    try {
      await soundPlayer.seekTo(0)
      soundPlayer.play()
    } catch (e) {
      console.error('Failed to play sound:', e)
    }
  }

  const handleSendTestNotification = async () => {
    setIsSendingLocal(true)
    try {
      const id = await sendLocalTestNotificationAsync()
      if (id) {
        console.log('[UI] Notification sent successfully:', id)
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      Alert.alert('Notification Error', msg)
    } finally {
      setIsSendingLocal(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.appName}>MyDietitian</Text>
          <Text style={styles.appSubtitle}>Build & Features Test Hub</Text>
        </View>

        {/* 1. Camera Test Card */}
        <Pressable
          style={({ pressed }) => [styles.card, styles.cameraCard, pressed && styles.cardPressed]}
          onPress={() => router.push('/camera')}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cameraBadge}>
              <Text style={styles.cardIcon}>📸</Text>
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>Test Camera</Text>
              <Text style={styles.cardDescription}>
                Test viewfinder, capture photos, flip front/rear, and toggle flash
              </Text>
            </View>
            <Text style={styles.arrowIcon}>→</Text>
          </View>
        </Pressable>

        {/* 2. Notifications Test Card */}
        <View style={[styles.card, styles.notificationCard]}>
          <View style={styles.cardHeader}>
            <View style={styles.notificationBadge}>
              <Text style={styles.cardIcon}>🔔</Text>
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>Push Notifications</Text>
              <Text style={styles.cardDescription}>
                {isLoading
                  ? 'Initializing notifications...'
                  : expoToken
                    ? 'Push token active & channel ready'
                    : permissionGranted === false
                      ? 'Permission denied (enable in settings)'
                      : 'Notification setup pending'}
              </Text>
            </View>
          </View>

          {/* Error Banner */}
          {tokenError && (
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>⚠️ Notice</Text>
              <Text style={styles.errorText}>{tokenError}</Text>
            </View>
          )}

          {/* Expo Push Token Box */}
          <View style={styles.tokenBox}>
            <View style={styles.tokenHeaderRow}>
              <Text style={styles.tokenLabel}>Expo Push Token (Tap & hold to copy):</Text>
              {isLoading && <ActivityIndicator size="small" color="#EAB308" />}
            </View>
            <Text selectable={true} style={styles.tokenValue}>
              {expoToken ??
                (isLoading
                  ? 'Requesting token from Expo...'
                  : 'Token unavailable (check permissions or EAS setup)')}
            </Text>
          </View>

          {/* Native Device / FCM Token Box */}
          {deviceToken && (
            <View style={styles.tokenBox}>
              <Text style={styles.tokenLabel}>Native FCM Device Token:</Text>
              <Text selectable={true} style={styles.tokenValue}>
                {deviceToken}
              </Text>
            </View>
          )}

          {/* Sound Preview Row */}
          <View style={styles.soundRow}>
            <View style={styles.soundTextContainer}>
              <Text style={styles.soundTitle}>Custom Sound:</Text>
              <Text style={styles.soundSubtitle}>mixkit-software-interface-start.wav</Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.soundButton, pressed && styles.cardPressed]}
              onPress={handlePlaySound}
            >
              <Text style={styles.soundButtonText}>▶️ Play Sound</Text>
            </Pressable>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                isSendingLocal && styles.buttonDisabled,
                pressed && styles.cardPressed,
              ]}
              onPress={handleSendTestNotification}
              disabled={isSendingLocal}
            >
              <Text style={styles.primaryButtonText}>
                {isSendingLocal ? 'Sending...' : '🔔 Send Test Notification'}
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.retryButton, pressed && styles.cardPressed]}
              onPress={initToken}
            >
              <Text style={styles.retryButtonText}>🔄 Refresh</Text>
            </Pressable>
          </View>

          {/* Received Notification */}
          {lastNotification && (
            <View style={styles.receivedBox}>
              <Text style={styles.receivedTitle}>✓ Last Received Notification:</Text>
              <Text style={styles.receivedText}>
                {lastNotification.request.content.title}: {lastNotification.request.content.body}
              </Text>
            </View>
          )}

          {/* Remote Testing Guide */}
          <View style={styles.noteBox}>
            <Text style={styles.noteText}>
              💡 <Text style={styles.noteBold}>How to test remote push:</Text>
              {'\n'}
              1. Copy the <Text style={styles.noteHighlight}>Expo Push Token</Text> above.{'\n'}
              2. Go to <Text style={styles.noteLink}>https://expo.dev/notifications</Text>
              {'\n'}
              3. Paste token into "Expo Push Token".{'\n'}
              4. Enter title & message, and set{' '}
              <Text style={styles.noteHighlight}>Channel ID: default</Text>.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0a0c',
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  header: {
    marginBottom: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
  },
  appSubtitle: {
    fontSize: 14,
    color: '#8e8e93',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#121216',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#26262c',
    gap: 16,
  },
  cameraCard: {
    borderColor: '#2e2e36',
  },
  notificationCard: {
    borderColor: 'rgba(202, 138, 4, 0.45)',
    backgroundColor: '#131210',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  cameraBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#18181c',
    borderWidth: 1,
    borderColor: '#2e2e36',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#1c190f',
    borderWidth: 1.5,
    borderColor: '#CA8A04',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: {
    fontSize: 22,
  },
  cardHeaderText: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  cardDescription: {
    fontSize: 13,
    color: '#8e8e93',
    lineHeight: 18,
  },
  arrowIcon: {
    fontSize: 22,
    color: '#CA8A04',
    fontWeight: 'bold',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  errorTitle: {
    color: '#f87171',
    fontSize: 13,
    fontWeight: '700',
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 12,
    lineHeight: 17,
  },
  tokenBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222226',
    gap: 6,
  },
  tokenHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tokenLabel: {
    fontSize: 12,
    color: '#EAB308',
    fontWeight: '600',
  },
  tokenValue: {
    fontSize: 12,
    color: '#e4e4e8',
    fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }),
    lineHeight: 18,
  },
  soundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 12,
    borderRadius: 12,
  },
  soundTextContainer: {
    gap: 2,
  },
  soundTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  soundSubtitle: {
    color: '#8e8e93',
    fontSize: 11,
  },
  soundButton: {
    backgroundColor: 'rgba(202, 138, 4, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(202, 138, 4, 0.45)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  soundButtonText: {
    color: '#FACC15',
    fontSize: 12,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#CA8A04',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#000000',
    fontWeight: '800',
    fontSize: 14,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  receivedBox: {
    backgroundColor: 'rgba(202, 138, 4, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(202, 138, 4, 0.35)',
    padding: 12,
    borderRadius: 12,
    gap: 4,
  },
  receivedTitle: {
    color: '#FACC15',
    fontSize: 12,
    fontWeight: '700',
  },
  receivedText: {
    color: '#ffffff',
    fontSize: 13,
  },
  noteBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 14,
    borderRadius: 12,
  },
  noteText: {
    fontSize: 12,
    color: '#a1a1aa',
    lineHeight: 20,
  },
  noteBold: {
    fontWeight: '700',
    color: '#ffffff',
  },
  noteHighlight: {
    color: '#FACC15',
    fontWeight: '600',
  },
  noteLink: {
    color: '#EAB308',
    fontWeight: '600',
  },
  cardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
})
