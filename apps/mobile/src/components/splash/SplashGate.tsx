import { useCallback, useEffect, useRef, useState } from 'react'
import { LayoutChangeEvent, StyleSheet, View } from 'react-native'
import * as SplashScreen from 'expo-splash-screen'
import Animated, { runOnJS, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated'
import { darkColors } from '@/theme/colors'
import { BrandLogo } from '@/components/brand/BrandLogo'
import SplashAnimation from '@/components/splash/SplashAnimation'
import { FADE_MS, REDUCED_MOTION_MS, SPLASH_MAX_MS, SPLASH_MS } from '@/components/splash/splash.config'

type Props = { ready: boolean; children: React.ReactNode }

export function SplashGate({ ready, children }: Props) {
  const prefersReducedMotion = useReducedMotion() === true
  const [visible, setVisible] = useState(true)
  const [nativeHidden, setNativeHidden] = useState(false)
  const [animationDone, setAnimationDone] = useState(false)
  const [maxReached, setMaxReached] = useState(false)
  const started = useRef(false)
  const opacity = useSharedValue(1)

  const hideNativeSplash = useCallback(() => {
    if (started.current) return
    started.current = true
    requestAnimationFrame(() => {
      SplashScreen.hideAsync().catch(() => undefined).finally(() => setNativeHidden(true))
    })
  }, [])

  const onLayout = useCallback((_event: LayoutChangeEvent) => hideNativeSplash(), [hideNativeSplash])

  useEffect(() => {
    const timeout = setTimeout(() => setMaxReached(true), SPLASH_MAX_MS)
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    if (!nativeHidden || !prefersReducedMotion) return
    const timeout = setTimeout(() => setAnimationDone(true), REDUCED_MOTION_MS)
    return () => clearTimeout(timeout)
  }, [nativeHidden, prefersReducedMotion])

  const shouldFade = maxReached || (nativeHidden && animationDone && ready)

  const finishFade = useCallback(() => setVisible(false), [])
  const finishAnimation = useCallback(() => setAnimationDone(true), [])
  useEffect(() => {
    if (!shouldFade) return
    opacity.set(withTiming(0, { duration: FADE_MS }, (finished) => {
      if (finished) runOnJS(finishFade)()
    }))
  }, [finishFade, opacity, shouldFade])

  const overlayStyle = useAnimatedStyle(() => ({ opacity: opacity.get() }))

  return (
    <View style={[styles.root, { backgroundColor: darkColors.background }]}>
      {children}
      {visible && (
        <Animated.View
          onLayout={onLayout}
          pointerEvents="auto"
          style={[styles.overlay, { backgroundColor: darkColors.background }, overlayStyle]}
        >
          {nativeHidden && (prefersReducedMotion
            ? <BrandLogo size={180} />
            : <SplashAnimation durationMs={SPLASH_MS} play={nativeHidden} onFinish={finishAnimation} />)}
        </Animated.View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 999999,
    elevation: 999999,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
