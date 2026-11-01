import { PropsWithChildren } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { useSafeAreaInsets, type Edge } from 'react-native-safe-area-context'
import { useTheme } from '@/theme/ThemeProvider'
import { AppHeader } from '@/components/layout/AppHeader'

type Props = PropsWithChildren<{
  edges?: Edge[]
  headerShown?: boolean
  scroll?: boolean
  keyboardAware?: boolean
  contentContainerStyle?: StyleProp<ViewStyle>
  background?: 'default' | 'card'
}>

export function Screen({ children, edges = ['top', 'right', 'bottom', 'left'], headerShown = true, scroll = false, keyboardAware = false, contentContainerStyle, background = 'default' }: Props) {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const insetStyle: ViewStyle = {
    paddingTop: edges.includes('top') && !headerShown ? insets.top : 0,
    paddingRight: edges.includes('right') ? insets.right : 0,
    paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
    paddingLeft: edges.includes('left') ? insets.left : 0,
  }
  const content = scroll ? (
    <ScrollView contentContainerStyle={[styles.scroll, contentContainerStyle]} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets={keyboardAware} showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : <View style={[styles.fill, contentContainerStyle]}>{children}</View>
  return (
    <View style={[styles.fill, { backgroundColor: background === 'card' ? colors.card : colors.background }]}>
      {headerShown ? <AppHeader /> : null}
      <View style={[styles.fill, insetStyle, { backgroundColor: background === 'card' ? colors.card : colors.background }]}>
      {keyboardAware ? <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>{content}</KeyboardAvoidingView> : content}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({ fill: { flex: 1 }, scroll: { flexGrow: 1 } })
