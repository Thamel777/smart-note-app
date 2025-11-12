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
}

export const useNotes = (userId: string | null): UseNotesReturn => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
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
          // First, sync any pending changes
          await syncNotes();

          // Then load latest from Firebase
          const firebaseNotes = await loadNotesFromFirebase(userId);
          
          // Save to IndexedDB for offline access
          for (const note of firebaseNotes) {
            await saveNoteToIndexedDB(note, userId);
          }
          
          setNotes(firebaseNotes);
        } catch (err: any) {
          console.error('Error syncing with Firebase:', err);
          // Don't show error to user, local notes still work
        }
      };

      syncWithFirebase();

      // Subscribe to real-time updates when online
      const unsubscribe = subscribeToNotes(userId, async (updatedNotes) => {
        setNotes(updatedNotes);
        
        // Update IndexedDB with Firebase changes
        for (const note of updatedNotes) {
          await saveNoteToIndexedDB(note, userId);
        }
      });

      return () => unsubscribe();
    }
  }, [userId, isOnline, syncNotes]);

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
    };
    
    // Optimistically update UI
    setNotes(prevNotes => [newNote, ...prevNotes]);
    
    // Save to IndexedDB immediately (works offline)
    if (userId) {
      saveNoteToIndexedDB(newNote, userId).catch(err => {
        console.error('Error saving to IndexedDB:', err);
        setError('Failed to save note locally');
      });

      // If online, save to Firebase
      if (isOnline) {
        saveNoteToFirebase(userId, newNote).catch(err => {
          console.error('Error saving to Firebase:', err);
          // Add to sync queue for later
          addToSyncQueue('create', newNote.id, newNote);
        });
      } else {
        // Add to sync queue for when we're back online
        addToSyncQueue('create', newNote.id, newNote);
      }
    }
    
    return newNote;
  };

  const updateNote = async (updatedNote: Note): Promise<void> => {
    if (!userId) return;

    // Optimistically update UI
    setNotes(prevNotes => 
      prevNotes.map(note => note.id === updatedNote.id ? updatedNote : note)
    );

    try {
      // Save to IndexedDB immediately (works offline)
      await saveNoteToIndexedDB(updatedNote, userId);

      // If online, save to Firebase
      if (isOnline) {
        try {
          await saveNoteToFirebase(userId, updatedNote);
        } catch (err) {
          console.error('Error saving to Firebase:', err);
          // Add to sync queue for later
          await addToSyncQueue('update', updatedNote.id, updatedNote);
        }
      } else {
        // Add to sync queue for when we're back online
        await addToSyncQueue('update', updatedNote.id, updatedNote);
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Error updating note:', err);
      setError(err.message);
      // Reload notes on error
      await refreshNotes();
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

      // If online, delete from Firebase
      if (isOnline) {
        try {
          await deleteNoteFromFirebase(userId, noteId);
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
      // Load from IndexedDB first (always available)
      const localNotes = await getNotesFromIndexedDB(userId);
      setNotes(localNotes);

      // If online, also refresh from Firebase
      if (isOnline) {
        const firebaseNotes = await loadNotesFromFirebase(userId);
        setNotes(firebaseNotes);
        
        // Update IndexedDB with latest from Firebase
        for (const note of firebaseNotes) {
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
    syncNotes
  };
};
