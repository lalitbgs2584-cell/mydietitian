import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type AuthMethod = 'email' | 'google' | 'apple'
export type ThemeMode = 'light' | 'dark'
export type AuthNotice = 'expired' | 'banned' | null
export type NotificationPromptState = {
  lastAskedAt: number | null
  deferredUntil: number | null
  outcome: 'granted' | 'denied' | 'deferred' | null
}

export interface PushDeviceRecord {
  token: string
  userId: string
  lastSyncedAt: number
}

export interface LastKnownUser {
  userId: string
  onboarded: boolean
}

interface PreferencesState {
  hasSeenWelcome: boolean
  lastAuthMethod: AuthMethod | null
  themeMode: ThemeMode | null
  notificationPrompt: NotificationPromptState
  pushDevice: PushDeviceRecord | null
  lastKnownUser: LastKnownUser | null
  activityByUser: Record<string, string[]>
  activityTrackingStartByUser: Record<string, string>
  authNotice: AuthNotice
  hydrated: boolean
  setHasSeenWelcome: (value: boolean) => void
  setLastAuthMethod: (method: AuthMethod) => void
  setThemeMode: (mode: ThemeMode) => void
  setNotificationPrompt: (value: NotificationPromptState) => void
  setLastKnownUser: (value: LastKnownUser | null) => void
  recordAppActivity: (userId: string, localDate: string) => void
  setPushDevice: (value: PushDeviceRecord | null) => void
  setAuthNotice: (value: AuthNotice) => void
  consumeAuthNotice: () => AuthNotice
  clearUserScopedData: () => void
}

const initialPreferences = {
  hasSeenWelcome: false,
  lastAuthMethod: null as AuthMethod | null,
  themeMode: null as ThemeMode | null,
  notificationPrompt: {
    lastAskedAt: null as number | null,
    deferredUntil: null as number | null,
    outcome: null as 'granted' | 'denied' | 'deferred' | null,
  },
  pushDevice: null as PushDeviceRecord | null,
  lastKnownUser: null as LastKnownUser | null,
  activityByUser: {} as Record<string, string[]>,
  activityTrackingStartByUser: {} as Record<string, string>,
  authNotice: null as AuthNotice,
  hydrated: false,
}

export const usePrefsStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      ...initialPreferences,
      setHasSeenWelcome: (hasSeenWelcome) => set({ hasSeenWelcome }),
      setLastAuthMethod: (lastAuthMethod) => set({ lastAuthMethod }),
      setThemeMode: (themeMode) => set({ themeMode }),
      setNotificationPrompt: (notificationPrompt) => set({ notificationPrompt }),
      setLastKnownUser: (lastKnownUser) => set({ lastKnownUser }),
      recordAppActivity: (userId, localDate) => set((state) => {
        const dates = state.activityByUser[userId] ?? []
        const trackingStart = state.activityTrackingStartByUser[userId] ?? [...dates, localDate].sort()[0]
        if (dates.includes(localDate) && state.activityTrackingStartByUser[userId]) return state
        return {
          activityByUser: dates.includes(localDate)
            ? state.activityByUser
            : { ...state.activityByUser, [userId]: [...dates, localDate].slice(-400) },
          activityTrackingStartByUser: { ...state.activityTrackingStartByUser, [userId]: trackingStart },
        }
      }),
      setPushDevice: (pushDevice) => set({ pushDevice }),
      setAuthNotice: (authNotice) => set({ authNotice }),
      consumeAuthNotice: () => {
        const notice = get().authNotice
        set({ authNotice: null })
        return notice
      },
      clearUserScopedData: () => set({ lastKnownUser: null, pushDevice: null, authNotice: null }),
    }),
    {
      name: 'mydietitian.prefs.v1',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hasSeenWelcome: state.hasSeenWelcome,
        lastAuthMethod: state.lastAuthMethod,
        themeMode: state.themeMode,
        notificationPrompt: state.notificationPrompt,
        pushDevice: state.pushDevice,
        lastKnownUser: state.lastKnownUser,
        activityByUser: state.activityByUser,
        activityTrackingStartByUser: state.activityTrackingStartByUser,
      }),
      onRehydrateStorage: () => async (state, error) => {
        try {
          if (!error) {
            const [legacyOnboarded, legacyTheme] = await AsyncStorage.multiGet(['onboarded', 'theme-mode'])
            const updates: Partial<PreferencesState> = {}
            if (legacyOnboarded?.[1] === 'true' && !state?.hasSeenWelcome) {
              updates.hasSeenWelcome = true
            }
            if ((legacyTheme?.[1] === 'light' || legacyTheme?.[1] === 'dark') && !state?.themeMode) {
              updates.themeMode = legacyTheme[1]
            }
            if (Object.keys(updates).length > 0) usePrefsStore.setState(updates)
            await AsyncStorage.multiRemove(['onboarded', 'theme-mode'])
          }
        } finally {
          usePrefsStore.setState({ hydrated: true })
        }
      },
    },
  ),
)
