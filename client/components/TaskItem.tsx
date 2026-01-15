import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { Task, Priority } from '@/types/task';

interface TaskItemProps {
  task: Task;
  onToggleStatus: (taskId: string) => void;
  onPress: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function getPriorityColor(priority: Priority, theme: any): string {
  switch (priority) {
    case 'high':
      return theme.priorityHigh;
    case 'medium':
      return theme.priorityMedium;
    case 'low':
      return theme.priorityLow;
    default:
      return theme.textSecondary;
  }
}

function formatDueDate(dateString?: string): string | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isOverdue(dateString?: string): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

export function TaskItem({ task, onToggleStatus, onPress, onDelete }: TaskItemProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const deleteOpacity = useSharedValue(0);

  const isDone = task.status === 'done';
  const priorityColor = getPriorityColor(task.priority, theme);
  const dueText = formatDueDate(task.dueDate);
  const overdue = isOverdue(task.dueDate) && !isDone;

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleStatus(task.id);
  };

  const handlePress = () => {
    onPress(task);
  };

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onDelete(task.id);
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .onUpdate((e) => {
      if (e.translationX < 0) {
        translateX.value = Math.max(e.translationX, -100);
        deleteOpacity.value = Math.min(Math.abs(e.translationX) / 100, 1);
      }
    })
    .onEnd((e) => {
      if (e.translationX < -80) {
        runOnJS(handleDelete)();
      }
      translateX.value = withSpring(0);
      deleteOpacity.value = withTiming(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: translateX.value }],
  }));

  const deleteBackgroundStyle = useAnimatedStyle(() => ({
    opacity: deleteOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.deleteBackground,
          { backgroundColor: theme.error },
          deleteBackgroundStyle,
        ]}
      >
        <Feather name="trash-2" size={20} color="#FFFFFF" />
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <AnimatedPressable
          onPress={handlePress}
          onPressIn={() => {
            scale.value = withSpring(0.98);
          }}
          onPressOut={() => {
            scale.value = withSpring(1);
          }}
          style={[
            styles.card,
            { backgroundColor: theme.backgroundDefault },
            animatedStyle,
          ]}
          testID={`task-item-${task.id}`}
        >
          <Pressable
            onPress={handleToggle}
            style={[
              styles.checkbox,
              {
                borderColor: isDone ? theme.success : priorityColor,
                backgroundColor: isDone ? theme.success : 'transparent',
              },
            ]}
            testID={`task-checkbox-${task.id}`}
          >
            {isDone ? <Feather name="check" size={14} color="#FFFFFF" /> : null}
          </Pressable>

          <View style={styles.content}>
            <ThemedText
              type="body"
              style={[
                styles.title,
                isDone && { textDecorationLine: 'line-through', opacity: 0.5 },
              ]}
              numberOfLines={2}
            >
              {task.title}
            </ThemedText>

            <View style={styles.meta}>
              {task.project ? (
                <View style={styles.tag}>
                  <Feather name="folder" size={12} color={theme.textSecondary} />
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    {task.project}
                  </ThemedText>
                </View>
              ) : null}

              {dueText ? (
                <View style={styles.tag}>
                  <Feather
                    name="calendar"
                    size={12}
                    color={overdue ? theme.error : theme.textSecondary}
                  />
                  <ThemedText
                    type="small"
                    style={{ color: overdue ? theme.error : theme.textSecondary }}
                  >
                    {dueText}
                  </ThemedText>
                </View>
              ) : null}

              <View
                style={[styles.priorityDot, { backgroundColor: priorityColor }]}
              />
            </View>
          </View>

          <Feather name="chevron-right" size={18} color={theme.textSecondary} />
        </AnimatedPressable>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
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
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    gap: Spacing.xs,
  },
  title: {
    fontWeight: '500',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
