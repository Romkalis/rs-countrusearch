import type { SearchFn } from './searchController.js';

export function createCachedSearch(search: SearchFn): SearchFn {
  return search;
}
