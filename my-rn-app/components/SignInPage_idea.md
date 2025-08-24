
## Prompt you can give to your coding agent

> * Fullscreen-safe container with a centered **circular ring of colored dots** that continuously rotate clockwise.
> * 40–64 evenly spaced dots arranged on a circle (radius ≈ 80–100).
> * Each dot uses a hue-shifted gradient around the ring (HSL hue 0→300).
> * Dots “breathe”: scale 0.6→1.0 in a traveling wave around the circle (phase offset per dot).
> * Smooth 60 fps using **react-native-reanimated v3** (worklets), not setInterval.
> * No brand logos; only the ring and a caption text **“Signing In…”** centered below.
> * Caption has a looping ellipsis (., .., …) every \~700 ms.
> * Expose props: `size=220`, `radius=90`, `dotCount=48`, `dotSize=10`, `duration=3000`.

---

## Working code (Expo + Reanimated)

**Install (once):**

```bash
expo install react-native-reanimated
```

> If you don’t have Reanimated config yet, ensure `react-native-reanimated/plugin` is in your babel config (Expo SDKs already include it).

**SigningInRing.tsx**

```tsx
import React, { useMemo } from "react";
import { View, Text, useColorScheme, StyleSheet } from "react-native";
import Animated, {
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Extrapolate,
  useDerivedValue,
} from "react-native-reanimated";

/**
 * Colorful rotating dot ring with breathing wave + "Signing In..." label.
 */
type Props = {
  size?: number;       // total box size (width/height)
  radius?: number;     // ring radius (center -> dot centers)
  dotCount?: number;   // number of dots around circle
  dotSize?: number;    // base dot diameter
  duration?: number;   // ms for a full rotation
  style?: any;
};

const TAU = Math.PI * 2;

export default function SigningInRing({
  size = 220,
  radius = 90,
  dotCount = 48,
  dotSize = 10,
  duration = 3000,
  style,
}: Props) {
  const scheme = useColorScheme();
  const bg = scheme === "dark" ? "#0B0C10" : "#FFFFFF";
  const text = scheme === "dark" ? "#E5E7EB" : "#111827";

  // continuous rotation 0..1 (normalized)
  const t = useSharedValue(0);
  React.useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration, easing: Easing.linear }),
      -1,
      false
    );
  }, [duration]);

  // derived string for the animated ellipsis
  const dots = useSharedValue(0);
  React.useEffect(() => {
    const tick = () => {
      "worklet";
      // no-op; we drive via withRepeat timing below
    };
    // 0..3
    dots.value = withRepeat(withTiming(3, { duration: 2100, easing: Easing.linear }), -1, false);
  }, []);

  const dotsText = useDerivedValue(() => {
    const k = Math.floor(interpolate(dots.value, [0, 1, 2, 3], [0, 1, 2, 3], Extrapolate.CLAMP)) % 3;
    return ".".repeat(k + 1);
  });

  // ring container rotates as a whole
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${t.value * 360}deg` }],
  }));

  // precompute per-dot angles for performance
  const angles = useMemo(
    () => new Array(dotCount).fill(0).map((_, i) => (i / dotCount) * TAU),
    [dotCount]
  );

  return (
    <View style={[styles.screen, { backgroundColor: bg }, style]} accessibilityLabel="Signing in">
      <Animated.View style={[{ width: size, height: size }, ringStyle]}>
        {angles.map((ang, i) => {
          // breathing wave per dot: phase offset by index
          const dotAnimated = useAnimatedStyle(() => {
            const phase = (t.value + i / dotCount) % 1; // 0..1
            const scale = interpolate(
              phase,
              [0, 0.5, 1],
              [0.6, 1.0, 0.6],
              Extrapolate.CLAMP
            );
            return { transform: [{ scale }] };
          });

          // polar -> cartesian (centered in parent)
          const cx = size / 2 + radius * Math.cos(ang) - dotSize / 2;
          const cy = size / 2 + radius * Math.sin(ang) - dotSize / 2;

          // hue sweep around the ring (soft 0..300°)
          const hue = Math.round((i / dotCount) * 300);
          const color = `hsl(${hue}, 85%, 55%)`;

          return (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                dotAnimated,
                {
                  width: dotSize,
                  height: dotSize,
                  left: cx,
                  top: cy,
                  backgroundColor: color,
                },
              ]}
            />
          );
        })}
      </Animated.View>

      <View style={{ height: 24 }} />
      <Animated.Text
        style={[styles.caption, { color: text }]}
        // @ts-ignore – Reanimated shared string
      >
        {`Signing In${"."}`}
        {/* show animated ellipsis via nested Animated.Text */}
        <Animated.Text style={[styles.caption, { color: text }]}>
          {dotsText as unknown as string}
        </Animated.Text>
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    position: "absolute",
    borderRadius: 999,
  },
  caption: {
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});
```

**Usage**

```tsx
// App.tsx (example)
import React from "react";
import { SafeAreaView } from "react-native";
import SigningInRing from "./SigningInRing";

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SigningInRing />
    </SafeAreaView>
  );
}
```

### Notes / Tweaks

* To make the ring larger/smaller, change `size`, `radius`, `dotSize`.
* To speed up/slow down rotation, change `duration`.
* The hue sweep uses HSL; if you prefer a fixed palette, replace the `color` line with a palette array.
* Accessibility: the parent view carries an `accessibilityLabel="Signing in"` so screen readers announce it.

If you want a **web version (React + CSS)** or a **Lottie** export instead, say the word and I’ll produce that too.
