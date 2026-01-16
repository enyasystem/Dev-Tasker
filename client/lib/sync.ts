import AsyncStorage from '@react-native-async-storage/async-storage';

const SYNC_QUEUE_KEY = '@devtasks:syncQueue';
const TASKS_KEY = '@devtasks:tasks';

export type SyncOp =
  | { type: 'create'; task: any }
  | { type: 'update'; taskId: string; updates: Partial<any> }
  | { type: 'delete'; taskId: string };

async function readQueue(): Promise<SyncOp[]> {
  try {
    const raw = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('readQueue error', err);
    return [];
  }
}

async function writeQueue(queue: SyncOp[]) {
  try {
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.warn('writeQueue error', err);
  }
}

export async function enqueueChange(op: SyncOp) {
  const q = await readQueue();
  q.push(op);
  await writeQueue(q);
}

async function clearQueue() {
  try {
    await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
  } catch (err) {
    console.warn('clearQueue error', err);
  }
}

async function getLocalTasks(): Promise<any[]> {
  try {
    const raw = await AsyncStorage.getItem(TASKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('getLocalTasks error', err);
    return [];
  }
}

async function saveLocalTasks(tasks: any[]) {
  try {
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.warn('saveLocalTasks error', err);
  }
}

// Attempt to POST queued operations to server and reconcile remote state.
export async function processQueue() {
  const queue = await readQueue();
  if (!queue.length) return;

  try {
    // send queue to server; server must implement /api/sync
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ops: queue }),
    });

    if (!res.ok) {
      console.warn('processQueue: server returned', res.status);
      return;
    }

    const payload = await res.json();
    // payload should include authoritative tasks array
    if (payload && Array.isArray(payload.tasks)) {
      // Merge remote authoritative tasks with local using updatedAt conflict resolution
      const remoteTasks = payload.tasks;
      const localTasks = await getLocalTasks();

      const merged = mergeTasks(localTasks, remoteTasks);
      await saveLocalTasks(merged);
    }

    // clear queue on success
    await clearQueue();
  } catch (err) {
    console.warn('processQueue failed', err);
  }
}

function mergeTasks(local: any[], remote: any[]) {
  const map = new Map<string, any>();

  for (const t of local) {
    if (t && t.id) map.set(t.id, t);
  }

  for (const r of remote) {
    if (!r || !r.id) continue;
    const existing = map.get(r.id);
    if (!existing) {
      map.set(r.id, r);
      continue;
    }

    const localUpdated = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0;
    const remoteUpdated = r.updatedAt ? new Date(r.updatedAt).getTime() : 0;

    if (remoteUpdated >= localUpdated) {
      map.set(r.id, r);
    } else {
      // keep local (assume will be synced)
      map.set(existing.id, existing);
    }
  }

  // include any remote tasks not in local
  return Array.from(map.values()).sort((a, b) => {
    const ta = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const tb = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return tb - ta;
  });
}

export async function pullFromServer() {
  try {
    const res = await fetch('/api/tasks');
    if (!res.ok) return;
    const payload = await res.json();
    if (payload && Array.isArray(payload.tasks)) {
      const local = await getLocalTasks();
      const merged = mergeTasks(local, payload.tasks);
      await saveLocalTasks(merged);
    }
  } catch (err) {
    console.warn('pullFromServer failed', err);
  }
}

export default {
  enqueueChange,
  processQueue,
  pullFromServer,
};
