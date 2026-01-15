import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  Alert,
  FlatList,
  Dimensions,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Feather } from '@expo/vector-icons';
import { Spacing, BorderRadius } from '@/constants/theme';
import { addTask, generateId } from '@/lib/storage';

const { width } = Dimensions.get('window');

const slides = [
  {
    key: 'welcome',
    title: 'Welcome to Dev‑Tasker',
    subtitle: 'A lightweight, fast task manager built for developers.',
    icon: 'check-square',
  },
  {
    key: 'features',
    title: 'Organize & Focus',
    subtitle: 'Prioritize, group, and filter tasks with ease.',
    icon: 'filter',
  },
  {
    key: 'notifications',
    title: 'Stay on Track',
    subtitle: 'Enable notifications to get timely reminders.',
    icon: 'bell',
  },
];

export default function OnboardingScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [isProcessing, setIsProcessing] = useState(false);

  const scrollX = useRef(new Animated.Value(0)).current;
  const listRef = useRef<FlatList<any> | null>(null);
  const [index, setIndex] = useState(0);

  const finishOnboarding = async () => {
    await AsyncStorage.setItem('@devtasks:onboarded', '1');
    navigation.replace('Main' as never);
  };

  const addSampleTasks = async () => {
    setIsProcessing(true);
    const now = new Date();
    const samples = [
      {
        id: generateId(),
        title: 'Plan sprint tasks',
        description: 'Break down features and assign owners',
        priority: 'high',
        status: 'todo',
        project: 'Inbox',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: generateId(),
        title: 'Review PRs',
        description: 'Look at open PRs and leave feedback',
        priority: 'medium',
        status: 'in_progress',
        project: 'Inbox',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: generateId(),
        title: 'Write release notes',
        description: 'Summarize changes for users',
        priority: 'low',
        status: 'todo',
        project: 'Inbox',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
    ];

    try {
      for (const t of samples) {
        // eslint-disable-next-line no-await-in-loop
        await addTask(t as any);
      }
      Alert.alert('Sample tasks added');
    } catch (err) {
      console.error(err);
      Alert.alert('Failed to add sample tasks');
    } finally {
      setIsProcessing(false);
    }
  };

  const requestNotifications = async () => {
    try {
      const Notifications = await import('expo-notifications');
      const result = (await Notifications.requestPermissionsAsync?.()) || { status: 'undetermined' };
      Alert.alert('Notifications', result.status === 'granted' ? 'Enabled' : 'Disabled');
    } catch (err) {
      console.warn('Notifications permission failed or module missing', err);
      Alert.alert('Notifications', 'Permission request failed or module not installed');
    }
  };

  const handleNext = () => {
    if (index === slides.length - 1) return finishOnboarding();
    listRef.current?.scrollToIndex({ index: index + 1 });
  };

  const onScroll = Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
    useNativeDriver: true,
  });

  const renderSlide = ({ item, index: i }: { item: typeof slides[0]; index: number }) => {
    const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
    const scale = scrollX.interpolate({ inputRange, outputRange: [0.85, 1, 0.85], extrapolate: 'clamp' });
    const opacity = scrollX.interpolate({ inputRange, outputRange: [0.6, 1, 0.6], extrapolate: 'clamp' });

    return (
      <View style={[styles.slide, { width }]}>
        <Animated.View style={[styles.iconWrapper, { transform: [{ scale }], opacity, backgroundColor: theme.backgroundDefault }]}> 
          <Feather name={item.icon as any} size={72} color={theme.link} />
        </Animated.View>
        <ThemedText type="h2" style={[styles.title, { color: theme.text }]}>{item.title}</ThemedText>
        <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>{item.subtitle}</ThemedText>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}> 
      <FlatList
        ref={(r) => (listRef.current = r)}
        data={slides}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={renderSlide}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotScale = scrollX.interpolate({ inputRange, outputRange: [0.8, 1.4, 0.8], extrapolate: 'clamp' });
            const dotOpacity = scrollX.interpolate({ inputRange, outputRange: [0.4, 1, 0.4], extrapolate: 'clamp' });
            return <Animated.View key={i} style={[styles.dot, { opacity: dotOpacity, transform: [{ scale: dotScale }] }]} />;
          })}
        </View>

        <View style={styles.actions}>
          {index === 1 ? (
            <Pressable onPress={addSampleTasks} style={[styles.secondaryButton, { borderColor: theme.border }]}>
              <ThemedText type="body" style={{ color: theme.link }}>Add sample tasks</ThemedText>
            </Pressable>
          ) : index === 2 ? (
            <Pressable onPress={requestNotifications} style={[styles.secondaryButton, { borderColor: theme.border }]}>
              <ThemedText type="body" style={{ color: theme.link }}>Enable notifications</ThemedText>
            </Pressable>
          ) : (
            <View style={{ width: '100%' }} />
          )}

          <Pressable onPress={handleNext} style={[styles.button, { backgroundColor: theme.link }]}>
            <ThemedText type="body" style={{ color: theme.buttonText, fontWeight: '600' }}>{index === slides.length - 1 ? 'Get Started' : 'Next'}</ThemedText>
          </Pressable>
        </View>

        <Pressable onPress={finishOnboarding} style={styles.linkButton}>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>Skip & continue</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  title: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  button: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    width: '48%',
    alignItems: 'center',
  },
  secondaryButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
  },
  linkButton: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 140,
    height: 140,
    borderRadius: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    elevation: 4,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: Spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999',
    marginHorizontal: 6,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
});


