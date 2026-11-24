import { formatShortcut } from "utils/shortcuts";
import type { Template } from "models/template";

type SearchableTemplate = Pick<Template, "title"> & { shortcut?: string | null };

export function searchTemplates<T extends SearchableTemplate>(templates: T[], query: string): T[] {
  const searchQuery = query.trim().toLowerCase();

  return templates.filter(({ title, shortcut }) =>
    title.toLowerCase().includes(searchQuery)
    || formatShortcut(shortcut ?? "").toLowerCase().startsWith(formatShortcut(searchQuery)),
  );
}
