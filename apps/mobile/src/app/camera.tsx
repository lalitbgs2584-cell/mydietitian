import { CameraView, type BarcodeScanningResult, type BarcodeType, type CameraType, type FlashMode, useCameraPermissions } from 'expo-camera'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import Animated, { cancelAnimation, Easing, interpolate, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated'
import { AppText } from '@/components/ui/AppText'
import { Button } from '@/components/ui/Button'
import { useTheme } from '@/theme/ThemeProvider'
import { alpha } from '@/theme/colors'

const supportedBarcodeTypes: BarcodeType[] = ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'code93', 'itf14', 'codabar', 'qr', 'pdf417', 'aztec', 'datamatrix']

export default function CameraScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { colors, spacing, radius, sizes } = useTheme()

  const [permission, requestPermission] = useCameraPermissions()
  const [facing, setFacing] = useState<CameraType>('back')
  const [flash, setFlash] = useState<FlashMode>('off')
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [photoSource, setPhotoSource] = useState<'camera' | 'gallery' | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [scanMode, setScanMode] = useState<'food' | 'barcode'>('food')
  const [barcodeResult, setBarcodeResult] = useState<string | null>(null)
  const [frameHeight, setFrameHeight] = useState(0)
  const cameraRef = useRef<CameraView>(null)
  const barcodeLocked = useRef(false)
  const scanProgress = useSharedValue(0)
  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scanProgress.value, [0, 1], [0, Math.max(0, frameHeight - 18)]) }],
  }))

  useEffect(() => {
    scanProgress.value = withRepeat(withTiming(1, { duration: 1900, easing: Easing.inOut(Easing.quad) }), -1, true)
    return () => cancelAnimation(scanProgress)
  }, [scanProgress])

  const toggleFacing = () => setFacing((current) => current === 'back' ? 'front' : 'back')
  const toggleFlash = () => setFlash((current) => current === 'off' ? 'on' : current === 'on' ? 'auto' : 'off')

  const takePhoto = async () => {
    if (!cameraRef.current || isCapturing) return
    try {
      setIsCapturing(true)
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85, skipProcessing: false })
      if (photo?.uri) {
        setCapturedPhoto(photo.uri)
        setPhotoSource('camera')
      }
    } catch (error) {
      if (__DEV__) console.warn('Photo capture failed:', error)
    } finally {
      setIsCapturing(false)
    }
  }

  const chooseFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.9 })
      if (!result.canceled && result.assets[0]?.uri) {
        setCapturedPhoto(result.assets[0].uri)
        setPhotoSource('gallery')
      }
    } catch (error) {
      if (__DEV__) console.warn('Gallery selection failed:', error)
    }
  }

  const selectScanMode = (mode: 'food' | 'barcode') => {
    setScanMode(mode)
    setBarcodeResult(null)
    barcodeLocked.current = false
  }

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (barcodeLocked.current) return
    barcodeLocked.current = true
    setBarcodeResult(result.data)
  }

  if (!permission && !capturedPhoto) {
    return <View style={[styles.center, { backgroundColor: colors.background, padding: spacing.xl }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <AppText variant="body" tone="muted">Preparing your camera…</AppText>
    </View>
  }

  if (permission && !permission.granted && !capturedPhoto) {
    return <View style={[styles.center, { backgroundColor: colors.background, padding: spacing.xl + insets.left }]}>
      <View style={[styles.permissionCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: radius.xl, padding: spacing.xl }]}>
        <View style={[styles.permissionIcon, { backgroundColor: alpha(colors.primary, 0.12), borderRadius: radius.lg }]}>
          <Ionicons name="camera-outline" size={sizes.headerIcon + spacing.md} color={colors.primary} />
        </View>
        <AppText variant="h2" style={styles.centerText}>Camera access needed</AppText>
        <AppText variant="body" tone="muted" style={styles.centerText}>Allow camera access to take a meal photo and keep your food journal up to date.</AppText>
        <Button label="Choose from gallery" variant="secondary" onPress={() => void chooseFromGallery()} />
        <Button label="Allow camera access" onPress={() => void requestPermission()} />
        <Button label="Back to home" variant="ghost" onPress={() => router.back()} />
      </View>
    </View>
  }

  if (capturedPhoto) {
    return <View style={[styles.fullScreen, { backgroundColor: colors.background }]}>
      <Image source={{ uri: capturedPhoto }} style={StyleSheet.absoluteFill} contentFit="contain" />
      <View style={[styles.previewOverlay, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xl, paddingHorizontal: spacing.lg }]}>
        <View style={[styles.previewMessage, { backgroundColor: alpha(colors.card, 0.94), borderColor: colors.border, borderRadius: radius.pill }]}>
          <Ionicons name="checkmark-circle" size={sizes.icon} color={colors.green} />
          <AppText variant="caption" style={{ color: colors.foreground }}>{photoSource === 'gallery' ? 'Photo selected from gallery' : 'Meal photo captured'}</AppText>
        </View>
        <View style={[styles.previewActions, { gap: spacing.sm }]}>
          <Button label={photoSource === 'gallery' ? 'Choose another' : 'Retake'} variant="secondary" onPress={() => { setCapturedPhoto(null); setPhotoSource(null) }} />
          <Button label="Done" onPress={() => router.back()} />
        </View>
      </View>
    </View>
  }

  return (
    <View style={[styles.fullScreen, { backgroundColor: colors.background }]}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        flash={flash}
        onBarcodeScanned={scanMode === 'barcode' && !barcodeResult ? handleBarcodeScanned : undefined}
        barcodeScannerSettings={{ barcodeTypes: supportedBarcodeTypes }}
      />
      <View style={StyleSheet.absoluteFill}>
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: alpha(colors.background, 0.12) }]} />
        <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm, paddingHorizontal: spacing.lg }]}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close camera" onPress={() => router.back()} style={[styles.closeButton, { backgroundColor: alpha(colors.card, 0.82), borderColor: alpha(colors.foreground, 0.12) }]}>
            <Ionicons name="close" size={sizes.headerIcon} color={colors.foreground} />
          </Pressable>
          <View style={[styles.titlePill, { backgroundColor: alpha(colors.card, 0.82), borderColor: alpha(colors.foreground, 0.12), borderRadius: radius.pill }]}>
            <View style={[styles.liveDot, { backgroundColor: colors.primary }]} />
            <AppText variant="caption" style={{ color: colors.foreground }}>MEAL CAMERA</AppText>
          </View>
          <View style={styles.topSpacer} />
        </View>

        <View style={styles.viewfinderArea} pointerEvents="none">
          <View style={[styles.guidePill, { backgroundColor: alpha(colors.card, 0.78), borderColor: alpha(colors.primary, 0.42), borderRadius: radius.pill }]}>
            <Ionicons name="sparkles-outline" size={sizes.icon} color={colors.goldSoft} />
            <AppText variant="caption" style={{ color: colors.foreground }}>{scanMode === 'barcode' ? 'Align a barcode inside the guide' : 'Frame your meal in the guide'}</AppText>
          </View>
          <View onLayout={(event) => setFrameHeight(event.nativeEvent.layout.height)} style={styles.focusFrame}>
            <View style={[styles.corner, styles.topLeft, { borderColor: colors.goldSoft }]} />
            <View style={[styles.corner, styles.topRight, { borderColor: colors.goldSoft }]} />
            <View style={[styles.corner, styles.bottomLeft, { borderColor: colors.goldSoft }]} />
            <View style={[styles.corner, styles.bottomRight, { borderColor: colors.goldSoft }]} />
            <View style={[styles.focusCenter, { borderColor: alpha(colors.foreground, 0.34) }]} />
            <Animated.View style={[styles.scanLine, { backgroundColor: colors.goldSoft, shadowColor: colors.primary }, scanLineStyle]} />
          </View>
        </View>

        <View style={[styles.bottomPanel, { paddingBottom: insets.bottom + spacing.md, paddingHorizontal: spacing.lg }]}>
          <View style={[styles.cameraInfo, { backgroundColor: alpha(colors.card, 0.88), borderColor: alpha(colors.foreground, 0.1), borderRadius: radius.xl }]}>
            <AppText variant="caption" style={{ color: colors.goldSoft }}>{barcodeResult ? 'BARCODE FOUND' : scanMode === 'barcode' ? 'READY TO SCAN' : 'A LITTLE LIGHT HELPS'}</AppText>
            {barcodeResult ? <>
              <AppText numberOfLines={2} selectable variant="body" style={{ textAlign: 'center' }}>{barcodeResult}</AppText>
              <Pressable accessibilityRole="button" onPress={() => selectScanMode('barcode')}><AppText variant="caption" style={{ color: colors.goldSoft }}>Scan another</AppText></Pressable>
            </> : <AppText variant="caption" style={{ color: alpha(colors.foreground, 0.72) }}>{scanMode === 'barcode' ? 'Hold the barcode inside the frame.' : 'Keep the whole plate inside the frame.'}</AppText>}
          </View>
          <View style={styles.scanModes}>
            <ScanModeButton label="Food" icon="restaurant-outline" selected={scanMode === 'food'} onPress={() => selectScanMode('food')} />
            <ScanModeButton label="Barcode" icon="barcode-outline" selected={scanMode === 'barcode'} onPress={() => selectScanMode('barcode')} />
            <ScanModeButton label="Gallery" icon="images-outline" onPress={() => void chooseFromGallery()} />
          </View>
          <View style={styles.captureDock}>
            <DockControl label="Flash" value={flash.toUpperCase()} icon={flash === 'off' ? 'flash-off-outline' : 'flash-outline'} onPress={toggleFlash} />
            <Pressable accessibilityRole="button" accessibilityLabel="Take meal photo" onPress={() => void takePhoto()} disabled={isCapturing} style={({ pressed }) => [styles.shutterOuter, { borderColor: colors.primary, backgroundColor: alpha(colors.card, 0.7) }, pressed && styles.pressed, isCapturing && styles.capturing]}>
              <View style={[styles.shutterInner, { backgroundColor: colors.primary }]}>
                {isCapturing ? <ActivityIndicator color={colors.primaryForeground} size="small" /> : <Ionicons name="scan-outline" size={sizes.headerIcon + spacing.xs} color={colors.primaryForeground} />}
              </View>
            </Pressable>
            <DockControl label="Camera" value={facing === 'back' ? 'Rear' : 'Front'} icon="camera-reverse-outline" onPress={toggleFacing} />
          </View>
          <AppText variant="caption" tone="muted" style={styles.dockHint}>Tap to capture · Hold steady for a clearer photo</AppText>
        </View>
      </View>
    </View>
  )
}

