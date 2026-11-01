import { Pressable, StyleSheet, View } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import { env } from '@/lib/env'
import { AppText } from '@/components/ui/AppText'
import { useTheme } from '@/theme/ThemeProvider'

export function LegalFooter() {
  const { colors } = useTheme()
  if (!env.TERMS_URL && !env.PRIVACY_URL) return null
  const open = (url: string | undefined) => { if (url) void WebBrowser.openBrowserAsync(url) }
  return (
    <View style={styles.row}>
      <AppText variant="caption" tone="muted">By continuing you agree to our </AppText>
      {env.TERMS_URL ? <Pressable accessibilityRole="link" onPress={() => open(env.TERMS_URL)} hitSlop={6}><AppText variant="caption" style={{ color: colors.goldSoft }}>Terms</AppText></Pressable> : null}
      {env.TERMS_URL && env.PRIVACY_URL ? <AppText variant="caption" tone="muted"> and </AppText> : null}
      {env.PRIVACY_URL ? <Pressable accessibilityRole="link" onPress={() => open(env.PRIVACY_URL)} hitSlop={6}><AppText variant="caption" style={{ color: colors.goldSoft }}>Privacy Policy</AppText></Pressable> : null}
    </View>
  )
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', paddingHorizontal: 6 } })
