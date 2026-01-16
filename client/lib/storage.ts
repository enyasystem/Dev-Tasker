import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, Project, DEFAULT_PROJECTS } from '@/types/task';
import { enqueueChange, processQueue } from './sync';

const TASKS_KEY = '@devtasks:tasks';
const PROJECTS_KEY = '@devtasks:projects';

export async function getTasks(): Promise<Task[]> {
  try {
    const data = await AsyncStorage.getItem(TASKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading tasks:', error);
    return [];
  }
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  try {
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving tasks:', error);
  }
}

export async function addTask(task: Task): Promise<Task[]> {
  const tasks = await getTasks();
  const updatedTasks = [task, ...tasks];
  await saveTasks(updatedTasks);
  // enqueue create for background sync
  enqueueChange({ type: 'create', task });
  processQueue();
  return updatedTasks;
}

export async function updateTask(taskId: string, updates: Partial<Task>): Promise<Task[]> {
  const tasks = await getTasks();
  const updatedTasks = tasks.map((t) =>
    t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
  );
  await saveTasks(updatedTasks);
  enqueueChange({ type: 'update', taskId, updates });
  processQueue();
  return updatedTasks;
}

export async function deleteTask(taskId: string): Promise<Task[]> {
  const tasks = await getTasks();
  const updatedTasks = tasks.filter((t) => t.id !== taskId);
  await saveTasks(updatedTasks);
  enqueueChange({ type: 'delete', taskId });
  processQueue();
  return updatedTasks;
}

export async function getProjects(): Promise<Project[]> {
  try {
    const data = await AsyncStorage.getItem(PROJECTS_KEY);
    return data ? JSON.parse(data) : DEFAULT_PROJECTS;
  } catch (error) {
    console.error('Error loading projects:', error);
    return DEFAULT_PROJECTS;
  }
}

export async function saveProjects(projects: Project[]): Promise<void> {
  try {
    await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Error saving projects:', error);
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
