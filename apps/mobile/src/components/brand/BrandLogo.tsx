import { useWindowDimensions, View } from 'react-native'
import Svg, { Defs, G, LinearGradient, Path, Stop } from 'react-native-svg'
import { BOWL, BREAD, BROC, FACE, GRADS, HEART, LEAF, RICE, RINGFORK, Shape, TOMATO } from '@/components/splash/splashAssets'

const layers: Shape[][] = [BROC, BREAD, LEAF, TOMATO, RICE, BOWL, FACE, HEART, RINGFORK]

export function BrandLogo({ size = 180 }: { size?: number }) {
  const { width } = useWindowDimensions()
  const displaySize = Math.min(size, width * 0.62)
  const gradients = Object.entries(GRADS)

  return (
    <View accessibilityLabel="MyDietitian" accessible>
      <Svg width={displaySize} height={displaySize * (360 / 380)} viewBox="0 0 380 360">
        <Defs>
          {gradients.map(([name, gradient]) => (
            <LinearGradient key={name} id={`brand_${name}`} x1={gradient.x1} y1={gradient.y1} x2={gradient.x2} y2={gradient.y2}>
              {gradient.stops.map(([offset, color], index) => (
                <Stop key={index} offset={offset} stopColor={color} />
              ))}
            </LinearGradient>
          ))}
        </Defs>
        <G transform="translate(16 28) scale(0.34)">
          {layers.map((layer, layerIndex) => (
            <G key={layerIndex}>
              {layer.map((shape, shapeIndex) => (
                <Path key={shapeIndex} d={shape.d} fill={shape.fill.replaceAll('url(#g_', 'url(#brand_')} fillRule="evenodd" />
              ))}
            </G>
          ))}
        </G>
      </Svg>
    </View>
  )
}

