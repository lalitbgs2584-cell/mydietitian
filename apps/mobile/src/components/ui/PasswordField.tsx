import { ComponentProps, useState } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import { TextField } from '@/components/ui/TextField'
import { AppText } from '@/components/ui/AppText'

type Props = Omit<ComponentProps<typeof TextField>, 'secureTextEntry' | 'rightAccessory'>

export function PasswordField(props: Props) {
  const [visible, setVisible] = useState(false)
  return (
    <TextField
      {...props}
      secureTextEntry={!visible}
      autoCapitalize="none"
      rightAccessory={(
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          accessibilityState={{ selected: visible }}
          hitSlop={8}
          onPress={() => setVisible((value) => !value)}
          style={styles.toggle}
        >
          <AppText variant="caption" tone="gold">{visible ? 'Hide' : 'Show'}</AppText>
        </Pressable>
      )}
    />
  )
}

const styles = StyleSheet.create({ toggle: { minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' } })
