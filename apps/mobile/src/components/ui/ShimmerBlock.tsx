import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, View, ViewStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useReducedMotion } from 'react-native-reanimated'
import { useTheme } from '@/theme/ThemeProvider'
import { alpha } from '@/theme/colors'

export function ShimmerBlock({ style }: { style: ViewStyle }) {
  const { colors } = useTheme()
  const reducedMotion = useReducedMotion() === true
  const progress = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (reducedMotion) return
    const animation = Animated.loop(Animated.timing(progress, {
      toValue: 1,
      duration: 1150,
      useNativeDriver: true,
    }))
    animation.start()
    return () => animation.stop()
  }, [progress, reducedMotion])

  return (
    <View style={[styles.block, style, { backgroundColor: colors.surfaceHigh }]}>
      {!reducedMotion ? (
        <Animated.View style={[styles.sweep, {
          transform: [{ translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [-220, 220] }) }],
        }]}>
          <LinearGradient
            colors={[alpha(colors.foreground, 0), alpha(colors.foreground, 0.1), alpha(colors.foreground, 0)]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  block: { overflow: 'hidden' },
  sweep: { position: 'absolute', top: 0, bottom: 0, left: 0, width: 220 },
})
