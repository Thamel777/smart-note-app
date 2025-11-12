
export interface NoteVersion {
  id: string;
  title: string;
  content: string;
  timestamp: number;
  changeType?: 'created' | 'edited' | 'restored';
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt?: number;
  isShared?: boolean;
  shareId?: string;
  versions?: NoteVersion[];
}

export enum View {
  Auth,
  Dashboard,
  SharedNote
}
