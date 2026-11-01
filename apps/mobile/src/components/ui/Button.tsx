import { ReactNode } from 'react'
import { ActivityIndicator, Pressable, PressableProps, StyleSheet, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import { AppText } from '@/components/ui/AppText'
import { useTheme } from '@/theme/ThemeProvider'

type Variant = 'primary' | 'secondary' | 'ghost' | 'social' | 'apple'
type Props = Omit<PressableProps, 'children'> & {
  label: string
  variant?: Variant
  loading?: boolean
  leftIcon?: ReactNode
}

export function Button({ label, variant = 'primary', loading = false, disabled = false, leftIcon, onPress, style, ...props }: Props) {
  const { colors } = useTheme()
  const isDisabled = disabled || loading
  const fill = variant === 'primary' ? colors.primary : variant === 'apple' ? colors.foreground : variant === 'social' || variant === 'secondary' ? colors.card : 'transparent'
  const foreground = variant === 'primary' || variant === 'apple' ? colors.primaryForeground : colors.foreground
  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={(event) => {
        if (isDisabled) return
        void Haptics.selectionAsync().catch(() => undefined)
        onPress?.(event)
      }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: fill, borderColor: variant === 'primary' || variant === 'ghost' ? 'transparent' : colors.border },
        variant !== 'primary' && variant !== 'ghost' && variant !== 'apple' && styles.outlined,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        typeof style === 'function' ? style({ pressed, hovered: false }) : style,
      ]}
    >
      {loading ? <ActivityIndicator color={foreground} /> : (
        <View style={styles.row}>
          {leftIcon}
          <AppText variant="button" style={{ color: foreground }}>{label}</AppText>
        </View>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: { minHeight: 54, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  outlined: { borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
})
