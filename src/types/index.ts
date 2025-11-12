
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  isShared?: boolean;
  shareId?: string;
}

export enum View {
  Auth,
  Dashboard,
  SharedNote
}
