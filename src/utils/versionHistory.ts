import { Note, NoteVersion } from '../types';

const MAX_VERSIONS = 10; // Keep last 10 versions

/**
 * Create a version snapshot from the current note
 */
export const createVersion = (note: Note, changeType: 'created' | 'edited' | 'restored' = 'edited'): NoteVersion => {
  return {
    id: `${note.id}-v${Date.now()}`,
    title: note.title,
    content: note.content,
    timestamp: Date.now(),
    changeType
  };
};

/**
 * Add a new version to the note's version history
 */
export const addVersion = (note: Note, changeType: 'created' | 'edited' | 'restored' = 'edited'): Note => {
  const versions = note.versions || [];
  const newVersion = createVersion(note, changeType);
  
  // Check if content actually changed
  if (versions.length > 0) {
    const lastVersion = versions[versions.length - 1];
    if (lastVersion.title === note.title && lastVersion.content === note.content) {
      // No changes, don't create new version
      return note;
    }
  }
  
  // Add new version and keep only last MAX_VERSIONS
  const updatedVersions = [...versions, newVersion].slice(-MAX_VERSIONS);
  
  return {
    ...note,
    updatedAt: Date.now(),
    versions: updatedVersions
  };
};

/**
 * Restore a note to a specific version
 */
export const restoreVersion = (note: Note, versionId: string): Note => {
  const version = note.versions?.find(v => v.id === versionId);
  
  if (!version) {
    throw new Error('Version not found');
  }
  
  // Create a version of current state before restoring
  const noteWithCurrentVersion = addVersion(note, 'edited');
  
  // Restore to the selected version
  return {
    ...noteWithCurrentVersion,
    title: version.title,
    content: version.content,
    updatedAt: Date.now()
  };
};

/**
 * Get version history sorted by timestamp (newest first)
 */
export const getVersionHistory = (note: Note): NoteVersion[] => {
  return (note.versions || []).sort((a, b) => b.timestamp - a.timestamp);
};

/**
 * Format timestamp for display
 */
export const formatVersionDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

/**
 * Compare two versions and get change summary
 */
export const getChangeSummary = (oldVersion: NoteVersion, newVersion: NoteVersion): string => {
  const titleChanged = oldVersion.title !== newVersion.title;
  const contentChanged = oldVersion.content !== newVersion.content;
  
  if (titleChanged && contentChanged) return 'Title and content changed';
  if (titleChanged) return 'Title changed';
  if (contentChanged) return 'Content changed';
  return 'No changes';
};