function ScanModeButton({ label, icon, selected = false, onPress }: { label: string; icon: 'restaurant-outline' | 'barcode-outline' | 'images-outline'; selected?: boolean; onPress: () => void }) {
  const { colors, spacing, radius } = useTheme()
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} accessibilityLabel={label === 'Gallery' ? 'Upload photo from gallery' : `${label} scan`} onPress={onPress} style={({ pressed }) => [
      styles.scanModeButton,
      { backgroundColor: alpha(selected ? colors.primary : colors.card, selected ? 0.2 : 0.78), borderColor: selected ? alpha(colors.primary, 0.72) : alpha(colors.foreground, 0.14), borderRadius: radius.lg, gap: spacing.xs },
      pressed && styles.pressed,
    ]}>
      <Ionicons name={icon} size={17} color={selected ? colors.goldSoft : colors.foreground} />
      <AppText variant="caption" style={{ color: selected ? colors.goldSoft : colors.foreground }}>{label}</AppText>
    </Pressable>
  )
}

function DockControl({ label, value, icon, onPress }: { label: string; value: string; icon: 'flash-off-outline' | 'flash-outline' | 'camera-reverse-outline'; onPress: () => void }) {
  const { colors, sizes, spacing } = useTheme()
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${value}`} onPress={onPress} style={({ pressed }) => [styles.dockControl, pressed && styles.pressed]}>
      <View style={[styles.dockIcon, { width: sizes.touchMin, height: sizes.touchMin, backgroundColor: alpha(colors.card, 0.9), borderColor: alpha(colors.foreground, 0.14), marginBottom: spacing.xs }]}>
        <Ionicons name={icon} size={sizes.icon} color={colors.foreground} />
      </View>
      <AppText variant="caption" style={{ color: colors.foreground }}>{value}</AppText>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  fullScreen: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  permissionCard: { width: '100%', maxWidth: 380, alignItems: 'center', borderWidth: 1, gap: 16 },
  permissionIcon: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center' },
  centerText: { textAlign: 'center' },
  previewOverlay: { flex: 1, alignItems: 'center', justifyContent: 'space-between' },
  previewMessage: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 16, borderWidth: 1 },
  previewActions: { flexDirection: 'row', width: '100%', maxWidth: 400 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  closeButton: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  titlePill: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, height: 38, borderWidth: 1 },
  liveDot: { width: 7, height: 7, borderRadius: 4 },
  topSpacer: { width: 44, height: 44 },
  viewfinderArea: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  guidePill: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1 },
  focusFrame: { width: '82%', maxWidth: 330, height: '48%', maxHeight: 340, minHeight: 220, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  scanLine: { position: 'absolute', top: 9, left: 15, right: 15, height: 2, borderRadius: 2, shadowOpacity: 0.85, shadowRadius: 9, shadowOffset: { width: 0, height: 0 }, elevation: 4 },
  corner: { position: 'absolute', width: 34, height: 34, borderWidth: 3 },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 12 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 12 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 12 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 12 },
  focusCenter: { width: 8, height: 8, borderWidth: 1, borderRadius: 4 },
  bottomPanel: { gap: 14 },
  cameraInfo: { alignSelf: 'center', alignItems: 'center', gap: 4, paddingHorizontal: 18, paddingVertical: 10, borderWidth: 1 },
  scanModes: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  scanModeButton: { flex: 1, minWidth: 0, height: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  captureDock: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  dockControl: { minWidth: 72, alignItems: 'center', justifyContent: 'center' },
  dockIcon: { borderWidth: 1, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  shutterOuter: { width: 82, height: 82, borderRadius: 41, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  capturing: { opacity: 0.8 },
  pressed: { opacity: 0.76, transform: [{ scale: 0.96 }] },
  dockHint: { textAlign: 'center' },
})
