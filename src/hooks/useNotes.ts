import { useState, useEffect, useCallback } from 'react';
import { Note } from '../types';
import { 
  saveNoteToFirebase, 
  loadNotesFromFirebase, 
  deleteNoteFromFirebase,
  subscribeToNotes
} from '../utils/firebaseSync';
import {
  saveNoteToIndexedDB,
  getNotesFromIndexedDB,
  deleteNoteFromIndexedDB,
  addToSyncQueue,
  getSyncQueue,
  clearSyncQueue
} from '../utils/indexedDB';
import { useNetworkStatus } from './useNetworkStatus';
import { addVersion } from '../utils/versionHistory';

/**
 * Merge local and Firebase notes, keeping the most recent version of each
 */
const mergeNotes = (localNotes: Note[], firebaseNotes: Note[]): Note[] => {
  const mergedMap = new Map<string, Note>();
  
  console.log(`Merging notes - Local: ${localNotes.length}, Firebase: ${firebaseNotes.length}`);
  
  // Add all Firebase notes first
  firebaseNotes.forEach(note => {
    mergedMap.set(note.id, note);
  });
  
  // Override with local notes if they're newer
  localNotes.forEach(localNote => {
    const firebaseNote = mergedMap.get(localNote.id);
    
    if (!firebaseNote) {
      // Local-only note (created offline)
      console.log(`Keeping local-only note: ${localNote.id}`);
      mergedMap.set(localNote.id, localNote);
    } else {
      // Compare timestamps - keep the newer version
      const localTimestamp = localNote.updatedAt || localNote.createdAt;
      const firebaseTimestamp = firebaseNote.updatedAt || firebaseNote.createdAt;
      
      if (localTimestamp > firebaseTimestamp) {
        // Local version is newer
        console.log(`Local note ${localNote.id} is newer (${localTimestamp} > ${firebaseTimestamp})`);
        mergedMap.set(localNote.id, localNote);
      } else {
        console.log(`Firebase note ${firebaseNote.id} is newer or same (${firebaseTimestamp} >= ${localTimestamp})`);
      }
      // Otherwise keep Firebase version (already in map)
    }
  });
  
  return Array.from(mergedMap.values()).sort((a, b) => b.createdAt - a.createdAt);
};

interface UseNotesReturn {
  notes: Note[];
  loading: boolean;
  error: string | null;
  isOnline: boolean;
  isSyncing: boolean;
  createNote: () => Note;
  updateNote: (note: Note) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  refreshNotes: () => Promise<void>;
  syncNotes: () => Promise<void>;
  setEditingNote: (noteId: string | null) => void;
}

