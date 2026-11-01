import { useEffect, useRef, useState } from 'react'
import { Image, Pressable, StyleSheet, View } from 'react-native'
import { Redirect, router } from 'expo-router'
import Animated, { FadeIn, FadeInDown, useReducedMotion } from 'react-native-reanimated'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { LegalFooter } from '@/components/auth/LegalFooter'
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons'
import { AppText } from '@/components/ui/AppText'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { Screen } from '@/components/ui/Screen'
import { env } from '@/lib/env'
import { usePrefsStore } from '@/store/prefs.store'
import { useTheme } from '@/theme/ThemeProvider'

export default function WelcomeScreen() {
  const hasSeenWelcome = usePrefsStore((state) => state.hasSeenWelcome)
  const prefsHydrated = usePrefsStore((state) => state.hydrated)
  const setHasSeenWelcome = usePrefsStore((state) => state.setHasSeenWelcome)
  const { colors } = useTheme()
  const reduceMotion = useReducedMotion() === true
  const isFirstVisit = useRef(!hasSeenWelcome)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    if (prefsHydrated && !hasSeenWelcome) {
      setHasSeenWelcome(true)
    }
  }, [hasSeenWelcome, prefsHydrated, setHasSeenWelcome])

  if (prefsHydrated && hasSeenWelcome && !isFirstVisit.current) {
    return <Redirect href="/sign-in" />
  }

  const entrance = (delay: number) => reduceMotion ? FadeIn.duration(250).delay(delay) : FadeInDown.duration(350).delay(delay)
  return (
    <Screen headerShown={false} scroll contentContainerStyle={styles.content}>
      <View pointerEvents="none" style={styles.glowWrap}><Image source={require('@/assets/images/logo-glow.png')} resizeMode="contain" style={styles.glow} /></View>
      <Animated.View entering={entrance(0)} style={styles.brand}><BrandLogo size={148} /></Animated.View>
      <Animated.View entering={entrance(60)} style={styles.copy}>
        <AppText variant="display" style={{ color: colors.goldSoft, textAlign: 'center' }}>Eat well.</AppText>
        <AppText variant="display" style={{ color: colors.green, textAlign: 'center' }}>Stay well.</AppText>
        <AppText variant="body" tone="muted" style={styles.subtitle}>Scan your meals, track your macros, and eat well on your budget.</AppText>
      </Animated.View>
      <View style={styles.actions}>
        {authError ? <Banner tone="error" message={authError} /> : null}
        <SocialAuthButtons
          providers={env.APPLE_AUTH_ENABLED ? ['apple', 'google'] : ['google']}
          onError={setAuthError}
        />
        <Animated.View entering={entrance(120)}><Button label="Sign up with email" onPress={() => router.push('/sign-up')} /></Animated.View>
        <Pressable accessibilityRole="link" onPress={() => router.push('/sign-in')} style={styles.linkRow}>
          <AppText variant="body" tone="muted">Already have an account? </AppText>
          <AppText variant="link" tone="gold">Sign in</AppText>
        </Pressable>
        <LegalFooter />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: { minHeight: '100%', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24, gap: 16 },
  glow: { position: 'absolute', width: '100%', height: 320, top: -24, alignSelf: 'center', opacity: 0.4 },
  glowWrap: { ...StyleSheet.absoluteFill },
  brand: { alignItems: 'center', paddingTop: 4 },
  copy: { alignItems: 'center' },
  subtitle: { textAlign: 'center', marginTop: 14, maxWidth: 330 },
  actions: { gap: 12, paddingTop: 8 },
  linkRow: { flexDirection: 'row', justifyContent: 'center', minHeight: 48, alignItems: 'center' },
})
