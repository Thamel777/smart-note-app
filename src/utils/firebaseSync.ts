import { ref, set, get, remove, onValue, off } from 'firebase/database';
import { database } from '../config/firebase';
import { Note } from '../types';

/**
 * Save a note to Firebase RTDB under the user's notes
 */
export const saveNoteToFirebase = async (userId: string, note: Note): Promise<void> => {
  try {
    const noteRef = ref(database, `users/${userId}/notes/${note.id}`);
    await set(noteRef, {
      title: note.title,
      content: note.content,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt || Date.now(),
      shareId: note.shareId || null,
      versions: note.versions || []
    });
  } catch (error) {
    console.error('Error saving note to Firebase:', error);
    throw new Error('Failed to save note to cloud');
  }
};

/**
 * Load all notes for a user from Firebase RTDB
 */
export const loadNotesFromFirebase = async (userId: string): Promise<Note[]> => {
  try {
    const notesRef = ref(database, `users/${userId}/notes`);
    const snapshot = await get(notesRef);
    
    if (snapshot.exists()) {
      const notesData = snapshot.val();
      const notes: Note[] = Object.keys(notesData).map(id => ({
        id,
        title: notesData[id].title,
        content: notesData[id].content,
        createdAt: notesData[id].createdAt,
        updatedAt: notesData[id].updatedAt,
        shareId: notesData[id].shareId,
        versions: notesData[id].versions || []
      }));
      return notes;
    }
    
    return [];
  } catch (error) {
    console.error('Error loading notes from Firebase:', error);
    throw new Error('Failed to load notes from cloud');
  }
};

/**
 * Delete a note from Firebase RTDB
 */
export const deleteNoteFromFirebase = async (userId: string, noteId: string): Promise<void> => {
  try {
    const noteRef = ref(database, `users/${userId}/notes/${noteId}`);
    await remove(noteRef);
  } catch (error) {
    console.error('Error deleting note from Firebase:', error);
    throw new Error('Failed to delete note from cloud');
  }
};

/**
 * Subscribe to real-time updates for all notes
 * Returns an unsubscribe function
 */
export const subscribeToNotes = (
  userId: string, 
  callback: (notes: Note[]) => void
): (() => void) => {
  const notesRef = ref(database, `users/${userId}/notes`);
  
  const unsubscribe = onValue(notesRef, (snapshot) => {
    if (snapshot.exists()) {
      const notesData = snapshot.val();
      const notes: Note[] = Object.keys(notesData).map(id => ({
        id,
        title: notesData[id].title,
        content: notesData[id].content,
        createdAt: notesData[id].createdAt,
        updatedAt: notesData[id].updatedAt,
        shareId: notesData[id].shareId,
        versions: notesData[id].versions || []
      }));
      callback(notes);
    } else {
      callback([]);
    }
  }, (error) => {
    console.error('Error subscribing to notes:', error);
  });

  // Return cleanup function
  return () => off(notesRef, 'value', unsubscribe);
};

/**
 * Batch save multiple notes (useful for initial sync)
 */
export const batchSaveNotes = async (userId: string, notes: Note[]): Promise<void> => {
  try {
    const promises = notes.map(note => saveNoteToFirebase(userId, note));
    await Promise.all(promises);
  } catch (error) {
    console.error('Error batch saving notes:', error);
    throw new Error('Failed to sync notes to cloud');
  }
};
