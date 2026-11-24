export const shortcutInputPattern = String.raw`\\?[^\s\/\\]+`;

export function formatShortcut(shortcut: string): string {
  return shortcut.replace(/^\//, "\\");
}

export function stripShortcutPrefix(shortcut: string): string {
  return shortcut.replace(/^[\\/]+/, "");
}

export function toApiShortcut(shortcut: string): string {
  return `/${stripShortcutPrefix(shortcut.trim())}`;
}
