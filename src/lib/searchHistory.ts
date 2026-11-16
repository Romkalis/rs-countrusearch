export type HistoryStorage = Pick<Storage, 'getItem' | 'setItem'>;

export type SearchHistory = {
  getAll: () => string[];
  add: (query: string) => string[];
};

function readEntries(storage: HistoryStorage, key: string): string[] {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(key) ?? '[]');
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
}

export function createSearchHistory(
  storage: HistoryStorage,
  key = 'country-search-history',
  limit = 10,
): SearchHistory {
  let entries = readEntries(storage, key);

  return {
    getAll: () => [...entries],
    add(rawQuery) {
      const query = rawQuery.trim();
      if (query === '') return [...entries];

      entries = [
        query,
        ...entries.filter((item) => item.toLowerCase() !== query.toLowerCase()),
      ].slice(0, limit);

      try {
        storage.setItem(key, JSON.stringify(entries));
      } catch {
        return [...entries];
      }
      return [...entries];
    },
  };
}
