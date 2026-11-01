import { Pressable, StyleSheet, View } from 'react-native'
import { Image } from 'expo-image'
import { AppText } from '@/components/ui/AppText'
import { useTheme } from '@/theme/ThemeProvider'

export function HeaderAvatar({ image, name, onPress }: { image?: string | null; name?: string | null; onPress: () => void }) {
  const { colors, sizes } = useTheme()
  const initial = name?.trim().charAt(0).toUpperCase() || '?'
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Open account" onPress={onPress} style={({ pressed }) => [styles.frame, { width: sizes.headerAvatar, height: sizes.headerAvatar, borderColor: colors.primary }, pressed && styles.pressed]}>
      {image ? <Image source={{ uri: image }} contentFit="cover" style={styles.image} /> : <View style={[styles.fallback, { backgroundColor: colors.primary }]}><AppText variant="bodyLg" style={{ color: colors.primaryForeground }}>{initial}</AppText></View>}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  frame: { borderRadius: 999, borderWidth: 1.5, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.75 },
})
