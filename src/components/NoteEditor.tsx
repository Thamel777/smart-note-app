
import React, { useState, useEffect } from 'react';
import { Note } from '../types';
import { ShareIcon } from './icons/ShareIcon';
import { TrashIcon } from './icons/TrashIcon';
import MarkdownRenderer from './MarkdownRenderer';

interface NoteEditorProps {
  note: Note;
  onSave: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onShare: (note: Note) => void;
  isDarkMode?: boolean;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave, onDelete, onShare, isDarkMode = false }) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [isSaved, setIsSaved] = useState(true);
  const [isPreview, setIsPreview] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note]);

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
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsSaved(false);
  };

  const handleSave = () => {
    onSave({ ...note, title, content });
    setIsSaved(true);
  };
  
  const handleShare = async () => {
    try {
      // First save the note
      handleSave();
      
      // Generate share URL
      const url = await onShare(note);
      if (typeof url === 'string') {
        setShareUrl(url);
        setShowShareModal(true);
      }
    } catch (error) {
      console.error('Error sharing note:', error);
      alert('Failed to share note. Please try again.');
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

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {isSaved ? 'Saved' : 'Saving...'}
          </div>
          {note.isShared && (
            <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-300">
              Shared
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setIsPreview(!isPreview)} 
            className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            {isPreview ? 'Edit' : 'Preview'}
          </button>
          <button 
            onClick={handleShare} 
            className="p-2 text-gray-500 rounded-full hover:bg-gray-200 hover:text-gray-800 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            aria-label="Share note"
            title="Share note"
          >
            <ShareIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onDelete(note.id)} 
            className="p-2 text-gray-500 rounded-full hover:bg-gray-200 hover:text-red-600 dark:hover:bg-gray-700 dark:hover:text-red-500"
            aria-label="Delete note"
            title="Delete note"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 p-6 overflow-y-auto">
        {isPreview ? (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
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
              className="w-full text-3xl font-bold bg-transparent focus:outline-none text-gray-900 dark:text-white"
            />
            <textarea
              value={content}
              onChange={handleContentChange}
              placeholder="Start writing... Use ```language for code blocks"
              className="w-full h-full mt-4 text-lg bg-transparent resize-none focus:outline-none leading-relaxed text-gray-800 dark:text-gray-300"
            />
          </>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && shareUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={closeShareModal}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Share Note
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Anyone with this link can view this note in read-only mode.
            </p>
            <div className="flex items-center space-x-2 mb-6">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none"
              />
              <button
                onClick={copyShareLink}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
              >
                Copy
              </button>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={closeShareModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Close
              </button>
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
              >
                Open Shared View
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteEditor;
