export type HistoryStorage = Pick<Storage, 'getItem' | 'setItem'>;

export type SearchHistory = {
  getAll: () => string[];
  add: (query: string) => string[];
};

export function createSearchHistory(
  storage: HistoryStorage,
  key = 'country-search-history',
  limit = 10,
): SearchHistory {
  void storage;
  void key;
  void limit;
  return { getAll: () => [], add: () => [] };
}
