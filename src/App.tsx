
import React, { useState, useEffect } from 'react';
import { Note, View } from './types';
import AuthScreen from './pages/AuthScreen';
import Dashboard from './pages/Dashboard';
import SharedNoteView from './pages/SharedNoteView';

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.Auth);
  const [sharedNote, setSharedNote] = useState<Note | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleLogin = () => {
    setView(View.Dashboard);
  };

  const handleLogout = () => {
    setView(View.Auth);
  };

  const handleShareNote = (note: Note) => {
    setSharedNote(note);
    setView(View.SharedNote);
  };

  const handleExitSharedView = () => {
    setSharedNote(null);
    setView(View.Dashboard);
  };

  const renderContent = () => {
    switch (view) {
      case View.Auth:
        return <AuthScreen onLogin={handleLogin} />;
      case View.Dashboard:
        return (
          <Dashboard
            onShareNote={handleShareNote}
            onLogout={handleLogout}
            isDarkMode={isDarkMode}
            toggleDarkMode={() => setIsDarkMode(prev => !prev)}
          />
        );
      case View.SharedNote:
        return sharedNote ? (
          <SharedNoteView note={sharedNote} onExit={handleExitSharedView} isUserLoggedIn={true} />
        ) : (
          <Dashboard
            onShareNote={handleShareNote}
            onLogout={handleLogout}
            isDarkMode={isDarkMode}
            toggleDarkMode={() => setIsDarkMode(prev => !prev)}
          />
        );
      default:
        return <AuthScreen onLogin={handleLogin} />;
    }
  };

  return <div className="min-h-screen font-sans">{renderContent()}</div>;
};

export default App;
