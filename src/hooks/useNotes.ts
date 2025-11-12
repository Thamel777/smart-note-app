import { useState, useEffect } from 'react';
import { Note } from '../types';
import { 
  saveNoteToFirebase, 
  loadNotesFromFirebase, 
  deleteNoteFromFirebase,
  subscribeToNotes
} from '../utils/firebaseSync';

interface UseNotesReturn {
  notes: Note[];
  loading: boolean;
  error: string | null;
  createNote: () => Note;
  updateNote: (note: Note) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  refreshNotes: () => Promise<void>;
}

export const useNotes = (userId: string | null): UseNotesReturn => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load notes when user is authenticated
  useEffect(() => {
    if (!userId) {
      setNotes([]);
      setLoading(false);
      return;
    }

    // Load initial notes
    const loadNotes = async () => {
      try {
        setLoading(true);
        const loadedNotes = await loadNotesFromFirebase(userId);
        setNotes(loadedNotes);
        setError(null);
      } catch (err: any) {
        console.error('Error loading notes:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadNotes();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToNotes(userId, (updatedNotes) => {
      setNotes(updatedNotes);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [userId]);

  const createNote = (): Note => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      createdAt: Date.now(),
    };
    
    // Optimistically update UI
    setNotes(prevNotes => [newNote, ...prevNotes]);
    
    // Save to Firebase
    if (userId) {
      saveNoteToFirebase(userId, newNote).catch(err => {
        console.error('Error creating note:', err);
        setError('Failed to create note');
        // Rollback on error
        setNotes(prevNotes => prevNotes.filter(n => n.id !== newNote.id));
      });
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
      await saveNoteToFirebase(userId, updatedNote);
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
      await deleteNoteFromFirebase(userId, noteId);
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
      const loadedNotes = await loadNotesFromFirebase(userId);
      setNotes(loadedNotes);
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
    createNote,
    updateNote,
    deleteNote,
    refreshNotes
  };
};
