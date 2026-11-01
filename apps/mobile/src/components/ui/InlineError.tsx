import { StyleSheet } from 'react-native'
import { AppText } from '@/components/ui/AppText'
import { useTheme } from '@/theme/ThemeProvider'

export function InlineError({ message }: { message: string }) {
  const { colors } = useTheme()
  return <AppText accessibilityRole="alert" variant="caption" tone="error" style={[styles.error, { color: colors.coral }]}>{message}</AppText>
}

const styles = StyleSheet.create({ error: { marginTop: 1 } })
