import { forwardRef, ReactNode, useState } from 'react'
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native'
import { AppText } from '@/components/ui/AppText'
import { InlineError } from '@/components/ui/InlineError'
import { useTheme } from '@/theme/ThemeProvider'

type Props = TextInputProps & { label: string; error?: string; helper?: string; rightAccessory?: ReactNode }

export const TextField = forwardRef<TextInput, Props>(function TextField({ label, error, helper, rightAccessory, style, onFocus, onBlur, ...props }, ref) {
  const { colors, fonts, radius } = useTheme()
  const [focused, setFocused] = useState(false)
  return (
    <View style={styles.field}>
      <AppText variant="caption" style={styles.label}>{label}</AppText>
      <View style={[
        styles.inputRow,
        { backgroundColor: colors.card, borderColor: error ? colors.coral : focused ? colors.primary : colors.border, borderRadius: radius.lg },
      ]}>
        <TextInput
          {...props}
          ref={ref}
          accessibilityLabel={label}
          accessibilityHint={error}
          onFocus={(event) => { setFocused(true); onFocus?.(event) }}
          onBlur={(event) => { setFocused(false); onBlur?.(event) }}
          placeholderTextColor={colors.mutedForeground}
          selectionColor={colors.primary}
          style={[styles.input, { color: colors.foreground, fontFamily: fonts.sans, borderRadius: radius.lg }, style]}
        />
        {rightAccessory}
      </View>
      {error ? <InlineError message={error} /> : helper ? <AppText variant="caption" tone="muted">{helper}</AppText> : null}
    </View>
  )
})

const styles = StyleSheet.create({
  field: { gap: 7 },
  label: { marginLeft: 2 },
  inputRow: { minHeight: 54, borderWidth: 1, flexDirection: 'row', alignItems: 'center', paddingRight: 12 },
  input: { flex: 1, minHeight: 52, paddingHorizontal: 14, fontSize: 16 },
})
