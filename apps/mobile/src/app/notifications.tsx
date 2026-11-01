import { StyleSheet, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { AppText } from '@/components/ui/AppText'
import { Screen } from '@/components/ui/Screen'
import { useTheme } from '@/theme/ThemeProvider'

export default function NotificationsScreen() {
  const { colors, sizes, spacing } = useTheme()
  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={[styles.icon, { backgroundColor: colors.surfaceHigh, marginBottom: spacing.md }]}><Ionicons name="notifications-outline" size={sizes.headerIcon + 8} color={colors.primary} /></View>
      <AppText variant="h2">You’re all caught up</AppText>
      <AppText variant="body" tone="muted" style={styles.description}>Helpful reminders and updates will show here.</AppText>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  icon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  description: { textAlign: 'center', marginTop: 8 },
})
