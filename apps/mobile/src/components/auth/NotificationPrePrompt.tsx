import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import { useTheme } from '@/theme/ThemeProvider'
import { requestNotificationPermission } from '@/notifications/permissions'
import { usePrefsStore } from '@/store/prefs.store'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { spacing } from '@/theme/spacing'
export function NotificationPrePrompt({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { colors, fonts } = useTheme()
  const insets = useSafeAreaInsets()
  const setPrompt = usePrefsStore((state) => state.setNotificationPrompt)
  const prompt = usePrefsStore((state) => state.notificationPrompt)
  const notNow = () => { const count = prompt.outcome === 'deferred' ? 1 : 0; setPrompt({ ...prompt, outcome: 'deferred', deferredUntil: Date.now() + (count ? 30 : 7) * 86400000 }); onClose() }
  const enable = async () => { const granted = await requestNotificationPermission(); setPrompt({ lastAskedAt: Date.now(), deferredUntil: null, outcome: granted ? 'granted' : 'denied' }); await Haptics.selectionAsync().catch(() => undefined); onClose() }
  return <Modal transparent animationType="slide" visible={visible} onRequestClose={notNow}>
    <View style={styles.scrim}><View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border, paddingBottom: insets.bottom + spacing.xl }]}>
      <Text style={{ color: colors.foreground, fontFamily: fonts.displayBold, fontSize: 22 }}>Stay on track</Text>
      <Text style={{ color: colors.mutedForeground, fontFamily: fonts.sans, lineHeight: 22 }}>Get helpful reminders for meals, water, and your goals. You can change this any time in Settings.</Text>
      <Pressable accessibilityRole="button" onPress={() => void enable()} style={[styles.primary, { backgroundColor: colors.primary }]}><Text style={{ color: colors.primaryForeground, fontFamily: fonts.sansBold }}>Enable notifications</Text></Pressable>
      <Pressable accessibilityRole="button" onPress={notNow} style={styles.secondary}><Text style={{ color: colors.mutedForeground, fontFamily: fonts.sans }}>Not now</Text></Pressable>
    </View></View>
  </Modal>
}
const styles = StyleSheet.create({ scrim: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.55)' }, sheet: { padding: spacing.xl, gap: spacing.md, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1 }, primary: { minHeight: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }, secondary: { minHeight: 44, alignItems: 'center', justifyContent: 'center' } })
