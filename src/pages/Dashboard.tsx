
import React, { useState } from 'react';
import { Note } from '../types';
import NoteCard from '../components/NoteCard';
import NoteEditor from '../components/NoteEditor';
import { PlusIcon } from '../components/icons/PlusIcon';
import { SunIcon } from '../components/icons/SunIcon';
import { MoonIcon } from '../components/icons/MoonIcon';
import { SearchIcon } from '../components/icons/SearchIcon';
import { LogoutIcon } from '../components/icons/LogoutIcon';

const initialNotes: Note[] = [
  {
    id: '1',
    title: 'Welcome to Smart Note!',
    content: 'This is your first note. You can edit it, create new notes, and share them with others.\n\n```javascript\nconsole.log("Hello, World!");\n```\n\nEnjoy your journey with Smart Note!',
    createdAt: Date.now() - 100000
  },
  {
    id: '2',
    title: 'Meeting Notes - Project X',
    content: 'Attendees: Alice, Bob, Charlie.\n\n- Discussed Q3 roadmap.\n- Finalized UI/UX designs.\n- Assigned action items.',
    createdAt: Date.now() - 500000
  },
  {
    id: '3',
    title: 'My Favorite Recipe',
    content: 'Spaghetti Carbonara:\n1. Pancetta\n2. Eggs\n3. Pecorino Romano\n4. Black Pepper\n5. Spaghetti',
    createdAt: Date.now() - 1000000
  },
];

interface DashboardProps {
  onShareNote: (note: Note) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onShareNote, onLogout, isDarkMode, toggleDarkMode }) => {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [activeNote, setActiveNote] = useState<Note | null>(notes[0] || null);
  const [searchTerm, setSearchTerm] = useState('');

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      createdAt: Date.now(),
    };
    setNotes([newNote, ...notes]);
    setActiveNote(newNote);
  };

  const updateNote = (updatedNote: Note) => {
    const noteIndex = notes.findIndex(note => note.id === updatedNote.id);
    if (noteIndex > -1) {
      const newNotes = [...notes];
      newNotes[noteIndex] = updatedNote;
      setNotes(newNotes);
      setActiveNote(updatedNote);
    }
  };

  const deleteNote = (noteId: string) => {
    const newNotes = notes.filter(note => note.id !== noteId);
    setNotes(newNotes);
    if (activeNote?.id === noteId) {
      setActiveNote(newNotes[0] || null);
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
          <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">Smart Note</h1>
          <div className="flex items-center space-x-2">
             <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
              {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
            <button onClick={onLogout} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
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
          <button onClick={createNewNote} className="flex items-center justify-center w-full mt-4 px-4 py-2 text-sm font-medium text-white rounded-lg bg-primary-600 hover:bg-primary-700">
            <PlusIcon className="w-5 h-5 mr-2" />
            Create New Note
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredNotes.length > 0 ? (
            filteredNotes.map(note => (
              <NoteCard 
                key={note.id} 
                note={note} 
                isActive={activeNote?.id === note.id} 
                onClick={() => setActiveNote(note)}
              />
            ))
          ) : (
             <p className="px-4 text-sm text-center text-gray-500">No notes found.</p>
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
