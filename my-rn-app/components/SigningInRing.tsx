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
} from "react-native-reanimated";

/**
 * Colorful rotating dot ring with breathing wave + customizable loading text.
 */
type Props = {
  size?: number; // total box size (width/height)
  radius?: number; // ring radius (center -> dot centers)
  dotCount?: number; // number of dots around circle
  dotSize?: number; // base dot diameter
  duration?: number; // ms for a full rotation
  text?: string; // loading text (default: "Loading")
  style?: any;
};

const TAU = Math.PI * 2;

export default function SigningInRing({
  size = 220,
  radius = 90,
  dotCount = 48,
  dotSize = 10,
  duration = 3000,
  text = "Loading",
  style,
}: Props) {
  const scheme = useColorScheme();
  const bg = scheme === "dark" ? "#0B0C10" : "#FFFFFF";
  const textColor = scheme === "dark" ? "#E5E7EB" : "#111827";

  // continuous rotation 0..1 (normalized)
  const t = useSharedValue(0);
  React.useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration, easing: Easing.linear }),
      -1,
      false
    );
  }, [duration]);

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
    <View
      style={[styles.screen, { backgroundColor: bg }, style]}
      accessibilityLabel={`${text}...`}
    >
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

          // hue sweep around the ring (educational/playful colors)
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
      <Text style={[styles.caption, { color: textColor }]}>{text}...</Text>
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
