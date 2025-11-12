
import React, { useEffect, useState } from 'react';
import { Note } from '../types';
import MarkdownRenderer from '../components/MarkdownRenderer';

interface SharedNoteViewProps {
  shareId?: string;
  note?: Note;
  onExit?: () => void;
  isUserLoggedIn: boolean;
  isDarkMode?: boolean;
}

const SharedNoteView: React.FC<SharedNoteViewProps> = ({ 
  shareId, 
  note: propNote, 
  onExit, 
  isUserLoggedIn,
  isDarkMode = false 
}) => {
  const [note, setNote] = useState<Note | null>(propNote || null);
  const [loading, setLoading] = useState(!propNote && !!shareId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If shareId is provided but no note, fetch from Firebase
    if (shareId && !propNote) {
      const loadSharedNote = async () => {
        try {
          setLoading(true);
          const { getSharedNote } = await import('../utils/shareNote');
          const sharedNote = await getSharedNote(shareId);
          
          if (sharedNote) {
            setNote(sharedNote);
          } else {
            setError('Note not found or no longer shared');
          }
        } catch (err: any) {
          console.error('Error loading shared note:', err);
          setError('Failed to load note');
        } finally {
          setLoading(false);
        }
      };

      loadSharedNote();
    }
  }, [shareId, propNote]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading note...</p>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md p-8">
          <svg 
            className="w-16 h-16 mx-auto mb-4 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {error || 'Note Not Found'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This note may have been unshared or doesn't exist.
          </p>
          {isUserLoggedIn && onExit && (
            <button 
              onClick={onExit} 
              className="px-6 py-3 text-sm font-medium text-white rounded-lg bg-primary-600 hover:bg-primary-700"
            >
              Back to Dashboard
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {isUserLoggedIn && onExit && (
          <header className="flex items-center justify-between p-4 bg-white shadow-sm dark:bg-gray-800">
            <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">Smart Note</h1>
            <button onClick={onExit} className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-primary-600 hover:bg-primary-700">
                Back to Dashboard
            </button>
          </header>
        )}
        <main className="max-w-4xl px-4 py-12 mx-auto sm:px-6 lg:px-8">
            <article className="p-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                    {note.title}
                  </h1>
                  {note.isShared && (
                    <span className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-300">
                      Shared
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Published on {new Date(note.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                </div>
                <hr className="my-8 border-gray-200 dark:border-gray-700" />
                <div className="prose prose-lg max-w-none dark:prose-invert text-gray-800 dark:text-gray-200">
                    <MarkdownRenderer content={note.content} isDarkMode={isDarkMode} />
                </div>
                
                {/* Read-only notice */}
                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    📖 This is a read-only view. Code snippets are displayed with syntax highlighting.
                  </p>
                </div>
            </article>
        </main>
    </div>
  );
};

export default SharedNoteView;
