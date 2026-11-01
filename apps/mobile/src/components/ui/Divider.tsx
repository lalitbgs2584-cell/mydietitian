import { StyleSheet, View } from 'react-native'
import { AppText } from '@/components/ui/AppText'
import { useTheme } from '@/theme/ThemeProvider'

export function Divider({ label = 'or' }: { label?: string }) {
  const { colors } = useTheme()
  return (
    <View style={styles.row}>
      <View style={[styles.line, { backgroundColor: colors.border }]} />
      <AppText variant="caption" tone="muted">{label}</AppText>
      <View style={[styles.line, { backgroundColor: colors.border }]} />
    </View>
  )
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', gap: 12 }, line: { flex: 1, height: 1 } })
