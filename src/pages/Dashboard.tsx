
import React, { useState, useEffect } from 'react';
import { Note } from '../types';
import NoteCard from '../components/NoteCard';
import NoteEditor from '../components/NoteEditor';
import { PlusIcon } from '../components/icons/PlusIcon';
import { SunIcon } from '../components/icons/SunIcon';
import { MoonIcon } from '../components/icons/MoonIcon';
import { SearchIcon } from '../components/icons/SearchIcon';
import { LogoutIcon } from '../components/icons/LogoutIcon';
import { useAuth } from '../hooks/useAuth';
import { useNotes } from '../hooks/useNotes';

interface DashboardProps {
  onShareNote: (note: Note) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onShareNote, onLogout, isDarkMode, toggleDarkMode }) => {
  const { user } = useAuth();
  const { notes, loading, error, isOnline, isSyncing, createNote, updateNote: updateNoteInFirebase, deleteNote: deleteNoteFromFirebase } = useNotes(user?.uid || null);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Set first note as active when notes load
  useEffect(() => {
    if (notes.length > 0 && !activeNote) {
      setActiveNote(notes[0]);
    }
  }, [notes, activeNote]);

  const createNewNote = () => {
    const newNote = createNote();
    setActiveNote(newNote);
  };

  const updateNote = async (updatedNote: Note) => {
    await updateNoteInFirebase(updatedNote);
    setActiveNote(updatedNote);
  };

  const deleteNote = async (noteId: string) => {
    await deleteNoteFromFirebase(noteId);
    if (activeNote?.id === noteId) {
      setActiveNote(notes[0] || null);
    }
  };

  const filteredNotes = notes
    .filter(note => note.title.toLowerCase().includes(searchTerm.toLowerCase()) || note.content.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="flex h-screen text-gray-800 bg-gray-100 dark:text-gray-200 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="flex flex-col w-full md:w-1/3 lg:w-1/4 h-screen bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">Smart Note</h1>
            {/* Online/Offline Indicator */}
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {isSyncing ? 'Syncing...' : isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
             <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Toggle dark mode">
              {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
            <button onClick={onLogout} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Logout">
              <LogoutIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-4">
          <div className="relative">
            <SearchIcon className="absolute w-5 h-5 text-gray-400 top-2.5 left-3"/>
            <input 
              type="text" 
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <button 
            onClick={createNewNote} 
            disabled={loading}
            className="flex items-center justify-center w-full mt-4 px-4 py-2 text-sm font-medium text-white rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create New Note
          </button>
          
          {/* Offline Notice */}
          {!isOnline && (
            <div className="mt-4 p-3 text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg">
              📴 Working offline. Changes will sync when you're back online.
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredNotes.length > 0 ? (
            filteredNotes.map(note => (
              <NoteCard 
                key={note.id} 
                note={note} 
                isActive={activeNote?.id === note.id} 
                onClick={() => setActiveNote(note)}
              />
            ))
          ) : (
             <p className="px-4 text-sm text-center text-gray-500">
               {searchTerm ? 'No notes found.' : 'No notes yet. Create your first note!'}
             </p>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 hidden md:block">
        {activeNote ? (
          <NoteEditor 
            key={activeNote.id}
            note={activeNote}
            onSave={updateNote}
            onDelete={deleteNote}
            onShare={onShareNote}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <h2 className="text-xl font-semibold">Select a note to view</h2>
            <p>or create a new one to get started.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
