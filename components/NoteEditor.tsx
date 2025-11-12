
import React, { useState, useEffect } from 'react';
import { Note } from '../types';
import { ShareIcon } from './icons/ShareIcon';
import { TrashIcon } from './icons/TrashIcon';

interface NoteEditorProps {
  note: Note;
  onSave: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onShare: (note: Note) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave, onDelete, onShare }) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [isSaved, setIsSaved] = useState(true);

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
  
  const handleShare = () => {
    onShare(note);
    alert(`Shareable link created for "${note.title}". In this demo, you'll be taken to the shared view.`);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {isSaved ? 'Saved' : 'Saving...'}
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={handleShare} className="p-2 text-gray-500 rounded-full hover:bg-gray-200 hover:text-gray-800 dark:hover:bg-gray-700 dark:hover:text-gray-200">
            <ShareIcon className="w-5 h-5" />
          </button>
          <button onClick={() => onDelete(note.id)} className="p-2 text-gray-500 rounded-full hover:bg-gray-200 hover:text-red-600 dark:hover:bg-gray-700 dark:hover:text-red-500">
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="flex-1 p-6 overflow-y-auto">
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
          placeholder="Start writing..."
          className="w-full h-full mt-4 text-lg bg-transparent resize-none focus:outline-none leading-relaxed text-gray-800 dark:text-gray-300"
          style={{minHeight: '60vh'}}
        />
      </div>
    </div>
  );
};

export default NoteEditor;
