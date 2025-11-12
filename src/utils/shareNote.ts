import { ref, set, get } from 'firebase/database';
import { database } from '../config/firebase';
import { Note } from '../types';

/**
 * Generate a unique share ID for a note
 */
export const generateShareId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

/**
 * Share a note publicly by creating a shareable link
 */
export const shareNote = async (userId: string, note: Note): Promise<string> => {
  try {
    console.log('📤 shareNote called with userId:', userId, 'noteId:', note.id);
    
    const shareId = note.shareId || generateShareId();
    console.log('🔑 Generated/using shareId:', shareId);
    
    // Save to public shared notes path
    const sharedNoteRef = ref(database, `sharedNotes/${shareId}`);
    console.log('💾 Saving to sharedNotes path...');
    
    await set(sharedNoteRef, {
      title: note.title,
      content: note.content,
      createdAt: note.createdAt,
      ownerId: userId,
      sharedAt: Date.now()
    });
    console.log('✅ Saved to sharedNotes successfully');

    // Update the user's note to mark it as shared
    const userNoteRef = ref(database, `users/${userId}/notes/${note.id}`);
    console.log('💾 Updating user note to mark as shared...');
    
    await set(userNoteRef, {
      title: note.title,
      content: note.content,
      createdAt: note.createdAt,
      updatedAt: Date.now(),
      isShared: true,
      shareId: shareId
    });
    console.log('✅ User note updated successfully');

    console.log('🎉 Share complete! Returning shareId:', shareId);
    return shareId;
  } catch (error) {
    console.error('❌ Error in shareNote:', error);
    throw new Error('Failed to share note');
  }
};

/**
 * Get a shared note by its share ID (public access, no auth required)
 */
export const getSharedNote = async (shareId: string): Promise<Note | null> => {
  try {
    const sharedNoteRef = ref(database, `sharedNotes/${shareId}`);
    const snapshot = await get(sharedNoteRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return {
        id: shareId,
        title: data.title,
        content: data.content,
        createdAt: data.createdAt,
        isShared: true,
        shareId: shareId
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting shared note:', error);
    throw new Error('Failed to load shared note');
  }
};

/**
 * Unshare a note (remove from public access)
 */
export const unshareNote = async (userId: string, note: Note): Promise<void> => {
  try {
    if (!note.shareId) return;

    // Remove from shared notes
    const sharedNoteRef = ref(database, `sharedNotes/${note.shareId}`);
    await set(sharedNoteRef, null);

    // Update user's note to remove shared status
    const userNoteRef = ref(database, `users/${userId}/notes/${note.id}`);
    await set(userNoteRef, {
      title: note.title,
      content: note.content,
      createdAt: note.createdAt,
      updatedAt: Date.now(),
      isShared: false,
      shareId: null
    });
  } catch (error) {
    console.error('Error unsharing note:', error);
    throw new Error('Failed to unshare note');
  }
};

/**
 * Generate the full shareable URL
 */
export const getShareableUrl = (shareId: string): string => {
  return `${window.location.origin}/note/${shareId}`;
};
