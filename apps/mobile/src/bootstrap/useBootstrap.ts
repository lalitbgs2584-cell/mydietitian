import { usePrefsStore } from '@/store/prefs.store'
import { Manrope_500Medium, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope'
import { DMSans_600SemiBold, DMSans_700Bold } from '@expo-google-fonts/dm-sans'
import { useFonts } from 'expo-font'
import { Ionicons } from '@expo/vector-icons'

export interface BootstrapState {
  ready: boolean
}

export function useBootstrap(): BootstrapState {
  const [fontsLoaded, fontError] = useFonts({
    Manrope_500Medium,
    Manrope_700Bold,
    Manrope_800ExtraBold,
    DMSans_600SemiBold,
    DMSans_700Bold,
    ...Ionicons.font,
  })
  const preferencesHydrated = usePrefsStore((state) => state.hydrated)

  return { ready: preferencesHydrated && (fontsLoaded || fontError !== null) }
}
