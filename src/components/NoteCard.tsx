
import React from 'react';
import { Note } from '../types';

interface NoteCardProps {
  note: Note;
  isActive: boolean;
  onClick: () => void;
  searchTerm?: string;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, isActive, onClick, searchTerm = '' }) => {
  const contentSnippet = note.content.substring(0, 100).replace(/```[\s\S]*?```/g, '[Code Snippet]') + (note.content.length > 100 ? '...' : '');

  // Function to highlight search term
  const highlightText = (text: string, search: string) => {
    if (!search.trim()) return text;
    
    const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-700 text-gray-900 dark:text-gray-100 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const baseClasses = 'block p-3 sm:p-4 m-2 rounded-lg cursor-pointer transition-all duration-150';
  const activeClasses = 'bg-primary-100 dark:bg-primary-900/50 border-l-4 border-primary-600';
  const inactiveClasses = 'hover:bg-gray-100 dark:hover:bg-gray-700/50';
  const searchMatchClasses = searchTerm ? 'ring-2 ring-yellow-300 dark:ring-yellow-600' : '';

  return (
    <div
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${searchMatchClasses}`}
      onClick={onClick}
    >
      <h3 className="font-semibold truncate text-sm sm:text-base text-gray-800 dark:text-gray-100">
        {highlightText(note.title || 'Untitled Note', searchTerm)}
      </h3>
      <p className="mt-1 text-xs sm:text-sm text-gray-500 truncate dark:text-gray-400">
        {searchTerm ? highlightText(contentSnippet || 'No content', searchTerm) : (contentSnippet || 'No content')}
      </p>
    </div>
  );
};

export default NoteCard;
