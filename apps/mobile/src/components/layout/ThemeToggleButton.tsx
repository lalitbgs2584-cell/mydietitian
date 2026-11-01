import * as Haptics from 'expo-haptics'
import { Ionicons } from '@expo/vector-icons'
import { HeaderIconButton } from './HeaderIconButton'
import { useTheme } from '@/theme/ThemeProvider'

export function ThemeToggleButton() {
  const { mode, toggle, colors, sizes } = useTheme()
  return (
    <HeaderIconButton label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} theme`} onPress={() => { void Haptics.selectionAsync().catch(() => undefined); toggle() }}>
      <Ionicons name={mode === 'dark' ? 'sunny-outline' : 'moon-outline'} size={sizes.headerIcon} color={colors.foreground} />
    </HeaderIconButton>
  )
}
