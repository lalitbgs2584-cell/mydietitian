import { ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'
import { AppText } from '@/components/ui/AppText'
import { Screen } from '@/components/ui/Screen'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { useTheme } from '@/theme/ThemeProvider'

export function AuthScaffold({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const { colors } = useTheme()
  return (
    <Screen headerShown={false} scroll keyboardAware contentContainerStyle={styles.content}>
      <View style={styles.logo}><BrandLogo size={78} /></View>
      <AppText variant="h1" style={styles.title}>{title}</AppText>
      {subtitle ? <AppText variant="body" tone="muted" style={styles.subtitle}>{subtitle}</AppText> : null}
      <View style={[styles.rule, { backgroundColor: colors.border }]} />
      {children}
    </Screen>
  )
}

const styles = StyleSheet.create({ content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 28, gap: 18 }, logo: { alignItems: 'center', marginBottom: 4 }, title: { textAlign: 'center' }, subtitle: { textAlign: 'center', marginTop: -10 }, rule: { height: 1, opacity: 0.5, marginVertical: 2 } })
