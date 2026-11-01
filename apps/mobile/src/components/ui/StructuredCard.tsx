import { PropsWithChildren } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { useTheme } from '@/theme/ThemeProvider'

type Props = PropsWithChildren<{
  tone?: 'default' | 'success'
  style?: StyleProp<ViewStyle>
  accessibilityLabel?: string
}>

export function StructuredCard({ children, tone = 'default', style, accessibilityLabel }: Props) {
  const { colors, radius, spacing } = useTheme()
  return (
    <View accessibilityLabel={accessibilityLabel} style={[
      styles.card,
      { backgroundColor: tone === 'success' ? colors.greenDeep : colors.card, borderColor: tone === 'success' ? colors.green : colors.border, borderRadius: radius.xl, padding: spacing.md },
      style,
    ]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({ card: { borderWidth: 1 } })
