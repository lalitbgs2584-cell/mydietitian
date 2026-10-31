import { CameraView, CameraType, FlashMode, useCameraPermissions } from 'expo-camera'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useRef, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function CameraScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const [permission, requestPermission] = useCameraPermissions()
  const [facing, setFacing] = useState<CameraType>('back')
  const [flash, setFlash] = useState<FlashMode>('off')
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)

  const cameraRef = useRef<CameraView>(null)

  const toggleFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'))
  }

  const toggleFlash = () => {
    setFlash((current) => {
      if (current === 'off') return 'on'
      if (current === 'on') return 'auto'
      return 'off'
    })
  }

  const takePhoto = async () => {
    if (!cameraRef.current || isCapturing) return

    try {
      setIsCapturing(true)
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: false,
      })
      if (photo?.uri) {
        setCapturedPhoto(photo.uri)
      }
    } catch (err) {
      console.error('Failed to capture photo:', err)
    } finally {
      setIsCapturing(false)
    }
  }

  // 1. Loading permission state
  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#EAB308" />
        <Text style={styles.loadingText}>Loading camera permissions...</Text>
      </View>
    )
  }

  // 2. Permission not granted state
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionCard}>
          <Text style={styles.cameraIcon}>📸</Text>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionDescription}>
            MyDietitian uses your camera to test hardware functionality, take photos of meals, and
            scan ingredients.
          </Text>

          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
            onPress={requestPermission}
          >
            <Text style={styles.primaryButtonText}>Grant Camera Permission</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
            onPress={() => router.back()}
          >
            <Text style={styles.secondaryButtonText}>Back to Home</Text>
          </Pressable>
        </View>
      </View>
    )
  }

  // 3. Captured photo preview state
  if (capturedPhoto) {
    return (
      <View style={[styles.container, { backgroundColor: '#000' }]}>
        <Image
          source={{ uri: capturedPhoto }}
          style={StyleSheet.absoluteFill}
          contentFit="contain"
        />

        <View
          style={[
            styles.previewOverlay,
            { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
          ]}
        >
          <View style={styles.previewBadge}>
            <Text style={styles.previewBadgeText}>✓ Photo Captured Successfully</Text>
          </View>

          <View style={styles.previewActions}>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.retakeButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => setCapturedPhoto(null)}
            >
              <Text style={styles.retakeButtonText}>Retake Photo</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.doneButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => router.back()}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </View>
    )
  }

  // 4. Live camera view
  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} flash={flash}>
        {/* Top Controls */}
        <View style={[styles.topControls, { paddingTop: insets.top + 16 }]}>
          <Pressable
            style={({ pressed }) => [styles.circleButton, pressed && styles.buttonPressed]}
            onPress={() => router.back()}
          >
            <Text style={styles.circleButtonText}>✕</Text>
          </Pressable>

          <View style={styles.topRightControls}>
            <Pressable
              style={({ pressed }) => [styles.pillButton, pressed && styles.buttonPressed]}
              onPress={toggleFlash}
            >
              <Text style={styles.pillButtonText}>⚡ {flash.toUpperCase()}</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.circleButton, pressed && styles.buttonPressed]}
              onPress={toggleFacing}
            >
              <Text style={styles.circleButtonText}>🔄</Text>
            </Pressable>
          </View>
        </View>

        {/* Viewfinder Target */}
        <View style={styles.viewfinderContainer} pointerEvents="none">
          <View style={styles.reticle}>
            <View style={[styles.reticleCorner, styles.reticleTopLeft]} />
            <View style={[styles.reticleCorner, styles.reticleTopRight]} />
            <View style={[styles.reticleCorner, styles.reticleBottomLeft]} />
            <View style={[styles.reticleCorner, styles.reticleBottomRight]} />
          </View>
          <Text style={styles.viewfinderHint}>Align meal or object in frame</Text>
        </View>

        {/* Bottom Shutter Controls */}
        <View style={[styles.bottomControls, { paddingBottom: insets.bottom + 24 }]}>
          <Text style={styles.cameraModeText}>
            {facing === 'back' ? 'Rear Camera' : 'Front Camera'}
          </Text>

          <Pressable
            style={({ pressed }) => [styles.shutterOuterRing, pressed && styles.buttonPressed]}
            onPress={takePhoto}
            disabled={isCapturing}
          >
            <View style={styles.shutterInnerCircle}>
              {isCapturing && <ActivityIndicator color="#000" size="small" />}
            </View>
          </Pressable>
        </View>
      </CameraView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0c',
    gap: 16,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0c',
    padding: 24,
  },
  permissionCard: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    backgroundColor: '#16161a',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#26262a',
    gap: 14,
  },
  cameraIcon: {
    fontSize: 48,
    marginBottom: 4,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  permissionDescription: {
    fontSize: 14,
    color: '#9999a0',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: '#CA8A04',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 24,
    width: '100%',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  secondaryButtonText: {
    color: '#888890',
    fontSize: 14,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  topRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  pillButton: {
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  viewfinderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reticle: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  reticleCorner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#CA8A04',
  },
  reticleTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 12,
  },
  reticleTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 12,
  },
  reticleBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 12,
  },
  reticleBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 12,
  },
  viewfinderHint: {
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 16,
    fontSize: 14,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bottomControls: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  cameraModeText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  shutterOuterRing: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 4,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  shutterInnerCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  previewBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(202, 138, 4, 0.6)',
  },
  previewBadgeText: {
    color: '#FACC15',
    fontSize: 14,
    fontWeight: '600',
  },
  previewActions: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    maxWidth: 400,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retakeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  retakeButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  doneButton: {
    backgroundColor: '#CA8A04',
  },
  doneButtonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '700',
  },
})
