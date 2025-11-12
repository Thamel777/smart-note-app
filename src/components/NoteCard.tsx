
import React from 'react';
import { Note } from '../types';

interface NoteCardProps {
  note: Note;
  isActive: boolean;
  onClick: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, isActive, onClick }) => {
  const contentSnippet = note.content.substring(0, 100).replace(/```[\s\S]*?```/g, '[Code Snippet]') + (note.content.length > 100 ? '...' : '');

  const baseClasses = 'block p-4 m-2 rounded-lg cursor-pointer transition-colors duration-150';
  const activeClasses = 'bg-primary-100 dark:bg-primary-900/50';
  const inactiveClasses = 'hover:bg-gray-100 dark:hover:bg-gray-700/50';

  return (
    <div
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
      onClick={onClick}
    >
      <h3 className="font-semibold truncate text-gray-800 dark:text-gray-100">{note.title || 'Untitled Note'}</h3>
      <p className="mt-1 text-sm text-gray-500 truncate dark:text-gray-400">
        {contentSnippet || 'No content'}
      </p>
    </div>
  );
};

export default NoteCard;
