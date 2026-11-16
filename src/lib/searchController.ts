import { searchCountries } from '../api/searchCountries.js';
import { debounce } from '../utils/debounce.js';
import { classifyError } from './classifyError.js';
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
  searchNow: (rawQuery: string) => void;
  retry: () => void;
  getState: () => SearchState;
};

export const DEFAULT_DEBOUNCE_MS = 300;

export function createSearchController({
  onChange,
  search = searchCountries,
  delay = DEFAULT_DEBOUNCE_MS,
}: SearchControllerOptions): SearchController {
  let state: SearchState = { status: 'idle' };
  let inFlight: AbortController | null = null;
  let latestQuery = '';

  function setState(next: SearchState): void {
    state = next;
    onChange(state);
  }

  function abortInFlight(): void {
    inFlight?.abort();
    inFlight = null;
  }

  async function run(query: string): Promise<void> {
    abortInFlight();
    const controller = new AbortController();
    inFlight = controller;
    setState({ status: 'loading', query });

    try {
      const countries = await search(query, controller.signal);
      if (controller.signal.aborted) return;
      setState(
        countries.length > 0
          ? { status: 'success', query, countries }
          : { status: 'empty', query },
      );
    } catch (error) {
      const { kind, message } = classifyError(error);
      if (kind === 'aborted') return;
      setState({ status: 'error', query, message });
    } finally {
      if (inFlight === controller) inFlight = null;
    }
  }

  const debouncedRun = debounce((query: string) => {
    if (query === latestQuery) void run(query);
  }, delay);

  return {
    setQuery(rawQuery) {
      const query = rawQuery.trim();
      if (query === latestQuery && state.status !== 'idle') return;
      latestQuery = query;
      abortInFlight();

      if (query === '') {
        setState({ status: 'idle' });
        return;
      }
      debouncedRun(query);
    },
    searchNow() {},
    retry() {
      if (latestQuery !== '') void run(latestQuery);
    },
    getState: () => state,
  };
}
