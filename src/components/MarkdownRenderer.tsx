import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownRendererProps {
  content: string;
  isDarkMode?: boolean;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, isDarkMode = false }) => {
  // Parse content and render with code blocks
  const renderContent = () => {
    const elements: React.ReactNode[] = [];
    let currentIndex = 0;

    // Regex to match code blocks: ```language\ncode\n```
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      const beforeCode = content.substring(currentIndex, match.index);
      
      // Add text before code block
      if (beforeCode) {
        elements.push(
          <div key={`text-${currentIndex}`} className="whitespace-pre-wrap">
            {beforeCode}
          </div>
        );
      }

      // Add code block with syntax highlighting
      const language = match[1] || 'text';
      const code = match[2].trim();
      
      elements.push(
        <div key={`code-${match.index}`} className="my-4 rounded-lg overflow-hidden">
          <div className="bg-gray-700 dark:bg-gray-900 px-4 py-2 text-xs text-gray-300 dark:text-gray-400 font-mono">
            {language}
          </div>
          <SyntaxHighlighter
            language={language}
            style={isDarkMode ? vscDarkPlus : vs}
            customStyle={{
              margin: 0,
              borderRadius: 0,
              fontSize: '0.875rem',
              padding: '1rem'
            }}
            showLineNumbers
          >
            {code}
          </SyntaxHighlighter>
        </div>
      );

      currentIndex = match.index + match[0].length;
    }

    // Add remaining text after last code block
    if (currentIndex < content.length) {
      const remainingText = content.substring(currentIndex);
      elements.push(
        <div key={`text-${currentIndex}`} className="whitespace-pre-wrap">
          {remainingText}
        </div>
      );
    }

    return elements.length > 0 ? elements : <div className="whitespace-pre-wrap">{content}</div>;
  };

  return <div className="prose dark:prose-invert max-w-none">{renderContent()}</div>;
};

export default MarkdownRenderer;
