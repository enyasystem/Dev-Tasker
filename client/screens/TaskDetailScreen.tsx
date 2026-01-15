import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Pressable, Alert, ScrollView } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';
import DatePickerCompat from '@/components/DatePickerCompat';

import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { Task, Priority, TaskStatus, DEFAULT_PROJECTS } from '@/types/task';
import { updateTask, deleteTask } from '@/lib/storage';
import { RootStackParamList } from '@/navigation/RootStackNavigator';

const PRIORITIES: { key: Priority; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { key: 'low', label: 'Low', icon: 'arrow-down' },
  { key: 'medium', label: 'Medium', icon: 'minus' },
  { key: 'high', label: 'High', icon: 'arrow-up' },
];

const STATUSES: { key: TaskStatus; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { key: 'todo', label: 'To Do', icon: 'circle' },
  { key: 'in_progress', label: 'In Progress', icon: 'clock' },
  { key: 'done', label: 'Done', icon: 'check-circle' },
];

export default function TaskDetailScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'TaskDetail'>>();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();

  const { task: initialTask } = route.params;

  const [title, setTitle] = useState(initialTask.title);
  const [description, setDescription] = useState(initialTask.description || '');
  const [priority, setPriority] = useState<Priority>(initialTask.priority);
  const [status, setStatus] = useState<TaskStatus>(initialTask.status);
  const [project, setProject] = useState(initialTask.project || 'Inbox');
  const [dueDate, setDueDate] = useState<Date | null>(
    initialTask.dueDate ? new Date(initialTask.dueDate) : null
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const getPriorityColor = (p: Priority) => {
    switch (p) {
      case 'high':
        return theme.priorityHigh;
      case 'medium':
        return theme.priorityMedium;
      case 'low':
        return theme.priorityLow;
    }
  };

  const getStatusColor = (s: TaskStatus) => {
    switch (s) {
      case 'done':
        return theme.success;
      case 'in_progress':
        return theme.warning;
      case 'todo':
        return theme.textSecondary;
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsSaving(true);

    await updateTask(initialTask.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      status,
      project,
      dueDate: dueDate?.toISOString(),
      completedAt: status === 'done' ? new Date().toISOString() : undefined,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteTask(initialTask.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const clearDate = () => {
    setDueDate(null);
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
    >
      <View style={styles.section}>
        <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
          Task Title
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            styles.titleInput,
            {
              backgroundColor: theme.backgroundDefault,
              color: theme.text,
            },
          ]}
          value={title}
          onChangeText={setTitle}
          placeholder="What needs to be done?"
          placeholderTextColor={theme.textSecondary}
          testID="input-title"
        />
      </View>

      <View style={styles.section}>
        <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
          Description
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            styles.descriptionInput,
            {
              backgroundColor: theme.backgroundDefault,
              color: theme.text,
            },
          ]}
          value={description}
          onChangeText={setDescription}
          placeholder="Add more details..."
          placeholderTextColor={theme.textSecondary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          testID="input-description"
        />
      </View>

      <View style={styles.section}>
        <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
          Status
        </ThemedText>
        <View style={styles.statusRow}>
          {STATUSES.map((s) => (
            <Pressable
              key={s.key}
              onPress={() => {
                Haptics.selectionAsync();
                setStatus(s.key);
              }}
              style={[
                styles.statusButton,
                {
                  backgroundColor:
                    status === s.key
                      ? getStatusColor(s.key) + '20'
                      : theme.backgroundDefault,
                  borderColor: status === s.key ? getStatusColor(s.key) : 'transparent',
                },
              ]}
            >
              <Feather
                name={s.icon}
                size={16}
                color={status === s.key ? getStatusColor(s.key) : theme.textSecondary}
              />
              <ThemedText
                type="small"
                style={{
                  color: status === s.key ? getStatusColor(s.key) : theme.textSecondary,
                  fontWeight: status === s.key ? '600' : '400',
                }}
              >
                {s.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
          Priority
        </ThemedText>
        <View style={styles.priorityRow}>
          {PRIORITIES.map((p) => (
            <Pressable
              key={p.key}
              onPress={() => {
                Haptics.selectionAsync();
                setPriority(p.key);
              }}
              style={[
                styles.priorityButton,
                {
                  backgroundColor:
                    priority === p.key
                      ? getPriorityColor(p.key) + '20'
                      : theme.backgroundDefault,
                  borderColor:
                    priority === p.key ? getPriorityColor(p.key) : 'transparent',
                },
              ]}
            >
              <Feather
                name={p.icon}
                size={16}
                color={priority === p.key ? getPriorityColor(p.key) : theme.textSecondary}
              />
              <ThemedText
                type="small"
                style={{
                  color: priority === p.key ? getPriorityColor(p.key) : theme.textSecondary,
                  fontWeight: priority === p.key ? '600' : '400',
                }}
              >
                {p.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
          Project
        </ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.projectRow}
        >
          {DEFAULT_PROJECTS.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => {
                Haptics.selectionAsync();
                setProject(p.name);
              }}
              style={[
                styles.projectChip,
                {
                  backgroundColor:
                    project === p.name ? p.color + '20' : theme.backgroundDefault,
                  borderColor: project === p.name ? p.color : 'transparent',
                },
              ]}
            >
              <View style={[styles.projectDot, { backgroundColor: p.color }]} />
              <ThemedText
                type="small"
                style={{
                  color: project === p.name ? p.color : theme.textSecondary,
                  fontWeight: project === p.name ? '600' : '400',
                }}
              >
                {p.name}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
          Due Date
        </ThemedText>
        <View style={styles.dateRow}>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            style={[
              styles.dateButton,
              {
                backgroundColor: theme.backgroundDefault,
                flex: 1,
              },
            ]}
          >
            <Feather name="calendar" size={18} color={theme.link} />
            <ThemedText type="body">
              {dueDate
                ? dueDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })
                : 'Select date'}
            </ThemedText>
          </Pressable>
          {dueDate ? (
            <Pressable
              onPress={clearDate}
              style={[styles.clearButton, { backgroundColor: theme.backgroundDefault }]}
            >
              <Feather name="x" size={18} color={theme.textSecondary} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {showDatePicker ? (
        <DatePickerCompat value={dueDate} onChange={(d) => { setShowDatePicker(false); setDueDate(d); }} />
      ) : null}

      <View style={styles.buttonContainer}>
        <Button onPress={handleSave} disabled={!title.trim() || isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>

        <Pressable onPress={handleDelete} style={styles.deleteButton}>
          <Feather name="trash-2" size={18} color={theme.error} />
          <ThemedText type="body" style={{ color: theme.error }}>
            Delete Task
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.metaSection}>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          Created:{' '}
          {new Date(initialTask.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </ThemedText>
        {initialTask.completedAt ? (
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Completed:{' '}
            {new Date(initialTask.completedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </ThemedText>
        ) : null}
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
    flexGrow: 1,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  label: {
    marginBottom: Spacing.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
  },
  titleInput: {
    height: Spacing.inputHeight,
  },
  descriptionInput: {
    minHeight: 100,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statusButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  priorityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
  },
  projectRow: {
    gap: Spacing.sm,
  },
  projectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
  },
  projectDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dateRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    height: Spacing.inputHeight,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  clearButton: {
    width: Spacing.inputHeight,
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    marginTop: 'auto',
    paddingTop: Spacing.xl,
    gap: Spacing.lg,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
  },
  metaSection: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
    gap: Spacing.xs,
  },
});
