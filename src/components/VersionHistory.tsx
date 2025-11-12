import React, { useState } from 'react';
import { Note, NoteVersion } from '../types';
import { getVersionHistory, formatVersionDate, restoreVersion } from '../utils/versionHistory';

interface VersionHistoryProps {
  note: Note;
  onRestore: (note: Note) => void;
  onClose: () => void;
  isDarkMode?: boolean;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({ note, onRestore, onClose, isDarkMode = false }) => {
  const [selectedVersion, setSelectedVersion] = useState<NoteVersion | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const versions = getVersionHistory(note);

  const handleRestore = (version: NoteVersion) => {
    setSelectedVersion(version);
    setShowConfirm(true);
  };

  const confirmRestore = () => {
    if (selectedVersion) {
      try {
        const restoredNote = restoreVersion(note, selectedVersion.id);
        onRestore(restoredNote);
        setShowConfirm(false);
        onClose();
      } catch (error) {
        console.error('Failed to restore version:', error);
        alert('Failed to restore version. Please try again.');
      }
    }
  };

  const getChangeIcon = (changeType?: string) => {
    switch (changeType) {
      case 'created':
        return '✨';
      case 'restored':
        return '↩️';
      default:
        return '📝';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              Version History
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              {versions.length} version{versions.length !== 1 ? 's' : ''} saved
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Version List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {versions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No version history yet.</p>
              <p className="text-xs sm:text-sm mt-2">Versions are saved automatically when you edit the note.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((version, index) => {
                const isCurrentVersion = index === 0;
                const contentPreview = version.content.substring(0, 150);
                
                return (
                  <div
                    key={version.id}
                    className={`p-3 sm:p-4 rounded-lg border transition-all ${
                      isCurrentVersion
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{getChangeIcon(version.changeType)}</span>
                          <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                            {version.title || 'Untitled Note'}
                          </h4>
                          {isCurrentVersion && (
                            <span className="px-2 py-0.5 text-xs font-medium text-primary-700 bg-primary-100 rounded-full dark:bg-primary-900 dark:text-primary-300">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          {formatVersionDate(version.timestamp)}
                          {version.changeType && version.changeType !== 'edited' && (
                            <span className="ml-2 capitalize">• {version.changeType}</span>
                          )}
                        </p>
                      </div>
                      {!isCurrentVersion && (
                        <button
                          onClick={() => handleRestore(version)}
                          className="px-3 py-1.5 text-xs sm:text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/50 rounded-lg transition-colors"
                        >
                          Restore
                        </button>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {contentPreview || 'No content'}
                      {version.content.length > 150 && '...'}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            💡 Tip: Up to 10 recent versions are kept automatically
          </p>
        </div>
      </div>

      {/* Restore Confirmation Modal */}
      {showConfirm && selectedVersion && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Restore Version?
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              This will replace the current note with the version from{' '}
              <strong>{formatVersionDate(selectedVersion.timestamp)}</strong>.
              Your current version will be saved in history.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRestore}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Restore Version
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionHistory;
