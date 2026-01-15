export type Priority = 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  dueDate?: string;
  project?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
}

export const DEFAULT_PROJECTS: Project[] = [
  { id: 'inbox', name: 'Inbox', color: '#6366F1' },
  { id: 'work', name: 'Work', color: '#8B5CF6' },
  { id: 'personal', name: 'Personal', color: '#10B981' },
  { id: 'learning', name: 'Learning', color: '#F59E0B' },
];
