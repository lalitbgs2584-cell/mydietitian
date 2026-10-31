import { Stack, useRouter } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useCallback, useEffect, useState } from 'react'
import { LogBox, StyleSheet, View } from 'react-native'

import { useBootstrap } from '@/bootstrap/useBootstrap'
import SplashAnimation from '@/components/splash/SplashAnimation'
import { warmUp } from '@/lib/api'
import { registerForPushNotificationsAsync } from '@/lib/notifications'

SplashScreen.preventAutoHideAsync()
warmUp()

LogBox.ignoreLogs(['expo-notifications: Custom sound', 'Custom sound'])

export default function RootLayout() {
  const router = useRouter()
  const boot = useBootstrap()
  const [animDone, setAnimDone] = useState(false)
  const [hasNavigated, setHasNavigated] = useState(false)

  // Hide the native black splash once the JS layout mounts and paints
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {})
  }, [])

  useEffect(() => {
    registerForPushNotificationsAsync()
  }, [])

  const handleSplashFinish = useCallback(() => {
    setAnimDone(true)
  }, [])

  useEffect(() => {
    if (animDone && boot.ready && !hasNavigated) {
      setHasNavigated(true)
      router.replace(boot.route as any)
    }
  }, [animDone, boot.ready, boot.route, hasNavigated, router])

  const showSplash = !(animDone && boot.ready)

  return (
    <View style={styles.root}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#121214' },
          headerTintColor: '#EAB308',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#0a0a0c' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'MyDietitian Test Hub' }} />
        <Stack.Screen name="camera" options={{ title: 'Camera Test', headerShown: false }} />
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>

      {showSplash && (
        <View style={styles.splashOverlay} pointerEvents="auto">
          <SplashAnimation onFinish={handleSplashFinish} />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  splashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    zIndex: 999999,
    elevation: 999999,
  },
})
