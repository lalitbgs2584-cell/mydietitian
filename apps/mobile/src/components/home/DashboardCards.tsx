import { StyleSheet, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Svg, { Circle } from 'react-native-svg'
import { AppText } from '@/components/ui/AppText'
import { StructuredCard } from '@/components/ui/StructuredCard'
import { useTheme } from '@/theme/ThemeProvider'
import { alpha } from '@/theme/colors'

export function EnergySummaryCard() {
  const { colors, fonts, sizes } = useTheme()
  return (
    <StructuredCard accessibilityLabel="Today's energy summary" style={styles.energy}>
      <View style={styles.ring}>
        <Svg width={96} height={96} viewBox="0 0 96 96">
          <Circle cx={48} cy={48} r={39} stroke={colors.surfaceHigh} strokeWidth={10} fill="none" />
          <Circle cx={48} cy={48} r={39} stroke={colors.primary} strokeWidth={10} strokeDasharray={`${2 * Math.PI * 39 * 0.4} ${2 * Math.PI * 39}`} strokeLinecap="round" fill="none" transform="rotate(-90 48 48)" />
        </Svg>
        <View style={styles.ringText}>
          <AppText variant="h2">860</AppText>
          <AppText variant="caption" tone="muted" style={styles.small}>kcal eaten</AppText>
        </View>
      </View>
      <View style={styles.energyInfo}>
        <AppText variant="caption" style={{ color: colors.primary, fontFamily: fonts.sansBold }}>TODAY’S ENERGY</AppText>
        <AppText variant="h2">1,340 kcal left</AppText>
      </View>
      <Ionicons name="chevron-forward" size={sizes.icon} color={colors.mutedForeground} />
    </StructuredCard>
  )
}

const macroNutrients = [
  { label: 'Protein', amount: '52', unit: 'g', icon: 'barbell-outline' as const },
  { label: 'Carbs', amount: '108', unit: 'g', icon: 'flash-outline' as const },
  { label: 'Fats', amount: '31', unit: 'g', icon: 'water-outline' as const },
]

const microNutrients = [
  { label: 'Calcium', unit: 'mg' },
  { label: 'Iron', unit: 'mg' },
  { label: 'Potassium', unit: 'mg' },
  { label: 'Vitamin D', unit: 'mcg' },
]

export function NutrientCards() {
  const { colors, fonts, spacing, radius, sizes } = useTheme()
  return (
    <View style={{ gap: spacing.sm }}>
      <AppText variant="bodyLg" style={{ fontFamily: fonts.sansBold }}>Macronutrients</AppText>
      <View style={[styles.nutrientRow, { gap: spacing.sm }]}>
        {macroNutrients.map((item) => (
          <StructuredCard key={item.label} accessibilityLabel={`${item.label}: ${item.amount} ${item.unit}`} style={[styles.nutrientCard, { borderRadius: radius.lg, padding: spacing.sm }]}>
            <Ionicons name={item.icon} size={sizes.icon} color={colors.primary} />
            <AppText variant="caption" tone="muted">{item.label}</AppText>
            <AppText variant="bodyLg" style={{ fontFamily: fonts.sansBold }}>{item.amount} <AppText variant="caption" tone="muted">{item.unit}</AppText></AppText>
          </StructuredCard>
        ))}
      </View>

      <View style={styles.nutrientSectionHeading}>
        <AppText variant="bodyLg" style={{ fontFamily: fonts.sansBold }}>Micronutrients</AppText>
        <AppText variant="caption" tone="muted">Food log tracking</AppText>
      </View>
      <View style={[styles.microGrid, { gap: spacing.sm }]}>
        {microNutrients.map((item) => (
          <StructuredCard key={item.label} accessibilityLabel={`${item.label}: not tracked yet`} style={[styles.microCard, { borderRadius: radius.lg, padding: spacing.sm }]}>
            <AppText variant="caption" tone="muted">{item.label}</AppText>
            <AppText variant="bodyLg" style={{ color: colors.goldSoft, fontFamily: fonts.sansBold }}>— <AppText variant="caption" tone="muted">{item.unit}</AppText></AppText>
            <AppText variant="caption" tone="muted" style={styles.microHint}>Not tracked yet</AppText>
          </StructuredCard>
        ))}
      </View>
    </View>
  )
}

const metricData = [
  { label: 'Water', value: '1.6 / 2.5 L', icon: 'water-outline' as const, progress: 0.64 },
  { label: 'Fasting', value: '12h 36m', icon: 'time-outline' as const, progress: 0.72 },
  { label: 'Budget left', value: '₹414', icon: 'cash-outline' as const, progress: 0.38 },
]

export function DailyMetricCards() {
  const { colors, fonts, spacing, radius, sizes } = useTheme()
  return (
    <View style={[styles.metrics, { gap: spacing.sm }]}>
      {metricData.map((item) => (
        <StructuredCard key={item.label} accessibilityLabel={`${item.label}: ${item.value}`} style={[styles.metric, { padding: spacing.sm, borderRadius: radius.lg }]}>
          <Ionicons name={item.icon} size={sizes.icon} color={colors.primary} />
          <AppText variant="caption" tone="muted">{item.label}</AppText>
          <AppText variant="caption" style={{ fontFamily: fonts.sansBold }}>{item.value}</AppText>
          <View style={[styles.track, { backgroundColor: colors.surfaceHigh }]}><View style={[styles.progress, { width: `${item.progress * 100}%`, backgroundColor: colors.primary }]} /></View>
        </StructuredCard>
      ))}
    </View>
  )
}

export function MealSuggestionCard() {
  const { colors, fonts, spacing, sizes } = useTheme()
  return (
    <StructuredCard accessibilityLabel="Suggested lunch: Paneer veggie bowl" style={styles.meal}>
      <View style={[styles.mealIcon, { backgroundColor: colors.surfaceHigh, borderRadius: spacing.md }]}><Ionicons name="restaurant-outline" size={sizes.headerIcon + spacing.xs} color={colors.primary} /></View>
      <View style={styles.mealInfo}>
        <AppText variant="caption" style={{ color: colors.primary, fontFamily: fonts.sansBold }}>BEST FOR LUNCH</AppText>
        <AppText variant="bodyLg" style={{ fontFamily: fonts.sansBold }}>Paneer veggie bowl</AppText>
        <AppText variant="caption" tone="muted">Balances protein and iron using pantry items.</AppText>
        <AppText variant="caption" style={{ marginTop: spacing.xs }}>
          <AppText variant="caption" style={{ fontFamily: fonts.sansBold }}>520 kcal</AppText>
          <AppText variant="caption" tone="muted"> · </AppText>
          <AppText variant="caption" style={{ fontFamily: fonts.sansBold }}>28g protein</AppText>
          <AppText variant="caption" tone="muted"> · </AppText>
          <AppText variant="caption" style={{ color: colors.goldSoft, fontFamily: fonts.sansBold }}>₹64</AppText>
        </AppText>
      </View>
      <Ionicons name="chevron-forward" size={sizes.icon} color={colors.mutedForeground} />
    </StructuredCard>
  )
}

export function PantryStatusCard() {
  const { colors, fonts, spacing, sizes } = useTheme()
  return (
    <StructuredCard tone="success" accessibilityLabel="Dinner is almost sorted" style={[styles.pantry, { backgroundColor: alpha(colors.greenDeep, 0.55), borderColor: alpha(colors.green, 0.32) }]}>
      <Ionicons name="cube-outline" size={sizes.headerIcon} color={colors.green} />
      <View style={[styles.pantryInfo, { gap: spacing.xs }]}>
        <AppText variant="body" style={{ fontFamily: fonts.sansBold }}>Dinner is almost sorted</AppText>
        <AppText variant="caption" tone="muted">You have 7 of 9 ingredients.</AppText>
      </View>
      <AppText variant="caption" style={{ color: colors.green }}>Save ₹84</AppText>
    </StructuredCard>
  )
}

const styles = StyleSheet.create({
  energy: { minHeight: 112, flexDirection: 'row', alignItems: 'center', gap: 12 },
  ring: { width: 92, height: 92, alignItems: 'center', justifyContent: 'center' },
  ringText: { position: 'absolute', alignItems: 'center' },
  small: { fontSize: 9 },
  energyInfo: { flex: 1, gap: 6 },
  nutrientRow: { flexDirection: 'row' },
  nutrientCard: { flex: 1, minWidth: 0, minHeight: 88, gap: 3 },
  nutrientSectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  microGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  microCard: { width: '48%', minHeight: 82, gap: 3 },
  microHint: { fontSize: 10 },
  metrics: { flexDirection: 'row' },
  metric: { flex: 1, minHeight: 94, gap: 4 },
  track: { height: 3, borderRadius: 2, marginTop: 'auto', overflow: 'hidden' },
  progress: { height: 3 },
  meal: { minHeight: 112, flexDirection: 'row', alignItems: 'center', gap: 10 },
  mealIcon: { width: 68, height: 80, alignItems: 'center', justifyContent: 'center' },
  mealInfo: { flex: 1, gap: 4 },
  pantry: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 10 },
  pantryInfo: { flex: 1 },
})
