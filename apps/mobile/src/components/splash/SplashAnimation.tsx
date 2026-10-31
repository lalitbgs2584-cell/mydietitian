import React, { useEffect } from "react";
import { Platform, StyleSheet, useWindowDimensions, View } from "react-native";
import Svg, {
  ClipPath, Circle, Defs, G, Line, LinearGradient, Mask, Path, Rect, Stop,
} from "react-native-svg";
import Animated, {
  Easing, runOnJS, useAnimatedProps, useAnimatedStyle, useSharedValue,
  withDelay, withRepeat, withSequence, withTiming, type SharedValue,
} from "react-native-reanimated";
import { BOWL, BREAD, BROC, FACE, GRADS, HEART, LEAF, RICE, RING_LEN, RING_PATH, RINGFORK, Shape, TOMATO } from "./splashAssets";


const AG = Animated.createAnimatedComponent(G);
const AP = Animated.createAnimatedComponent(Path);
const ACircle = Animated.createAnimatedComponent(Circle);
const ALine = Animated.createAnimatedComponent(Line);

/** Timeline runs 0 -> TL_END "timeline seconds", mapped onto durationMs of real time. */
const TL_END = 7.4;

// ---------- easing / helpers (worklets) ----------
const clamp = (x: number) => { "worklet"; return Math.min(1, Math.max(0, x)); };
const pr = (t: number, d: number, u: number) => { "worklet"; return clamp((t - d) / u); };
const back = (x: number) => {
  "worklet";
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
const cub = (x: number) => { "worklet"; return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const outq = (x: number) => { "worklet"; return 1 - (1 - x) * (1 - x); };
// RN has no transform-origin, so scale around a point manually
const around = (cx: number, cy: number, s: number) => {
  "worklet";
  return [{ translateX: cx }, { translateY: cy }, { scale: s }, { translateX: -cx }, { translateY: -cy }];
};

type TV = SharedValue<number>;
const shapes = (list: Shape[]) =>
  list.map((s, i) => <Path key={i} d={s.d} fill={s.fill} fillRule="evenodd" />);

const RingFork = () => <>{shapes(RINGFORK)}</>;

// ---------- animated wrappers ----------
function Rise({ t, delay, children }: { t: TV; delay: number; children: React.ReactNode }) {
  const props = useAnimatedProps(() => {
    const p = pr(t.value, delay, 0.7);
    return { opacity: clamp(p * 2.5), transform: [{ translateY: (1 - back(p)) * 140 }] } as any;
  });
  return <AG animatedProps={props}>{children}</AG>;
}

function Pop({
  t, delay, cx, cy, fadeAt, children,
}: { t: TV; delay: number; cx: number; cy: number; fadeAt?: number; children: React.ReactNode }) {
  const props = useAnimatedProps(() => {
    const p = pr(t.value, delay, 0.7);
    const f = fadeAt === undefined ? 1 : pr(t.value, fadeAt, 0.4);
    return { opacity: clamp(p * 3) * f, transform: around(cx, cy, 0.3 + 0.7 * back(p)) } as any;
  });
  return <AG animatedProps={props}>{children}</AG>;
}

function Beat({ beat, children }: { beat: TV; children: React.ReactNode }) {
  const props = useAnimatedProps(() => ({ transform: around(512, 318, beat.value) } as any));
  return <AG animatedProps={props}>{children}</AG>;
}

function Sparkle({ t, at, x, y, r, color }: { t: TV; at: number; x: number; y: number; r: number; color: string }) {
  const props = useAnimatedProps(() => {
    const k = Math.sin(pr(t.value, at, 0.8) * Math.PI);
    return { opacity: k > 0 ? 1 : 0, transform: around(x, y, Math.max(k, 0.001) * 1.4) } as any;
  });
  return <AG animatedProps={props}><Circle cx={x} cy={y} r={r} fill={color} /></AG>;
}

// ---------- tagline ----------
const SERIF = Platform.select({ ios: "Georgia", default: "serif" });

function Letter({ t, ch, at, color, italic, size, spacing }: {
  t: TV; ch: string; at: number; color: string; italic?: boolean; size: number; spacing: number;
}) {
  const style = useAnimatedStyle(() => ({ opacity: outq(pr(t.value, at, 0.35)) }));
  return (
    <Animated.Text
      style={[{ color, fontSize: size, fontFamily: SERIF, fontStyle: italic ? "italic" : "normal", letterSpacing: spacing }, style]}
    >
      {ch === " " ? "\u00A0" : ch}
    </Animated.Text>
  );
}

function Line1({ t, text, start, color, italic, size, spacing }: {
  t: TV; text: string; start: number; color: string; italic?: boolean; size: number; spacing: number;
}) {
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - outq(pr(t.value, start, 0.6))) * 10 }],
  }));
  return (
    <Animated.View style={[{ flexDirection: "row", height: size * 1.25 }, style]}>
      {text.split("").map((ch, i) => (
        <Letter key={i} t={t} ch={ch} at={start + i * 0.07} color={color} italic={italic} size={size} spacing={spacing} />
      ))}
    </Animated.View>
  );
}

