import { useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { GlassView } from 'expo-glass-effect'
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { authClient } from '@/auth/client'
import { useTheme } from '@/theme/ThemeProvider'
import { AppText } from '@/components/ui/AppText'
import { WeekCalendar } from './WeekCalendar'
import { DailyMetricCards, EnergySummaryCard, MealSuggestionCard, NutrientCards, PantryStatusCard } from './DashboardCards'
import { alpha } from '@/theme/colors'
import { useMe } from '@/auth/hooks/useMe'
import { ShimmerBlock } from '@/components/ui/ShimmerBlock'

const destinations = [
  { label: 'Home', icon: 'home-outline' as const },
  { label: 'Plan', icon: 'calendar-outline' as const },
  { label: 'Pantry', icon: 'cube-outline' as const },
]

export function HomeDashboard() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const session = authClient.useSession()
  const profile = useMe(session.data?.user.id)
  const { colors, fonts, spacing, radius, shadow, sizes, mode } = useTheme()
  const [activeDestination, setActiveDestination] = useState('Home')
  const firstName = session.data?.user.name?.trim().split(/\s+/)[0] || 'there'
  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Good morning,' : now.getHours() < 17 ? 'Good afternoon,' : 'Good evening,'
  const dateLabel = new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }).format(now)
  const profileLoading = Boolean(session.data?.user.id && profile.isPending)

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { padding: spacing.lg, gap: spacing.md }]} showsVerticalScrollIndicator={false}>
        {activeDestination !== 'Home' ? <View style={styles.emptyTab}>
          <AppText variant="h2">{activeDestination}</AppText>
          <AppText variant="body" tone="muted">This section is coming soon.</AppText>
        </View> : profileLoading ? <HomeDashboardSkeleton /> : <>
        <WeekCalendar />
        <View style={styles.greetingRow}>
          <View style={styles.greeting}>
            <AppText variant="caption" style={{ color: colors.primary, letterSpacing: 1, fontFamily: fonts.sansBold }}>{dateLabel.toUpperCase()}</AppText>
            <AppText variant="h2">{greeting}</AppText>
            <AppText variant="display" style={{ color: colors.goldSoft, marginTop: -spacing.xs }}>{firstName}</AppText>
          </View>
          <View accessibilityLabel="Streak tracking will begin when connected to your activity data" style={[styles.streakBadge, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md }]}>
            <View style={[styles.streakIcon, { backgroundColor: alpha(colors.primary, 0.14), borderRadius: radius.md }]}>
              <Ionicons name="flame" size={24} color={colors.primary} />
            </View>
            <AppText variant="caption" style={{ color: colors.goldSoft, fontFamily: fonts.sansBold, letterSpacing: 0.8 }}>STREAK</AppText>
            <AppText variant="title" style={{ color: colors.foreground }}>Start today</AppText>
          </View>
        </View>

          <EnergySummaryCard />
          <NutrientCards />
          <DailyMetricCards />
          <View style={styles.sectionHeading}>
            <AppText variant="bodyLg" style={{ fontFamily: fonts.sansBold }}>Your smart pick</AppText>
            <Pressable accessibilityRole="button" onPress={() => setActiveDestination('Plan')}><AppText variant="caption" style={{ color: colors.goldSoft }}>View log ›</AppText></Pressable>
          </View>
          <MealSuggestionCard />
          <PantryStatusCard />
          <AppText variant="caption" tone="muted" style={styles.previewNote}>Preview · Sample nutrition values</AppText>
        </>}
      </ScrollView>

      <View style={[styles.navDock, { marginHorizontal: spacing.lg, marginBottom: Math.max(insets.bottom, spacing.md) + spacing.sm }]}>
        <GlassView glassEffectStyle="regular" tintColor={alpha(colors.primary, 0.1)} colorScheme={mode} isInteractive style={[styles.tabBar, { height: sizes.tabBarHeight, marginTop: spacing.md, paddingHorizontal: spacing.sm, backgroundColor: alpha(colors.primary, 0.06), borderColor: alpha(colors.primary, 0.48), borderRadius: radius.pill, ...shadow.nav }]}>
          {destinations.slice(0, 2).map((destination) => <TabItem key={destination.label} {...destination} selected={activeDestination === destination.label} onPress={() => { setActiveDestination(destination.label); void Haptics.selectionAsync().catch(() => undefined) }} />)}
          <View style={[styles.scanSlot, { width: sizes.scanFab + spacing.xxl, paddingBottom: spacing.xs }]}>
            <AppText variant="caption" style={{ color: colors.goldSoft, fontFamily: fonts.sansBold, textAlign: 'center' }}>Scan</AppText>
          </View>
          {destinations.slice(2).map((destination) => <TabItem key={destination.label} {...destination} selected={activeDestination === destination.label} onPress={() => { setActiveDestination(destination.label); void Haptics.selectionAsync().catch(() => undefined) }} />)}
          <TabItem label="Profile" icon="person-outline" selected={false} onPress={() => router.push('/account')} />
        </GlassView>
        <Pressable accessibilityRole="button" accessibilityLabel="Open meal camera" onPress={() => router.push('/camera')} onPressIn={() => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined)} style={[styles.scanButton, { width: sizes.scanFab + spacing.md, height: sizes.scanFab + spacing.md, marginLeft: -(sizes.scanFab + spacing.md) / 2, backgroundColor: colors.primary, borderColor: colors.card, shadowColor: colors.primary }]}>
          <Ionicons name="camera-outline" size={sizes.headerIcon + spacing.sm} color={colors.primaryForeground} style={styles.scanIcon} />
        </Pressable>
      </View>
    </View>
  )
}

