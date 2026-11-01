import { useEffect, useMemo, useRef, useState } from 'react'
import { AppState, Pressable, StyleSheet, View } from 'react-native'
import { AppText } from '@/components/ui/AppText'
import { useTheme } from '@/theme/ThemeProvider'
import { authClient } from '@/auth/client'
import { usePrefsStore } from '@/store/prefs.store'
import { alpha } from '@/theme/colors'

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const noActivityDates: string[] = []

export function WeekCalendar() {
  const { colors, fonts, spacing, radius } = useTheme()
  const session = authClient.useSession()
  const userId = session.data?.user.id ?? ''
  const activityDates = usePrefsStore((state) => state.activityByUser[userId] ?? noActivityDates)
  const trackingStart = usePrefsStore((state) => state.activityTrackingStartByUser[userId])
  const [today, setToday] = useState(() => new Date())
  const todayKey = dateKey(today)
  const previousTodayKey = useRef(todayKey)
  const days = useMemo(() => {
    const mondayOffset = (today.getDay() + 6) % 7
    const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - mondayOffset)
    return Array.from({ length: 7 }, (_, index) => new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index))
  }, [todayKey])
  const [selected, setSelected] = useState(todayKey)

  useEffect(() => {
    const updateToday = () => setToday(new Date())
    const interval = setInterval(updateToday, 60_000)
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') updateToday()
    })
    return () => {
      clearInterval(interval)
      subscription.remove()
    }
  }, [])

  useEffect(() => {
    const previousKey = previousTodayKey.current
    previousTodayKey.current = todayKey
    setSelected((current) => current === previousKey ? todayKey : current)
  }, [todayKey])

  return (
    <View style={{ gap: spacing.xs }}>
      <View accessibilityRole="list" style={[styles.row, { gap: spacing.xs }]}>
        {days.map((day) => {
        const key = dateKey(day)
        const isSelected = selected === key
        const isUsed = activityDates.includes(key)
        const isPastUnused = Boolean(trackingStart && key >= trackingStart && key < todayKey && !isUsed)
        const dayBackground = isUsed ? colors.primary : isPastUnused ? alpha(colors.coral, 0.12) : colors.card
        const dayBorder = isUsed ? colors.primary : isPastUnused ? alpha(colors.coral, 0.55) : colors.border
        const dayText = isUsed ? colors.primaryForeground : isPastUnused ? colors.coral : colors.foreground
        const weekday = new Intl.DateTimeFormat('en', { weekday: 'short' }).format(day)
        return (
          <Pressable key={key} accessibilityRole="button" accessibilityLabel={`${new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(day)}, ${isUsed ? 'app used' : isPastUnused ? 'no app activity' : key < (trackingStart ?? todayKey) ? 'not tracked' : 'upcoming'}`} accessibilityState={{ selected: isSelected }} onPress={() => setSelected(key)} style={[styles.day, { backgroundColor: dayBackground, borderColor: isSelected ? colors.goldSoft : dayBorder, borderWidth: isSelected ? 2 : 1, borderRadius: radius.lg }]}>
            <AppText variant="caption" style={{ color: isUsed || isPastUnused ? dayText : colors.mutedForeground, fontFamily: fonts.sansBold }}>{weekday}</AppText>
            <AppText variant="body" style={{ color: dayText, fontFamily: fonts.sansBold }}>{day.getDate()}</AppText>
          </Pressable>
        )
        })}
      </View>
      <View style={[styles.legend, { gap: spacing.md }]}>
        <LegendItem color={colors.primary} label="Used" />
        <LegendItem color={colors.coral} label="No activity" />
        <LegendItem color={colors.border} label="Not tracked" />
      </View>
    </View>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  const { colors, fonts, spacing } = useTheme()
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}><View style={[styles.legendDot, { backgroundColor: color }]} /><AppText variant="caption" style={{ color: colors.mutedForeground, fontFamily: fonts.sans }}>{label}</AppText></View>
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', justifyContent: 'space-between' }, day: { flex: 1, minHeight: 52, alignItems: 'center', justifyContent: 'center', gap: 2, borderWidth: 1 }, legend: { flexDirection: 'row', justifyContent: 'flex-end' }, legendDot: { width: 7, height: 7, borderRadius: 4 } })
