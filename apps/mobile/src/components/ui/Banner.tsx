import { StyleSheet, View } from 'react-native'
import { AppText } from '@/components/ui/AppText'
import { alpha } from '@/theme/colors'
import { useTheme } from '@/theme/ThemeProvider'

type Tone = 'error' | 'info' | 'success'
export function Banner({ message, tone = 'info', children }: { message?: string; tone?: Tone; children?: React.ReactNode }) {
  const { colors } = useTheme()
  const color = tone === 'error' ? colors.coral : tone === 'success' ? colors.green : colors.goldSoft
  return (
    <View accessibilityRole="alert" style={[styles.banner, { borderColor: alpha(color, 0.34), backgroundColor: alpha(color, 0.08) }]}>
      {message ? <AppText variant="body" style={{ color }}>{message}</AppText> : children}
    </View>
  )
}

const styles = StyleSheet.create({ banner: { borderWidth: 1, borderRadius: 14, padding: 12 } })
