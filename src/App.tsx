
import React, { useState, useEffect } from 'react';
import { Note, View } from './types';
import AuthScreen from './pages/AuthScreen';
import Dashboard from './pages/Dashboard';
import SharedNoteView from './pages/SharedNoteView';
import { useAuth } from './hooks/useAuth';

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.Auth);
  const [sharedNote, setSharedNote] = useState<Note | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  const { user, loading, signOut: firebaseSignOut } = useAuth();

  // Listen to authentication state changes
  useEffect(() => {
    if (user) {
      setView(View.Dashboard);
    } else if (!loading) {
      setView(View.Auth);
    }
  }, [user, loading]);

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

  const handleLogout = async () => {
    try {
      await firebaseSignOut();
      setView(View.Auth);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleShareNote = (note: Note) => {
    setSharedNote(note);
    setView(View.SharedNote);
  };

  const handleExitSharedView = () => {
    setSharedNote(null);
    setView(View.Dashboard);
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

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
