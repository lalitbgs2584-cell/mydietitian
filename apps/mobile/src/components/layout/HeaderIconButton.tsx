import { ReactNode } from 'react'
import { GestureResponderEvent, Pressable, StyleSheet, View } from 'react-native'
import { useTheme } from '@/theme/ThemeProvider'
import { AppText } from '@/components/ui/AppText'

export function HeaderIconButton({ label, children, badge, onPress }: { label: string; children: ReactNode; badge?: number; onPress?: (event: GestureResponderEvent) => void }) {
  const { colors, sizes } = useTheme()
  const badgeText = badge && badge > 9 ? '9+' : badge
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={badge ? `${label}, ${badge} unread` : label} onPress={onPress} style={({ pressed }) => [styles.button, { width: sizes.touchMin, height: sizes.touchMin, backgroundColor: colors.card, borderColor: colors.border }, pressed && styles.pressed]}>
      {children}
      {badge ? <View style={[styles.badge, { backgroundColor: colors.coral }]}><AppText variant="caption" style={[styles.badgeText, { color: colors.primaryForeground }]}>{badgeText}</AppText></View> : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', justifyContent: 'center', borderRadius: 999, borderWidth: 1 },
  badge: { position: 'absolute', minWidth: 18, height: 18, paddingHorizontal: 4, borderRadius: 999, top: 0, right: 0, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontSize: 9, lineHeight: 11 },
  pressed: { opacity: 0.72 },
})
