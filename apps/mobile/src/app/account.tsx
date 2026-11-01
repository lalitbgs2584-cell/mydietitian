import { useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { Image } from 'expo-image'
import { authClient } from '@/auth/client'
import { useSignOut } from '@/auth/hooks/useSignOut'
import { AppText } from '@/components/ui/AppText'
import { Button } from '@/components/ui/Button'
import { Screen } from '@/components/ui/Screen'
import { StructuredCard } from '@/components/ui/StructuredCard'
import { useTheme } from '@/theme/ThemeProvider'

export default function AccountScreen() {
  const session = authClient.useSession()
  const signOut = useSignOut()
  const [confirming, setConfirming] = useState(false)
  const { colors, fonts, sizes, spacing } = useTheme()
  const user = session.data?.user
  const name = user?.name?.trim() || 'Your account'
  const initial = name.charAt(0).toUpperCase()

  return (
    <Screen scroll contentContainerStyle={styles.content}>
      <StructuredCard style={styles.profileCard}>
        {user?.image ? <Image source={{ uri: user.image }} contentFit="cover" style={[styles.avatar, { width: sizes.headerAvatar * 2, height: sizes.headerAvatar * 2 }]} /> : <View style={[styles.avatar, { width: sizes.headerAvatar * 2, height: sizes.headerAvatar * 2, backgroundColor: colors.primary }]}><AppText variant="h2" style={{ color: colors.primaryForeground }}>{initial}</AppText></View>}
        <View style={styles.profileText}>
          <AppText variant="bodyLg" style={{ fontFamily: fonts.sansBold }}>{name}</AppText>
          <AppText variant="body" tone="muted">{user?.email || ''}</AppText>
        </View>
      </StructuredCard>
      {confirming ? <StructuredCard style={{ gap: spacing.md }}>
        <AppText variant="body" style={{ fontFamily: fonts.sansBold }}>Sign out of MyDietitian?</AppText>
        <AppText variant="body" tone="muted">You can sign back in at any time.</AppText>
        <View style={styles.actions}>
          <Button label="Cancel" variant="secondary" onPress={() => setConfirming(false)} />
          <Button label="Sign out" onPress={() => void signOut()} />
        </View>
      </StructuredCard> : <Pressable accessibilityRole="button" onPress={() => setConfirming(true)} style={[styles.signOut, { borderColor: colors.border }]}>
        <AppText variant="body" style={{ color: colors.coral, fontFamily: fonts.sansBold }}>Sign out</AppText>
      </Pressable>}
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 16 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  profileText: { flex: 1, gap: 4 },
  signOut: { minHeight: 52, borderWidth: 1, borderRadius: 18, justifyContent: 'center', paddingHorizontal: 18 },
  actions: { flexDirection: 'row', gap: 12 },
})
