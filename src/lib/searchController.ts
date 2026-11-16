import type { CountryResponse } from '../types/countryResponse.type.js';
import type { SearchState } from '../types/searchState.type.js';

export type SearchFn = (
  query: string,
  signal: AbortSignal,
) => Promise<CountryResponse[]>;

export type SearchControllerOptions = {
  onChange: (state: SearchState) => void;
  search?: SearchFn;
  delay?: number;
};

export type SearchController = {
  setQuery: (rawQuery: string) => void;
  retry: () => void;
  getState: () => SearchState;
};

export function createSearchController(
  options: SearchControllerOptions,
): SearchController {
  void options;
  return {
    setQuery: () => {},
    retry: () => {},
    getState: () => ({ status: 'idle' }),
  };
}
