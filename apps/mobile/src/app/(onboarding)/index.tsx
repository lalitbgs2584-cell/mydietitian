import { Pressable, StyleSheet, View } from 'react-native'
import { useSignOut } from '@/auth/hooks/useSignOut'
import { useTheme } from '@/theme/ThemeProvider'
import { usePrefsStore } from '@/store/prefs.store'
import { Button } from '@/components/ui'
import { Screen, AppText } from '@/components/ui'

export default function OnboardingScreen() {
  const signOut = useSignOut()
  const { colors, fonts } = useTheme()
  const setLastKnownUser = usePrefsStore((state) => state.setLastKnownUser)
  const lastKnownUser = usePrefsStore((state) => state.lastKnownUser)

  return (
    <Screen headerShown={false} scroll contentContainerStyle={styles.container}>
      <AppText variant="h1" style={{ color: colors.foreground, fontFamily: fonts.displayBold }}>Onboarding</AppText>
      <AppText variant="body" style={{ color: colors.mutedForeground, fontFamily: fonts.sans }}>Voice onboarding is coming soon.</AppText>
      <Pressable accessibilityRole="button" onPress={() => void signOut()} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <AppText variant="button" style={{ color: colors.primary, fontFamily: fonts.sansBold }}>Sign out</AppText>
      </Pressable>
      {__DEV__ && lastKnownUser ? <Button label="Skip (dev)" variant="secondary" onPress={() => setLastKnownUser({ ...lastKnownUser, onboarded: true })} /> : null}
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  button: { minHeight: 48, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, marginTop: 12 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
})
