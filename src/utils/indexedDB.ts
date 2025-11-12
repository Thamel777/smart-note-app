import { Note } from '../types';

const DB_NAME = 'SmartNoteDB';
const DB_VERSION = 1;
const NOTES_STORE = 'notes';
const SYNC_QUEUE_STORE = 'syncQueue';

interface SyncQueueItem {
  id: string;
  operation: 'create' | 'update' | 'delete';
  noteId: string;
  note?: Note;
  timestamp: number;
}

/**
 * Initialize IndexedDB
 */
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create notes store
      if (!db.objectStoreNames.contains(NOTES_STORE)) {
        const notesStore = db.createObjectStore(NOTES_STORE, { keyPath: 'id' });
        notesStore.createIndex('createdAt', 'createdAt', { unique: false });
        notesStore.createIndex('userId', 'userId', { unique: false });
      }

      // Create sync queue store
      if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
        const syncStore = db.createObjectStore(SYNC_QUEUE_STORE, { keyPath: 'id' });
        syncStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

/**
 * Save a note to IndexedDB
 */
export const saveNoteToIndexedDB = async (note: Note, userId: string): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction([NOTES_STORE], 'readwrite');
  const store = transaction.objectStore(NOTES_STORE);
  
  const noteWithUserId = { ...note, userId };
  store.put(noteWithUserId);

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
};

/**
 * Get all notes for a user from IndexedDB
 */
export const getNotesFromIndexedDB = async (userId: string): Promise<Note[]> => {
  const db = await initDB();
  const transaction = db.transaction([NOTES_STORE], 'readonly');
  const store = transaction.objectStore(NOTES_STORE);
  const index = store.index('userId');
  const request = index.getAll(userId);

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      db.close();
      const notes = request.result.map(({ userId, ...note }) => note as Note);
      resolve(notes);
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
};

/**
 * Get a single note from IndexedDB
 */
export const getNoteFromIndexedDB = async (noteId: string): Promise<Note | null> => {
  const db = await initDB();
  const transaction = db.transaction([NOTES_STORE], 'readonly');
  const store = transaction.objectStore(NOTES_STORE);
  const request = store.get(noteId);

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      db.close();
      if (request.result) {
        const { userId, ...note } = request.result;
        resolve(note as Note);
      } else {
        resolve(null);
      }
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
};

/**
 * Delete a note from IndexedDB
 */
export const deleteNoteFromIndexedDB = async (noteId: string): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction([NOTES_STORE], 'readwrite');
  const store = transaction.objectStore(NOTES_STORE);
  store.delete(noteId);

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
};

/**
 * Clear all notes for a user from IndexedDB
 */
export const clearNotesFromIndexedDB = async (userId: string): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction([NOTES_STORE], 'readwrite');
  const store = transaction.objectStore(NOTES_STORE);
  const index = store.index('userId');
  const request = index.openCursor(userId);

  return new Promise((resolve, reject) => {
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
};

/**
 * Add operation to sync queue
 */
export const addToSyncQueue = async (
  operation: 'create' | 'update' | 'delete',
  noteId: string,
  note?: Note
): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction([SYNC_QUEUE_STORE], 'readwrite');
  const store = transaction.objectStore(SYNC_QUEUE_STORE);

  const queueItem: SyncQueueItem = {
    id: `${Date.now()}_${noteId}`,
    operation,
    noteId,
    note,
    timestamp: Date.now()
  };

  store.put(queueItem);

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
};

/**
 * Get all pending sync operations
 */
export const getSyncQueue = async (): Promise<SyncQueueItem[]> => {
  const db = await initDB();
  const transaction = db.transaction([SYNC_QUEUE_STORE], 'readonly');
  const store = transaction.objectStore(SYNC_QUEUE_STORE);
  const request = store.getAll();

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      db.close();
      resolve(request.result);
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
};

/**
 * Clear sync queue after successful sync
 */
export const clearSyncQueue = async (): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction([SYNC_QUEUE_STORE], 'readwrite');
  const store = transaction.objectStore(SYNC_QUEUE_STORE);
  store.clear();

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
};

/**
 * Remove specific item from sync queue
 */
export const removeFromSyncQueue = async (queueItemId: string): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction([SYNC_QUEUE_STORE], 'readwrite');
  const store = transaction.objectStore(SYNC_QUEUE_STORE);
  store.delete(queueItemId);

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
};
