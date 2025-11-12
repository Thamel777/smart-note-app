
import React, { useState, useEffect } from 'react';
import { Note, View } from './types';
import AuthScreen from './pages/AuthScreen';
import Dashboard from './pages/Dashboard';
import SharedNoteView from './pages/SharedNoteView';
import { useAuth } from './hooks/useAuth';
import { shareNote, getShareableUrl } from './utils/shareNote';

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.Auth);
  const [sharedNote, setSharedNote] = useState<Note | null>(null);
  const [shareIdFromUrl, setShareIdFromUrl] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  const { user, loading, signOut: firebaseSignOut } = useAuth();

  // Check for shared note route on mount
  useEffect(() => {
    const path = window.location.pathname;
    const shareMatch = path.match(/^\/note\/([^/]+)$/);
    
    if (shareMatch) {
      const shareId = shareMatch[1];
      setShareIdFromUrl(shareId);
      setView(View.SharedNote);
    }
  }, []);

  // Listen to authentication state changes
  useEffect(() => {
    // Don't override view if we're viewing a shared note
    if (shareIdFromUrl) return;

    if (user) {
      setView(View.Dashboard);
    } else if (!loading) {
      setView(View.Auth);
    }
  }, [user, loading, shareIdFromUrl]);

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

  const handleShareNote = async (note: Note): Promise<string> => {
    try {
      if (!user) {
        throw new Error('Must be logged in to share notes');
      }

      const shareId = await shareNote(user.uid, note);
      const shareUrl = getShareableUrl(shareId);
      
      // Update the note in local state to mark as shared
      setSharedNote({
        ...note,
        isShared: true,
        shareId: shareId
      });
      
      return shareUrl;
    } catch (error) {
      console.error('Error sharing note:', error);
      throw error;
    }
  };

  const handleExitSharedView = () => {
    setSharedNote(null);
    setShareIdFromUrl(null);
    
    // Reset URL to home
    window.history.pushState({}, '', '/');
    
    if (user) {
      setView(View.Dashboard);
    } else {
      setView(View.Auth);
    }
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
        // If viewing from URL (public access)
        if (shareIdFromUrl) {
          return (
            <SharedNoteView 
              shareId={shareIdFromUrl}
              onExit={handleExitSharedView}
              isUserLoggedIn={!!user}
              isDarkMode={isDarkMode}
            />
          );
        }
        // If viewing from dashboard (logged in user)
        return sharedNote ? (
          <SharedNoteView 
            note={sharedNote} 
            onExit={handleExitSharedView} 
            isUserLoggedIn={true}
            isDarkMode={isDarkMode}
          />
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
