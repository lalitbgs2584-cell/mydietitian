import { Pressable, StyleSheet, Text, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { BrandLogo } from './BrandLogo'
import { AppText } from '@/components/ui/AppText'
import { useTheme } from '@/theme/ThemeProvider'

export function BrandWordmark({ width, logoSize, onPress }: { width: number; logoSize: number; onPress: () => void }) {
  const { colors } = useTheme()
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="MyDietitian home" onPress={onPress} style={[styles.container, { width }]}>
      <View style={styles.logoAlign}>
        <BrandLogo size={logoSize} />
      </View>
      <View style={styles.brandText}>
        <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.72} style={[styles.wordmark, { color: colors.foreground }]}>
          <Text style={{ color: colors.foreground }}>My</Text><Text style={{ color: colors.goldSoft }}>Dietitian</Text>
        </Text>
        <Svg width="72%" height={8} viewBox="0 0 140 14" preserveAspectRatio="none">
          <Path d="M2 2C38 16 84 16 138 1" fill="none" stroke={colors.primary} strokeWidth={1.5} />
        </Svg>
        <AppText numberOfLines={1} variant="caption" style={[styles.tagline, { color: colors.goldSoft }]}>Eat smart. Live well.</AppText>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 7, flexShrink: 1 },
  logoAlign: { marginTop: -10 },
  brandText: { minWidth: 0, flex: 1, justifyContent: 'center' },
  wordmark: { flexShrink: 1, fontFamily: 'serif', fontSize: 22, lineHeight: 25, letterSpacing: -0.7, fontWeight: '500' },
  tagline: { fontSize: 10, lineHeight: 13, letterSpacing: 0.45, marginTop: 0 },
})
