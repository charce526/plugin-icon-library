export type Preferences = { favorites: string[]; recent: string[] };
const keyOf = (scope: string) => `xz-icon-library:v1:${scope}`;
export function readPreferences(scope: string): Preferences {
  try {
    const data = JSON.parse(localStorage.getItem(keyOf(scope)) || '{}');
    const list = (value: unknown) => Array.isArray(value) ? [...new Set(value.filter((v) => typeof v === 'string'))].slice(0, 100) as string[] : [];
    return { favorites: list(data.favorites), recent: list(data.recent).slice(0, 30) };
  } catch { return { favorites: [], recent: [] }; }
}
export function writePreferences(scope: string, data: Preferences) {
  try { localStorage.setItem(keyOf(scope), JSON.stringify(data)); } catch { /* storage may be unavailable */ }
  window.dispatchEvent(new Event('xz-icon-library:preferences'));
}
