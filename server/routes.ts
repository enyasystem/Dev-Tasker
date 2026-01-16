import type { Express } from 'express';
import { createServer, type Server } from 'node:http';

type Task = {
  id: string;
  title: string;
  description?: string;
  priority?: string;
  status?: string;
  project?: string;
  dueDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export async function registerRoutes(app: Express): Promise<Server> {
  // simple in-memory store for demo purposes
  const tasks = new Map<string, Task>();

  app.get('/api/tasks', (_req, res) => {
    res.json({ tasks: Array.from(tasks.values()) });
  });

  app.post('/api/sync', (req, res) => {
    const body = req.body || {};
    const ops = Array.isArray(body.ops) ? body.ops : [];

    for (const op of ops) {
      try {
        if (op.type === 'create' && op.task) {
          const t: Task = { ...op.task };
          t.updatedAt = t.updatedAt || new Date().toISOString();
          t.createdAt = t.createdAt || new Date().toISOString();
          tasks.set(t.id, t);
        } else if (op.type === 'update' && op.taskId) {
          const existing = tasks.get(op.taskId);
          if (existing) {
            const updated = { ...existing, ...(op.updates || {}) } as Task;
            updated.updatedAt = new Date().toISOString();
            tasks.set(updated.id, updated);
          }
        } else if (op.type === 'delete' && op.taskId) {
          tasks.delete(op.taskId);
        }
      } catch (err) {
        // ignore per-op errors
        console.warn('sync op failed', err);
      }
    }

    return res.json({ tasks: Array.from(tasks.values()) });
  });

  const httpServer = createServer(app);
  return httpServer;
}
