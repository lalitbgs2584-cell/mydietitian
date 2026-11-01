import { ReactNode } from 'react'
import { Text, TextProps } from 'react-native'
import { useTheme } from '@/theme/ThemeProvider'

type Variant = 'display' | 'h1' | 'h2' | 'title' | 'body' | 'bodyLg' | 'caption' | 'link' | 'button'
type Tone = 'default' | 'muted' | 'gold' | 'error' | 'success'
type Props = TextProps & { variant?: Variant; tone?: Tone; children: ReactNode }

export function AppText({ variant = 'body', tone = 'default', style, children, ...props }: Props) {
  const { colors, fonts, fontSize } = useTheme()
  const color = {
    default: colors.foreground,
    muted: colors.mutedForeground,
    gold: colors.goldSoft,
    error: colors.coral,
    success: colors.green,
  }[tone]
  const fontFamily = variant === 'display' || variant === 'h1' || variant === 'h2' || variant === 'title'
    ? fonts.displayBold
    : variant === 'button' ? fonts.sansBold : fonts.sans
  const size = {
    display: fontSize.display,
    h1: fontSize.h1,
    h2: fontSize.h2,
    title: fontSize.title,
    body: fontSize.bodyLg,
    bodyLg: fontSize.bodyLg,
    caption: fontSize.caption,
    link: fontSize.body,
    button: fontSize.body,
  }[variant]
  return (
    <Text
      {...props}
      maxFontSizeMultiplier={variant === 'display' || variant === 'h1' ? 1.3 : props.maxFontSizeMultiplier}
      style={[{ color, fontFamily, fontSize: size }, style]}
    >
      {children}
    </Text>
  )
}
