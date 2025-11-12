# Smart Note App - Source Structure

This document describes the organization of the `src/` folder.

## 📁 Folder Structure

```
src/
├── components/          # Reusable UI components
│   ├── icons/          # SVG icon components
│   │   ├── LogoutIcon.tsx
│   │   ├── MoonIcon.tsx
│   │   ├── PlusIcon.tsx
│   │   ├── SearchIcon.tsx
│   │   ├── ShareIcon.tsx
│   │   ├── SunIcon.tsx
│   │   └── TrashIcon.tsx
│   ├── NoteCard.tsx    # Individual note card display
│   └── NoteEditor.tsx  # Note editing interface
│
├── pages/              # Application views/pages
│   ├── AuthScreen.tsx  # Login/authentication page
│   ├── Dashboard.tsx   # Main dashboard with notes list
│   └── SharedNoteView.tsx # Public note viewing page
│
├── hooks/              # Custom React hooks
│   └── index.ts        # Hook exports (placeholder for future hooks)
│
├── utils/              # Helper functions and utilities
│   └── index.ts        # Utility exports (placeholder for future utilities)
│
├── types/              # TypeScript type definitions
│   └── index.ts        # App-wide type definitions
│
├── App.tsx             # Root application component
├── index.tsx           # Application entry point
└── index.css           # Global styles
```

## 📝 Component Descriptions

### Components (`components/`)
Reusable UI components that can be used across different pages:
- **NoteCard**: Displays a preview of a note in the sidebar
- **NoteEditor**: Full note editing interface with title and content
- **icons/**: Collection of SVG icon components

### Pages (`pages/`)
Top-level views that represent different screens in the app:
- **AuthScreen**: Handles user authentication (login/signup)
- **Dashboard**: Main app interface with notes list and editor
- **SharedNoteView**: Public view for shared notes

### Hooks (`hooks/`)
Custom React hooks for shared logic:
- Future hooks to implement:
  - `useAuth`: Authentication state management
  - `useNetworkStatus`: Monitor online/offline status
  - `useNotesSync`: Sync notes with backend
  - `useDarkMode`: Dark mode state management
  - `useLocalStorage`: localStorage wrapper

### Utils (`utils/`)
Helper functions and utilities:
- Future utilities to implement:
  - `indexedDB.ts`: Offline storage operations
  - `firebaseSync.ts`: Firebase synchronization
  - `formatDate.ts`: Date formatting helpers
  - `markdown.ts`: Markdown parsing utilities
  - `encryption.ts`: Data encryption helpers

### Types (`types/`)
TypeScript type definitions and interfaces:
- **Note**: Note data structure
- **View**: Application view states enum

## 🔧 Path Aliases

The project uses path aliases for cleaner imports:
- `@/` → `src/` directory

Example:
```typescript
import { Note } from '@/types';
import NoteCard from '@/components/NoteCard';
```

## 🚀 Getting Started

After restructuring, ensure all imports are updated to reflect the new paths. The main entry point is now `src/index.tsx`, which renders `src/App.tsx`.
