import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { LogBox, StyleSheet, View } from 'react-native'
import { useEffect } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { QueryClientProvider } from '@tanstack/react-query'

import { useAuthStatus } from '@/auth/useAuthStatus'
import { useSessionRefresh } from '@/auth/hooks/useSessionRefresh'
import { useBootstrap } from '@/bootstrap/useBootstrap'
import { SplashGate } from '@/components/splash/SplashGate'
import { queryClient } from '@/lib/query-client'
import { setSessionExpiredHandler, warmUp } from '@/lib/api'
import { clearLocalUserSession } from '@/auth/session'
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider'
import { darkColors } from '@/theme/colors'
import { useNotificationBootstrap } from '@/notifications/useNotificationBootstrap'
import { StatusBar } from 'expo-status-bar'
import { authClient } from '@/auth/client'
import { usePrefsStore } from '@/store/prefs.store'

SplashScreen.preventAutoHideAsync()
setSessionExpiredHandler(() => clearLocalUserSession('expired'))
warmUp()

LogBox.ignoreLogs(['expo-notifications: Custom sound', 'Custom sound'])

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <BottomSheetModalProvider>
            <RootNavigator />
          </BottomSheetModalProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}

function RootNavigator() {
  const status = useAuthStatus()
  const session = authClient.useSession()
  const recordAppActivity = usePrefsStore((state) => state.recordAppActivity)
  useSessionRefresh()
  useNotificationBootstrap(status)
  const boot = useBootstrap()
  const { colors } = useTheme()
  const { mode } = useTheme()

  useEffect(() => {
    const userId = session.data?.user.id
    if (status !== 'ready' || !userId) return
    const now = new Date()
    const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    recordAppActivity(userId, localDate)
  }, [recordAppActivity, session.data?.user.id, status])

  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <SplashGate ready={boot.ready && status !== 'booting'}>
        <View style={styles.navigator}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
          <Stack.Protected guard={status === 'signedOut' || status === 'booting'}>
            <Stack.Screen name="(auth)" />
          </Stack.Protected>
          <Stack.Protected guard={status === 'needsOnboarding'}>
            <Stack.Screen name="(onboarding)" />
          </Stack.Protected>
          <Stack.Protected guard={status === 'ready'}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="account" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="camera" options={{ headerShown: false }} />
          </Stack.Protected>
          <Stack.Protected guard={__DEV__ && status === 'ready'}>
            <Stack.Screen name="dev/index" />
          </Stack.Protected>
        </Stack>
        </View>
      </SplashGate>
    </>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: darkColors.background },
  navigator: { flex: 1 },
})
