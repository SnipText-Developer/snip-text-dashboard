export interface Template {
  templateId: number;
  title: string;
  shortcut: string;
  content: string;
  variables: string[];
  lastUsedAt: string | null;
  createdAt: string;
  editedAt: string;
}
