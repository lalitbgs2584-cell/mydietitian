import { StyleSheet, useWindowDimensions, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { BrandWordmark } from '@/components/brand/BrandWordmark'
import { authClient } from '@/auth/client'
import { useTheme } from '@/theme/ThemeProvider'
import { HeaderIconButton } from './HeaderIconButton'
import { HeaderAvatar } from './HeaderAvatar'
import { ThemeToggleButton } from './ThemeToggleButton'
import { useUnreadCount } from '@/notifications/useUnreadCount'
import { alpha } from '@/theme/colors'

export function AppHeader({ headerShown = true }: { headerShown?: boolean }) {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const session = authClient.useSession()
  const { colors, spacing, sizes } = useTheme()
  const { width } = useWindowDimensions()
  const unreadCount = useUnreadCount()
  if (!headerShown) return null
  const user = session.data?.user
  const maxAvailableWidth = width - spacing.lg * 2 - (sizes.touchMin * 2 + sizes.headerAvatar + spacing.md) - spacing.sm
  const brandWidth = Math.max(160, Math.min(214, maxAvailableWidth))
  const brandLogoSize = Math.min(60, Math.max(54, Math.round(brandWidth * 0.28)))

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm, backgroundColor: colors.surfaceHigh, borderColor: alpha(colors.primary, 0.38) }]}>
      <View style={[styles.row, { height: sizes.headerHeight + spacing.md, paddingHorizontal: spacing.lg }]}>
        <BrandWordmark width={brandWidth} logoSize={brandLogoSize} onPress={() => router.replace('/(tabs)')} />
        <View style={styles.actions}>
          <HeaderIconButton label="Notifications" badge={unreadCount || undefined} onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={sizes.headerIcon} color={colors.foreground} />
          </HeaderIconButton>
          <ThemeToggleButton />
          <HeaderAvatar image={user?.image} name={user?.name || 'My account'} onPress={() => router.push('/account')} />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { borderBottomWidth: 1, shadowColor: '#000', shadowOpacity: 0.22, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 5, zIndex: 2 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  actions: { flexShrink: 0, flexDirection: 'row', alignItems: 'center', gap: 6 },
})
