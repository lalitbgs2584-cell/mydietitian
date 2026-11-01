import { StyleSheet, View } from 'react-native'
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, PASSWORD_REGEX } from '@mydietitian/auth/password-policy'
import { AppText } from '@/components/ui/AppText'
import { useTheme } from '@/theme/ThemeProvider'

const criteria = [
  { label: '8+ characters', test: (value: string) => value.length >= PASSWORD_MIN_LENGTH && value.length <= PASSWORD_MAX_LENGTH },
  { label: 'Uppercase letter', test: (value: string) => PASSWORD_REGEX.UPPERCASE.test(value) },
  { label: 'Lowercase letter', test: (value: string) => PASSWORD_REGEX.LOWERCASE.test(value) },
  { label: 'Number', test: (value: string) => PASSWORD_REGEX.NUMBER.test(value) },
  { label: 'Special character', test: (value: string) => PASSWORD_REGEX.SPECIAL.test(value) },
]

export function PasswordChecklist({ password }: { password: string }) {
  const { colors } = useTheme()
  const complete = criteria.every(({ test }) => test(password))
  if (complete) return <AppText variant="caption" tone="success">✓ Password meets all requirements</AppText>
  return (
    <View accessibilityLabel="Password requirements" style={styles.list}>
      {criteria.map(({ label, test }) => {
        const passed = test(password)
        return <AppText key={label} variant="caption" style={{ color: passed ? colors.green : colors.mutedForeground }}>{passed ? '✓' : '○'} {label}</AppText>
      })}
    </View>
  )
}

const styles = StyleSheet.create({ list: { gap: 4, paddingLeft: 2 } })
