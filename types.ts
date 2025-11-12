
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
}

export enum View {
  Auth,
  Dashboard,
  SharedNote
}
