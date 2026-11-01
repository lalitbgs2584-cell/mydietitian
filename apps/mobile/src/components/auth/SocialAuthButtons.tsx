import { useEffect, useState } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import * as AppleAuthentication from 'expo-apple-authentication'
import { useSocialSignIn, type SocialProvider } from '@/auth/hooks/useSocialSignIn'
import { Button } from '@/components/ui/Button'
import { AppText } from '@/components/ui/AppText'
import { useTheme } from '@/theme/ThemeProvider'

type Props = { compact?: boolean; lastUsed?: SocialProvider | null; onError?: (message: string) => void; providers?: SocialProvider[] }

export function SocialAuthButtons({ compact = false, lastUsed, onError, providers = ['google', 'apple'] }: Props) {
  const auth = useSocialSignIn()
  const { colors } = useTheme()
  const [appleAvailable, setAppleAvailable] = useState(false)

  useEffect(() => {
    let mounted = true
    if (auth.appleEnabled && Platform.OS === 'ios') {
      AppleAuthentication.isAvailableAsync().then((available) => { if (mounted) setAppleAvailable(available) }).catch(() => undefined)
    }
    return () => { mounted = false }
  }, [auth.appleEnabled])

  const report = (error: Awaited<ReturnType<typeof auth.signInGoogle>>) => {
    if (error && error.kind !== 'cancelled') onError?.(error.message)
  }
  const badge = (provider: SocialProvider) => lastUsed === provider ? <AppText variant="caption" style={{ color: colors.goldSoft }}>Last used</AppText> : null

  return (
    <View style={[styles.stack, compact && styles.compact]}>
      {providers.map((provider) => {
        if (provider === 'apple' && !appleAvailable) return null
        const isApple = provider === 'apple'
        const label = compact ? (isApple ? 'Apple' : 'Google') : `Continue with ${isApple ? 'Apple' : 'Google'}`
        const onPress = isApple ? auth.signInApple : auth.signInGoogle
        return (
          <View key={provider} style={styles.action}>
            <Button
              label={label}
              variant={isApple ? 'apple' : 'social'}
              loading={auth.loadingProvider === provider}
              disabled={auth.loadingProvider !== null}
              leftIcon={<AppText variant="h2" style={{ color: isApple ? colors.primaryForeground : colors.foreground }}>{isApple ? '' : 'G'}</AppText>}
              onPress={() => { void onPress().then(report) }}
            />
            {badge(provider)}
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({ stack: { gap: 10 }, compact: { gap: 8 }, action: { gap: 4 }, })