function Underline({ t, width }: { t: TV; width: number }) {
  const k = width / 380;
  const left = useAnimatedProps(() => {
    const p = outq(pr(t.value, 6.6, 0.6));
    return { x1: 178 - 28 * p, opacity: p } as any;
  });
  const right = useAnimatedProps(() => {
    const p = outq(pr(t.value, 6.6, 0.6));
    return { x2: 202 + 28 * p, opacity: p } as any;
  });
  const heart = useAnimatedProps(() => {
    const p = pr(t.value, 6.6, 0.6);
    return { opacity: outq(p), transform: around(190, 436, 0.4 + 0.6 * back(p)) } as any;
  });
  return (
    <Svg width={width} height={24 * k} viewBox="0 0 380 24">
      <ALine animatedProps={left} x1={178} y1={12} x2={178} y2={12} stroke="#D4A24F" strokeWidth={1.5} strokeLinecap="round" />
      <ALine animatedProps={right} x1={202} y1={12} x2={202} y2={12} stroke="#D4A24F" strokeWidth={1.5} strokeLinecap="round" />
      <G transform="translate(0 -424)">
        <AG animatedProps={heart}>
          <Path d="M190 440C185 436 184 432 187 431C189 430 190 432 190 433C190 432 191 430 193 431C196 432 195 436 190 440Z" fill="#E3B55E" />
        </AG>
      </G>
    </Svg>
  );
}

// ---------- main ----------
type Props = {
  /** Called when the animation reaches its end (= minimum splash time). */
  onFinish?: () => void;
  /** Real-time length of the animation. ~4500ms is a good launch splash. */
  durationMs?: number;
};

export default function SplashAnimation({ onFinish, durationMs = 4600 }: Props) {
  const { width: sw } = useWindowDimensions();
  const W = Math.min(sw * 0.9, 420);
  const k = W / 380;

  const t = useSharedValue(0);
  const beat = useSharedValue(1);

  useEffect(() => {
    t.value = withTiming(TL_END, { duration: durationMs, easing: Easing.linear }, (done) => {
      if (done && onFinish) runOnJS(onFinish)();
    });
    // heartbeat keeps going if the splash is held while the backend is still answering
    beat.value = withDelay(
      (3.6 / TL_END) * durationMs,
      withRepeat(withSequence(withTiming(1.12, { duration: 450 }), withTiming(1, { duration: 450 })), -1),
    );
  }, []);

  // ring is revealed by an animated stroke inside a mask
  const ringStroke = useAnimatedProps(() => ({
    strokeDashoffset: RING_LEN * (1 - cub(pr(t.value, 3.2, 1.4))),
  }));
  const ringVisible = useAnimatedProps(() => ({ opacity: pr(t.value, 3.2, 1.4) > 0 ? 1 : 0 } as any));
  const forkPop = useAnimatedProps(() => {
    const p = pr(t.value, 4.5, 0.6);
    return { opacity: clamp(p * 3), transform: around(850, 470, 0.4 + 0.6 * back(p)) } as any;
  });
  const ripple = useAnimatedProps(() => {
    const p = pr(t.value, 4.9, 1);
    return { r: 300 + 150 * outq(p), opacity: p > 0 && p < 1 ? 0.4 * (1 - p) : 0 };
  });

  return (
    <View style={styles.root}>
      <Svg width={W} height={W * (360 / 380)} viewBox="0 0 380 360">
        <G transform="translate(16 28) scale(0.34)">
          <Defs>
            {Object.entries(GRADS).map(([name, g]) => (
              <LinearGradient key={name} id={`g_${name}`} gradientUnits="userSpaceOnUse" x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2}>
                {g.stops.map(([o, c], i) => <Stop key={i} offset={o as number} stopColor={c as string} />)}
              </LinearGradient>
            ))}
            <Mask id="rm" maskUnits="userSpaceOnUse" x={0} y={0} width={1024} height={1024}>
              <AP
                animatedProps={ringStroke}
                d={RING_PATH}
                fill="none"
                stroke="#fff"
                strokeWidth={40}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={[RING_LEN, RING_LEN + 10]}
              />
            </Mask>
            <ClipPath id="hc">
              <Rect x={690} y={268} width={210} height={210} />
            </ClipPath>
          </Defs>

          <ACircle animatedProps={ripple} cx={500} cy={511} r={300} fill="none" stroke="#E3B55E" strokeWidth={5} opacity={0} />
          <Sparkle t={t} at={4.9} x={90} y={300} r={14} color="#E3B55E" />
          <Sparkle t={t} at={5.05} x={940} y={640} r={12} color="#5CC08A" />
          <Sparkle t={t} at={5.2} x={200} y={900} r={10} color="#E3B55E" />

          {/* food: drawn before the bowl so it rises out of it */}
          <Rise t={t} delay={1.7}>{shapes(BROC)}</Rise>
          <Rise t={t} delay={1.8}>{shapes(BREAD)}</Rise>
          <Rise t={t} delay={1.3}>{shapes(LEAF     )}</Rise>
          <Rise t={t} delay={1.5}>{shapes(TOMATO)}</Rise>
          <Rise t={t} delay={1.9}>{shapes(RICE)}</Rise>

          <Pop t={t} delay={0.3} cx={505} cy={640}>{shapes(BOWL)}</Pop>
          <Pop t={t} delay={0.3} cx={505} cy={640} fadeAt={1.0}>{shapes(FACE)}</Pop>

          <Pop t={t} delay={2.7} cx={512} cy={318}>
            <Beat beat={beat}>{shapes(HEART)}</Beat>
          </Pop>

          {/* ring (revealed by mask) + fork head (clipped copy, pops in) */}
          <AG animatedProps={ringVisible}>
            <G mask="url(#rm)"><RingFork /></G>
          </AG>
          <AG animatedProps={forkPop}>
            <G clipPath="url(#hc)"><RingFork /></G>
          </AG>
        </G>
      </Svg>

      <View style={{ marginTop: 6 * k, alignItems: "center" }}>
        <Line1 t={t} text="Eat well" start={5.3} color="#E8BF70" size={31 * k} spacing={2 * k} />
        <Line1 t={t} text="Stay well" start={5.9} color="#6FCF9B" italic size={31 * k} spacing={2 * k} />
      </View>
      <Underline t={t} width={W} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" },
});
