// A failed write/remove overrides any old on-disk value until persistence works.
// Cached reads also remain usable if storage becomes unavailable mid-session.
const known = new Map<string, string | null>();
const overrides = new Set<string>();
export function storageGet(key: string): string | null {
  if (overrides.has(key)) return known.get(key) ?? null;
  try {
    const value = localStorage.getItem(key);
    known.set(key, value);
    return value;
  } catch {
    return known.get(key) ?? null;
  }
}
export function storageSet(key: string, value: string) {
  known.set(key, value);
  try {
    localStorage.setItem(key, value);
    overrides.delete(key);
  } catch {
    overrides.add(key);
  }
}
export function storageRemove(key: string) {
  known.set(key, null);
  try {
    localStorage.removeItem(key);
    overrides.delete(key);
  } catch {
    overrides.add(key);
  }
}
export function storedArray<T>(
  key: string,
  valid: (value: unknown) => value is T,
): T[] {
  try {
    const value: unknown = JSON.parse(storageGet(key) || "[]");
    return Array.isArray(value) ? value.filter(valid) : [];
  } catch {
    return [];
  }
}
