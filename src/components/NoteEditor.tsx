
import React, { useState, useEffect } from 'react';
import { Note } from '../types';
import { ShareIcon } from './icons/ShareIcon';
import { TrashIcon } from './icons/TrashIcon';
import { HistoryIcon } from './icons/HistoryIcon';
import MarkdownRenderer from './MarkdownRenderer';
import VersionHistory from './VersionHistory';

interface NoteEditorProps {
  note: Note;
  onSave: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onShare: (note: Note) => Promise<string>;
  onEditingChange?: (noteId: string | null) => void;
  onBack?: () => void;
  isDarkMode?: boolean;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave, onDelete, onShare, onEditingChange, onBack, isDarkMode = false }) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [isSaved, setIsSaved] = useState(true);
  const [isPreview, setIsPreview] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    
    // Clear editing flag when switching notes
    return () => {
      if (onEditingChange) {
        onEditingChange(null);
      }
    };
  }, [note, onEditingChange]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (!isSaved) {
        handleSave();
      }
    }, 1000); // Autosave after 1 second of inactivity
    
    return () => {
      clearTimeout(handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, isSaved]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setIsSaved(false);
    // Notify that we're editing this note
    if (onEditingChange) {
      onEditingChange(note.id);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsSaved(false);
    // Notify that we're editing this note
    if (onEditingChange) {
      onEditingChange(note.id);
    }
  };

  const handleSave = () => {
    onSave({ ...note, title, content });
    setIsSaved(true);
    // Clear editing flag after save
    if (onEditingChange) {
      setTimeout(() => {
        onEditingChange(null);
      }, 500);
    }
  };
  
  const handleShare = async () => {
    try {
      console.log('🔄 Starting share process for note:', note.id);
      
      // First save the note
      handleSave();
      console.log('💾 Note saved, calling onShare...');
      
      // Generate share URL
      const url = await onShare(note);
      console.log('✅ Share successful! URL:', url);
      
      if (typeof url === 'string') {
        setShareUrl(url);
        setShowShareModal(true);
      } else {
        console.error('❌ Invalid URL returned:', url);
        alert('Failed to generate share link. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error sharing note:', error);
      alert(`Failed to share note: ${error instanceof Error ? error.message : 'Unknown error'}. Please check Firebase rules.`);
    }
  };

  const copyShareLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  const closeShareModal = () => {
    setShowShareModal(false);
    setShareUrl(null);
  };

  const handleRestoreVersion = (restoredNote: Note) => {
    setTitle(restoredNote.title);
    setContent(restoredNote.content);
    onSave(restoredNote);
    setIsSaved(true);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Back button for mobile */}
          {onBack && (
            <button 
              onClick={onBack}
              className="md:hidden p-2 text-gray-500 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-400"
              aria-label="Back to notes"
              title="Back to notes"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {isSaved ? 'Saved' : 'Saving...'}
          </div>
          {note.isShared && (
            <span className="hidden sm:inline px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-300">
              Shared
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button 
            onClick={() => setIsPreview(!isPreview)} 
            className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {isPreview ? 'Edit' : 'Preview'}
          </button>
          <button 
            onClick={() => setShowVersionHistory(true)} 
            className="p-1.5 sm:p-2 text-gray-500 rounded-full hover:bg-gray-200 hover:text-gray-800 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-colors"
            aria-label="Version history"
            title="Version history"
          >
            <HistoryIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button 
            onClick={handleShare} 
            className="p-1.5 sm:p-2 text-gray-500 rounded-full hover:bg-gray-200 hover:text-gray-800 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-colors"
            aria-label="Share note"
            title="Share note"
          >
            <ShareIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button 
            onClick={() => onDelete(note.id)} 
            className="p-1.5 sm:p-2 text-gray-500 rounded-full hover:bg-gray-200 hover:text-red-600 dark:hover:bg-gray-700 dark:hover:text-red-500 transition-colors"
            aria-label="Delete note"
            title="Delete note"
          >
            <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto">
        {isPreview ? (
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              {title || 'Untitled Note'}
            </h1>
            <MarkdownRenderer content={content} isDarkMode={isDarkMode} />
          </div>
        ) : (
          <>
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Note Title"
              className="w-full text-2xl sm:text-3xl font-bold bg-transparent focus:outline-none text-gray-900 dark:text-white placeholder-gray-400"
            />
            <textarea
              value={content}
              onChange={handleContentChange}
              placeholder="Start writing... Use ```language for code blocks"
              className="w-full h-full mt-3 sm:mt-4 text-base sm:text-lg bg-transparent resize-none focus:outline-none leading-relaxed text-gray-800 dark:text-gray-300 placeholder-gray-400"
            />
          </>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && shareUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={closeShareModal}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Share Note
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
              Anyone with this link can view this note in read-only mode.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4 sm:mb-6">
              <input
                type="text"
                value={shareUrl}
                readOnly
                placeholder="Share URL"
                title="Shareable URL"
                className="flex-1 px-3 py-2 text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none dark:text-gray-200"
              />
              <button
                onClick={copyShareLink}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Copy
              </button>
            </div>
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                onClick={closeShareModal}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 text-center transition-colors"
              >
                Open Shared View
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {showVersionHistory && (
        <VersionHistory
          note={note}
          onRestore={handleRestoreVersion}
          onClose={() => setShowVersionHistory(false)}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

export default NoteEditor;
