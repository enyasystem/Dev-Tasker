import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Pressable, Alert, Switch } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { getTasks } from '@/lib/storage';
import { Task } from '@/types/task';

const SETTINGS_KEY = '@devtasks:settings';

interface SettingsItem {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  destructive?: boolean;
}

export default function SettingsScreen() {
  const { theme, isDark } = useTheme();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  const [taskCount, setTaskCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [hapticEnabled, setHapticEnabled] = useState(true);

  useEffect(() => {
    loadStats();
    loadSettings();
  }, []);

  const loadStats = async () => {
    const tasks = await getTasks();
    setTaskCount(tasks.length);
    setCompletedCount(tasks.filter((t: Task) => t.status === 'done').length);
  };

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem(SETTINGS_KEY);
      if (settings) {
        const parsed = JSON.parse(settings);
        setHapticEnabled(parsed.hapticEnabled ?? true);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: { hapticEnabled: boolean }) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const toggleHaptic = (value: boolean) => {
    setHapticEnabled(value);
    saveSettings({ hapticEnabled: value });
    if (value) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleClearCompleted = () => {
    Alert.alert(
      'Clear Completed Tasks',
      'This will permanently delete all completed tasks. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            const tasks = await getTasks();
            const activeTasks = tasks.filter((t: Task) => t.status !== 'done');
            await AsyncStorage.setItem('@devtasks:tasks', JSON.stringify(activeTasks));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            loadStats();
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Tasks',
      'This will permanently delete all tasks. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.setItem('@devtasks:tasks', JSON.stringify([]));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            loadStats();
          },
        },
      ]
    );
  };

  const renderSettingsItem = (item: SettingsItem, index: number) => (
    <Pressable
      key={index}
      onPress={item.onPress}
      disabled={!item.onPress}
      style={({ pressed }) => [
        styles.settingsItem,
        { backgroundColor: theme.backgroundDefault },
        pressed && item.onPress && { opacity: 0.8 },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.backgroundSecondary }]}>
        <Feather
          name={item.icon}
          size={20}
          color={item.destructive ? theme.error : theme.link}
        />
      </View>
      <View style={styles.settingsContent}>
        <ThemedText
          type="body"
          style={[styles.settingsTitle, item.destructive && { color: theme.error }]}
        >
          {item.title}
        </ThemedText>
        {item.subtitle ? (
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {item.subtitle}
          </ThemedText>
        ) : null}
      </View>
      {item.rightElement}
      {item.onPress && !item.rightElement ? (
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      ) : null}
    </Pressable>
  );

  const generalSettings: SettingsItem[] = [
    {
      icon: 'smartphone',
      title: 'Haptic Feedback',
      subtitle: 'Vibrate on interactions',
      rightElement: (
        <Switch
          value={hapticEnabled}
          onValueChange={toggleHaptic}
          trackColor={{ false: theme.backgroundTertiary, true: theme.link + '80' }}
          thumbColor={hapticEnabled ? theme.link : theme.textSecondary}
        />
      ),
    },
  ];

  const dataSettings: SettingsItem[] = [
    {
      icon: 'trash',
      title: 'Clear Completed Tasks',
      subtitle: `${completedCount} tasks completed`,
      onPress: completedCount > 0 ? handleClearCompleted : undefined,
    },
    {
      icon: 'trash-2',
      title: 'Clear All Tasks',
      subtitle: 'Delete all tasks permanently',
      onPress: taskCount > 0 ? handleClearAll : undefined,
      destructive: true,
    },
  ];

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
        },
      ]}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="check-square" size={32} color={theme.link} />
          <ThemedText type="h2" style={styles.statValue}>
            {taskCount}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Total Tasks
          </ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="award" size={32} color={theme.success} />
          <ThemedText type="h2" style={styles.statValue}>
            {completedCount}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Completed
          </ThemedText>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          General
        </ThemedText>
        <View style={styles.settingsGroup}>
          {generalSettings.map((item, index) => renderSettingsItem(item, index))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Data
        </ThemedText>
        <View style={styles.settingsGroup}>
          {dataSettings.map((item, index) => renderSettingsItem(item, index))}
        </View>
      </View>

      <View style={styles.footer}>
        <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center' }}>
          DevTasks v1.0.0
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: 'center' }}>
          Built with care for developers
        </ThemedText>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing['2xl'],
  },
  statCard: {
    flex: 1,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statValue: {
    fontWeight: '700',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: Spacing.sm,
  },
  settingsGroup: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    gap: 1,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsContent: {
    flex: 1,
  },
  settingsTitle: {
    fontWeight: '500',
  },
  footer: {
    marginTop: Spacing['3xl'],
    gap: Spacing.xs,
    paddingBottom: Spacing.xl,
  },
});
