/**
 * Local project vault — IndexedDB storage for drafts (never sent to DevBench servers).
 */

const DB_NAME = "devbench-vault";
const DB_VERSION = 1;
const STORE = "entries";

export type VaultEntry = {
  id: string;
  title: string;
  toolSlug: string;
  content: string;
  content2?: string;
  createdAt: number;
  updatedAt: number;
  /** Optional AES-GCM envelope (base64) when user enables vault encryption. */
  encrypted?: boolean;
};

export type DevbenchBundle = {
  v: 1;
  exportedAt: string;
  entries: VaultEntry[];
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const os = db.createObjectStore(STORE, { keyPath: "id" });
        os.createIndex("updatedAt", "updatedAt", { unique: false });
        os.createIndex("toolSlug", "toolSlug", { unique: false });
      }
    };
  });
}

function uid(): string {
  return `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function vaultList(): Promise<VaultEntry[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => {
      const rows = (req.result as VaultEntry[]).sort((a, b) => b.updatedAt - a.updatedAt);
      resolve(rows);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function vaultSave(
  partial: Pick<VaultEntry, "title" | "toolSlug" | "content"> & {
    id?: string;
    content2?: string;
  },
): Promise<VaultEntry> {
  const db = await openDb();
  const now = Date.now();
  const entry: VaultEntry = {
    id: partial.id ?? uid(),
    title: partial.title,
    toolSlug: partial.toolSlug,
    content: partial.content,
    content2: partial.content2,
    createdAt: partial.id ? now : now,
    updatedAt: now,
  };

  if (partial.id) {
    const existing = await vaultGet(partial.id);
    if (existing) entry.createdAt = existing.createdAt;
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(entry);
    tx.oncomplete = () => resolve(entry);
    tx.onerror = () => reject(tx.error);
  });
}

export async function vaultGet(id: string): Promise<VaultEntry | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve((req.result as VaultEntry) ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function vaultDelete(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function vaultExportBundle(): Promise<DevbenchBundle> {
  const entries = await vaultList();
  return { v: 1, exportedAt: new Date().toISOString(), entries };
}

export function bundleToDownloadJson(bundle: DevbenchBundle): string {
  return JSON.stringify(bundle, null, 2);
}

export async function vaultImportBundle(
  bundle: DevbenchBundle,
  mode: "merge" | "replace",
): Promise<number> {
  if (bundle.v !== 1 || !Array.isArray(bundle.entries)) {
    throw new Error("Invalid .devbench bundle (expected v: 1 and entries array)");
  }
  const db = await openDb();
  if (mode === "replace") {
    const existing = await vaultList();
    await Promise.all(existing.map((e) => vaultDelete(e.id)));
  }
  let count = 0;
  for (const e of bundle.entries) {
    await vaultSave({
      id: mode === "merge" ? undefined : e.id,
      title: e.title,
      toolSlug: e.toolSlug,
      content: e.content,
      content2: e.content2,
    });
    count++;
  }
  void db;
  return count;
}

export function parseBundleFile(text: string): DevbenchBundle {
  const o = JSON.parse(text) as DevbenchBundle;
  if (o.v !== 1) throw new Error("Unsupported bundle version");
  return o;
}
