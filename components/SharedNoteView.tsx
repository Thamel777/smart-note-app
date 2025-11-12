
import React from 'react';
import { Note } from '../types';

interface SharedNoteViewProps {
  note: Note;
  onExit?: () => void;
  isUserLoggedIn: boolean;
}

const CodeBlock: React.FC<{ code: string }> = ({ code }) => {
  return (
    <pre className="p-4 my-4 overflow-x-auto text-sm bg-gray-900 rounded-md dark:bg-gray-800">
      <code className="font-mono text-gray-100">{code.trim()}</code>
    </pre>
  );
};


const SharedNoteView: React.FC<SharedNoteViewProps> = ({ note, onExit, isUserLoggedIn }) => {
  const renderContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const language = part.match(/```(\w*)/)?.[1] || '';
        const code = part.slice(3 + language.length, -3);
        return <CodeBlock key={index} code={code} />;
      }
      return (
        <p key={index} className="leading-relaxed whitespace-pre-wrap">
          {part}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {isUserLoggedIn && onExit && (
          <header className="flex items-center justify-between p-4 bg-white shadow-sm dark:bg-gray-800">
            <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">Smart Note</h1>
            <button onClick={onExit} className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-primary-600 hover:bg-primary-700">
                Back to Dashboard
            </button>
          </header>
        )}
        <main className="max-w-4xl px-4 py-12 mx-auto sm:px-6 lg:px-8">
            <article className="p-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
                <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">{note.title}</h1>
                <div className="text-gray-500 dark:text-gray-400">
                    Published on {new Date(note.createdAt).toLocaleDateString()}
                </div>
                <hr className="my-8 border-gray-200 dark:border-gray-700" />
                <div className="prose prose-lg max-w-none dark:prose-invert text-gray-800 dark:text-gray-200">
                    {renderContent(note.content)}
                </div>
            </article>
        </main>
    </div>
  );
};

export default SharedNoteView;
