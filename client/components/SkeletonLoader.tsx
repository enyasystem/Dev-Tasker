import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';

interface SkeletonLoaderProps {
  count?: number;
}

function SkeletonItem() {
  const { theme } = useTheme();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.item,
        { backgroundColor: theme.backgroundSecondary },
        animatedStyle,
      ]}
    >
      <View
        style={[styles.checkbox, { backgroundColor: theme.backgroundTertiary }]}
      />
      <View style={styles.content}>
        <View
          style={[
            styles.titleLine,
            { backgroundColor: theme.backgroundTertiary },
          ]}
        />
        <View
          style={[
            styles.metaLine,
            { backgroundColor: theme.backgroundTertiary },
          ]}
        />
      </View>
    </Animated.View>
  );
}

export function SkeletonLoader({ count = 5 }: SkeletonLoaderProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonItem key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.xs,
  },
  content: {
    flex: 1,
    gap: Spacing.sm,
  },
  titleLine: {
    height: 16,
    borderRadius: 4,
    width: '80%',
  },
  metaLine: {
    height: 12,
    borderRadius: 4,
    width: '50%',
  },
});