export const useNotes = (userId: string | null): UseNotesReturn => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const isOnline = useNetworkStatus();

  // Sync pending operations to Firebase
  const syncNotes = useCallback(async () => {
    if (!userId || !isOnline) return;

    try {
      setIsSyncing(true);
      const syncQueue = await getSyncQueue();

      if (syncQueue.length === 0) {
        setIsSyncing(false);
        return;
      }

      console.log(`Syncing ${syncQueue.length} operations to Firebase...`);

      // Process each sync operation
      for (const item of syncQueue) {
        try {
          switch (item.operation) {
            case 'create':
            case 'update':
              if (item.note) {
                await saveNoteToFirebase(userId, item.note);
              }
              break;
            case 'delete':
              await deleteNoteFromFirebase(userId, item.noteId);
              break;
          }
        } catch (err) {
          console.error(`Failed to sync ${item.operation} for note ${item.noteId}:`, err);
        }
      }

      // Clear sync queue after successful sync
      await clearSyncQueue();
      console.log('Sync completed successfully');
    } catch (err: any) {
      console.error('Error syncing notes:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [userId, isOnline]);

  // Load notes from IndexedDB first, then sync with Firebase
  useEffect(() => {
    if (!userId) {
      setNotes([]);
      setLoading(false);
      return;
    }

    // Load notes from IndexedDB (instant, works offline)
    const loadNotesFromLocal = async () => {
      try {
        setLoading(true);
        const localNotes = await getNotesFromIndexedDB(userId);
        setNotes(localNotes);
        setError(null);
      } catch (err: any) {
        console.error('Error loading notes from IndexedDB:', err);
        setError('Failed to load notes from local storage');
      } finally {
        setLoading(false);
      }
    };

    loadNotesFromLocal();

    // If online, sync with Firebase
    if (isOnline) {
      const syncWithFirebase = async () => {
        try {
          // First, sync any pending changes to Firebase
          await syncNotes();

          // Wait a moment for Firebase to persist the changes
          await new Promise(resolve => setTimeout(resolve, 500));

          // Then load latest from Firebase
          const firebaseNotes = await loadNotesFromFirebase(userId);
          const localNotes = await getNotesFromIndexedDB(userId);
          
          // Merge local and Firebase notes, keeping the most recent version
          const mergedNotes = mergeNotes(localNotes, firebaseNotes);
          
          // Update both IndexedDB and Firebase with merged notes
          for (const note of mergedNotes) {
            await saveNoteToIndexedDB(note, userId);
            
            // If a local note is newer than Firebase, update Firebase
            const firebaseNote = firebaseNotes.find(n => n.id === note.id);
            const localNote = localNotes.find(n => n.id === note.id);
            
            if (localNote && (!firebaseNote || 
                (localNote.updatedAt || localNote.createdAt) > 
                (firebaseNote.updatedAt || firebaseNote.createdAt))) {
              await saveNoteToFirebase(userId, note);
            }
          }
          
          setNotes(mergedNotes);
        } catch (err: any) {
          console.error('Error syncing with Firebase:', err);
          // Don't show error to user, local notes still work
        }
      };

      syncWithFirebase();

      // Subscribe to real-time updates when online
      const unsubscribe = subscribeToNotes(userId, async (updatedNotes) => {
        // Get current local notes (IndexedDB is source of truth)
        const localNotes = await getNotesFromIndexedDB(userId);
        const localNoteIds = new Set(localNotes.map(n => n.id));
        
        // Filter out notes that have been deleted locally
        const validFirebaseNotes = updatedNotes.filter(firebaseNote => 
          localNoteIds.has(firebaseNote.id)
        );
        
        // Merge Firebase updates with local notes
        const mergedNotes = localNotes.map(localNote => {
          const firebaseNote = validFirebaseNotes.find(fn => fn.id === localNote.id);
          
          // If user is editing this note, keep local version
          if (editingNoteId === localNote.id) {
            return localNote;
          }
          
          // If Firebase has a newer version, use it
          if (firebaseNote) {
            const localTimestamp = localNote.updatedAt || localNote.createdAt;
            const firebaseTimestamp = firebaseNote.updatedAt || firebaseNote.createdAt;
            
            if (firebaseTimestamp >= localTimestamp) {
              return firebaseNote;
            }
          }
          
          return localNote;
        });
        
        setNotes(mergedNotes);
        
        // Update IndexedDB with Firebase changes
        for (const note of mergedNotes) {
          if (note.id !== editingNoteId) {
            await saveNoteToIndexedDB(note, userId);
          }
        }
      });

      return () => unsubscribe();
    }
  }, [userId, isOnline, syncNotes, editingNoteId]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && userId) {
      console.log('Back online - syncing...');
      syncNotes();
    }
  }, [isOnline, userId, syncNotes]);

  const createNote = (): Note => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    // Add initial version
    const noteWithVersion = addVersion(newNote, 'created');
    
    // Optimistically update UI
    setNotes(prevNotes => [noteWithVersion, ...prevNotes]);
    
    // Save to IndexedDB immediately (works offline)
    if (userId) {
      saveNoteToIndexedDB(noteWithVersion, userId).catch(err => {
        console.error('Error saving to IndexedDB:', err);
        setError('Failed to save note locally');
      });

      // If online, save to Firebase
      if (isOnline) {
        saveNoteToFirebase(userId, noteWithVersion).catch(err => {
          console.error('Error saving to Firebase:', err);
          // Add to sync queue for later
          addToSyncQueue('create', noteWithVersion.id, noteWithVersion);
        });
      } else {
        // Add to sync queue for when we're back online
        addToSyncQueue('create', noteWithVersion.id, noteWithVersion);
      }
    }
    
    return noteWithVersion;
  };

  const updateNote = async (updatedNote: Note): Promise<void> => {
    if (!userId) return;

    // Mark note as being edited to prevent Firebase overwrites
    setEditingNoteId(updatedNote.id);

    // Add version snapshot before saving
    const noteWithVersion = addVersion(
      { ...updatedNote, updatedAt: Date.now() },
      'edited'
    );

    // Optimistically update UI
    setNotes(prevNotes => 
      prevNotes.map(note => note.id === noteWithVersion.id ? noteWithVersion : note)
    );

    try {
      // Save to IndexedDB immediately (works offline)
      await saveNoteToIndexedDB(noteWithVersion, userId);

      // If online, save to Firebase
      if (isOnline) {
        try {
          await saveNoteToFirebase(userId, noteWithVersion);
        } catch (err) {
          console.error('Error saving to Firebase:', err);
          // Add to sync queue for later
          await addToSyncQueue('update', noteWithVersion.id, noteWithVersion);
        }
      } else {
        // Add to sync queue for when we're back online
        await addToSyncQueue('update', noteWithVersion.id, noteWithVersion);
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Error updating note:', err);
      setError(err.message);
      // Reload notes on error
      await refreshNotes();
    } finally {
      // Clear editing flag after a delay to allow save to complete
      setTimeout(() => {
        setEditingNoteId(null);
      }, 1000);
    }
  };

  const deleteNote = async (noteId: string): Promise<void> => {
    if (!userId) return;

    // Store deleted note for rollback
    const deletedNote = notes.find(n => n.id === noteId);
    
    // Optimistically update UI
    setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));

    try {
      // Delete from IndexedDB immediately (works offline)
      await deleteNoteFromIndexedDB(noteId);

      // If online, delete from Firebase immediately and wait for completion
      if (isOnline) {
        try {
          await deleteNoteFromFirebase(userId, noteId);
          console.log(`Note ${noteId} deleted from Firebase`);
        } catch (err) {
          console.error('Error deleting from Firebase:', err);
          // Add to sync queue for later
          await addToSyncQueue('delete', noteId);
        }
      } else {
        // Add to sync queue for when we're back online
        await addToSyncQueue('delete', noteId);
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Error deleting note:', err);
      setError(err.message);
      // Rollback on error
      if (deletedNote) {
        setNotes(prevNotes => [...prevNotes, deletedNote]);
      }
    }
  };

  const refreshNotes = async (): Promise<void> => {
    if (!userId) return;

    try {
      // Load from IndexedDB first (source of truth)
      const localNotes = await getNotesFromIndexedDB(userId);
      setNotes(localNotes);

      // If online, merge with Firebase but respect local deletions
      if (isOnline) {
        const firebaseNotes = await loadNotesFromFirebase(userId);
        const localNoteIds = new Set(localNotes.map(n => n.id));
        
        // Filter out notes that have been deleted locally
        const validFirebaseNotes = firebaseNotes.filter(fn => localNoteIds.has(fn.id));
        
        // Merge, preferring Firebase if it has newer versions
        const mergedNotes = localNotes.map(localNote => {
          const firebaseNote = validFirebaseNotes.find(fn => fn.id === localNote.id);
          
          if (firebaseNote) {
            const localTimestamp = localNote.updatedAt || localNote.createdAt;
            const firebaseTimestamp = firebaseNote.updatedAt || firebaseNote.createdAt;
            
            // Use Firebase version if it's newer or equal
            return firebaseTimestamp >= localTimestamp ? firebaseNote : localNote;
          }
          
          return localNote;
        });
        
        setNotes(mergedNotes);
        
        // Update IndexedDB with merged results
        for (const note of mergedNotes) {
          await saveNoteToIndexedDB(note, userId);
        }
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Error refreshing notes:', err);
      setError(err.message);
    }
  };

  return {
    notes,
    loading,
    error,
    isOnline,
    isSyncing,
    createNote,
    updateNote,
    deleteNote,
    refreshNotes,
    syncNotes,
    setEditingNote: setEditingNoteId
  };
};
