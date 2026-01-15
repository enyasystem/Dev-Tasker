import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { TaskItem } from '@/components/TaskItem';
import { EmptyState } from '@/components/EmptyState';
import { FilterChip } from '@/components/FilterChip';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { StatsCard } from '@/components/StatsCard';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Spacing } from '@/constants/theme';
import { Task, TaskStatus } from '@/types/task';
import { getTasks, updateTask, deleteTask } from '@/lib/storage';
import { RootStackParamList } from '@/navigation/RootStackNavigator';

type Filter = 'all' | 'todo' | 'in_progress' | 'done';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
];

export default function TasksScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadTasks = useCallback(async () => {
    try {
      const loadedTasks = await getTasks();
      setTasks(loadedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadTasks();
    });
    return unsubscribe;
  }, [navigation, loadTasks]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadTasks();
  };

  const handleToggleStatus = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done';
    const updates: Partial<Task> = {
      status: newStatus,
      completedAt: newStatus === 'done' ? new Date().toISOString() : undefined,
    };

    const updatedTasks = await updateTask(taskId, updates);
    setTasks(updatedTasks);
  };

  const handleTaskPress = (task: Task) => {
    navigation.navigate('TaskDetail', { task });
  };

  const handleDeleteTask = async (taskId: string) => {
    const updatedTasks = await deleteTask(taskId);
    setTasks(updatedTasks);
  };

  const handleAddTask = () => {
    navigation.navigate('AddTask');
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Animated.View entering={FadeInDown.delay(100)} style={styles.statsRow}>
        <StatsCard
          icon="list"
          value={stats.total}
          label="Total"
          color={theme.link}
        />
        <StatsCard
          icon="clock"
          value={stats.inProgress}
          label="In Progress"
          color={theme.warning}
        />
        <StatsCard
          icon="check-circle"
          value={stats.done}
          label="Done"
          color={theme.success}
        />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200)} style={styles.filterRow}>
        {FILTERS.map((f) => (
          <FilterChip
            key={f.key}
            label={f.label}
            isActive={filter === f.key}
            onPress={() => setFilter(f.key)}
          />
        ))}
      </Animated.View>

      <ThemedText type="h4" style={styles.sectionTitle}>
        {filter === 'all' ? 'All Tasks' : FILTERS.find((f) => f.key === filter)?.label}
      </ThemedText>
    </View>
  );

  const renderTask = ({ item, index }: { item: Task; index: number }) => (
    <Animated.View entering={FadeInDown.delay(300 + index * 50).springify()}>
      <TaskItem
        task={item}
        onToggleStatus={handleToggleStatus}
        onPress={handleTaskPress}
        onDelete={handleDeleteTask}
      />
    </Animated.View>
  );

  const renderEmpty = () => (
    <EmptyState
      icon="check-square"
      title="No tasks yet"
      description="Tap the + button to create your first task and start being productive"
    />
  );

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.backgroundRoot,
            paddingTop: headerHeight + Spacing.xl,
          },
        ]}
      >
        <SkeletonLoader count={6} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.list,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing.xl + 80,
          },
          filteredTasks.length === 0 && styles.emptyList,
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.link}
            progressViewOffset={headerHeight}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      <FloatingActionButton onPress={handleAddTask} bottom={tabBarHeight} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    flexGrow: 1,
  },
  emptyList: {
    flex: 1,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
  },
});