function HomeDashboardSkeleton() {
  const { spacing, radius } = useTheme()
  return (
    <View accessibilityLabel="Loading your home screen" accessibilityState={{ busy: true }} style={{ gap: spacing.md }}>
      <View style={{ flexDirection: 'row', gap: spacing.xs }}>
        {Array.from({ length: 7 }, (_, index) => <ShimmerBlock key={index} style={{ height: 54, flex: 1, borderRadius: radius.lg }} />)}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md }}>
        <View style={{ flex: 1, gap: spacing.sm }}>
          <ShimmerBlock style={{ width: 126, height: 12, borderRadius: radius.sm }} />
          <ShimmerBlock style={{ width: '76%', height: 24, borderRadius: radius.sm }} />
          <ShimmerBlock style={{ width: '58%', height: 32, borderRadius: radius.sm }} />
        </View>
        <ShimmerBlock style={{ width: 100, height: 112, borderRadius: radius.lg }} />
      </View>
      <ShimmerBlock style={{ height: 116, borderRadius: radius.xl }} />
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {Array.from({ length: 3 }, (_, index) => <ShimmerBlock key={index} style={{ height: 96, flex: 1, borderRadius: radius.lg }} />)}
      </View>
      <ShimmerBlock style={{ height: 116, borderRadius: radius.xl }} />
      <ShimmerBlock style={{ height: 64, borderRadius: radius.lg }} />
    </View>
  )
}

function TabItem({ label, icon, selected, onPress }: { label: string; icon: 'home-outline' | 'calendar-outline' | 'cube-outline' | 'person-outline'; selected: boolean; onPress: () => void }) {
  const { colors, fonts } = useTheme()
  const activeProgress = useSharedValue(selected ? 1 : 0)
  const selectedIcon = { 'home-outline': 'home', 'calendar-outline': 'calendar', 'cube-outline': 'cube', 'person-outline': 'person' } as const
  useEffect(() => {
    activeProgress.value = withSpring(selected ? 1 : 0, { damping: 14, stiffness: 250, mass: 0.65 })
  }, [activeProgress, selected])
  const highlightStyle = useAnimatedStyle(() => ({
    opacity: activeProgress.value,
    transform: [
      { translateY: interpolate(activeProgress.value, [0, 1], [-3, 0]) },
      { scaleX: interpolate(activeProgress.value, [0, 1], [0.7, 1]) },
    ],
  }))
  const iconMotionStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(activeProgress.value, [0, 1], [0, -2]) },
      { scale: interpolate(activeProgress.value, [0, 1], [1, 1.08]) },
    ],
  }))
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} accessibilityLabel={label} onPress={onPress} style={styles.tabItem}>
      <View style={styles.tabIconLabel}>
      <Animated.View style={iconMotionStyle}>
        <Ionicons name={selected ? selectedIcon[icon] : icon} size={20} color={selected ? colors.primary : colors.mutedForeground} />
      </Animated.View>
      </View>
      <AppText numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.78} variant="caption" style={[styles.tabLabel, { color: selected ? colors.primary : colors.mutedForeground, fontFamily: fonts.sansBold }]}>{label}</AppText>
      <Animated.View style={[styles.activeMark, { backgroundColor: colors.primary }, highlightStyle]} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  greetingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  greeting: { gap: 2 },
  streakBadge: { alignItems: 'center', justifyContent: 'center', gap: 4, minWidth: 98, borderWidth: StyleSheet.hairlineWidth },
  streakIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  previewNote: { textAlign: 'center' },
  emptyTab: { flex: 1, minHeight: 240, alignItems: 'center', justifyContent: 'center', gap: 8 },
  navDock: { position: 'relative' },
  tabBar: { borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tabItem: { flex: 1, flexBasis: 0, minWidth: 0, minHeight: 48, alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabIconLabel: { minHeight: 22, minWidth: 28, alignItems: 'center', justifyContent: 'center' },
  tabLabel: { alignSelf: 'stretch', flexShrink: 1, textAlign: 'center' },
  activeMark: { width: 12, height: 3, borderRadius: 2, position: 'absolute', bottom: 0 },
  scanButton: { position: 'absolute', top: -14, left: '50%', alignItems: 'center', justifyContent: 'center', borderRadius: 21, borderWidth: 4, transform: [{ rotate: '45deg' }], shadowOpacity: 0.58, shadowRadius: 16, shadowOffset: { width: 0, height: 5 }, elevation: 10 },
  scanIcon: { transform: [{ rotate: '-45deg' }] },
  scanSlot: { height: '100%', justifyContent: 'flex-end' },
})
