import { snapshotSchema, type Snapshot } from './schemas';

const INDEX_KEY = 'utc:clients:index';
const CLIENT_KEY = (id: string) => `utc:client:${id}`;

export interface ClientIndexItem {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

function readIndex(): ClientIndexItem[] {
  try {
    return JSON.parse(localStorage.getItem(INDEX_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeIndex(rows: ClientIndexItem[]) {
  localStorage.setItem(INDEX_KEY, JSON.stringify(rows));
}

export function listClients(): ClientIndexItem[] {
  return readIndex();
}

export function saveClient(name: string, snapshot: Snapshot, id?: string): ClientIndexItem {
  const parsed = snapshotSchema.safeParse(snapshot);
  if (!parsed.success) throw new Error('Invalid snapshot');
  const now = new Date().toISOString();
  const index = readIndex();
  const clientId = id || crypto.randomUUID();
  const existingIdx = index.findIndex((r) => r.id === clientId);
  const row: ClientIndexItem = {
    id: clientId,
    name,
    createdAt: existingIdx >= 0 ? index[existingIdx].createdAt : now,
    updatedAt: now
  };
  localStorage.setItem(CLIENT_KEY(clientId), JSON.stringify(parsed.data));
  if (existingIdx >= 0) index[existingIdx] = row; else index.unshift(row);
  writeIndex(index);
  return row;
}

export function loadClient(id: string): Snapshot | null {
  const raw = localStorage.getItem(CLIENT_KEY(id));
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw);
    const parsed = snapshotSchema.safeParse(obj);
    if (!parsed.success) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

export function deleteClient(id: string) {
  const index = readIndex().filter((r) => r.id !== id);
  writeIndex(index);
  localStorage.removeItem(CLIENT_KEY(id));
}

