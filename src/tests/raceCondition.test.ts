import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSearchController } from '../lib/searchController.js';
import { searchCountries } from '../api/searchCountries.js';
import type { SearchState } from '../types/searchState.type.js';
import { abortableResponse, jsonResponse } from './helpers/mockFetch.js';
import ukraine from './fixtures/ukraine.json';

const DELAY = 300;

describe('race condition: stale responses', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('shows only the latest query even if an earlier request would resolve later', async () => {
    // "uk" is slow (1000ms), "pol" is fast (50ms): without cancellation
    // the "uk" response would arrive last and overwrite "pol".
    const latency: Record<string, number> = { uk: 1000, pol: 50 };
    const signals: Record<string, AbortSignal> = {};
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      const query = decodeURIComponent(url.split('/').pop()!);
      signals[query] = init!.signal!;
      const body = [{ ...ukraine, name: `Result for ${query}` }];
      return abortableResponse(init, jsonResponse(body), latency[query]);
    });
    vi.stubGlobal('fetch', fetchMock);

    const states: SearchState[] = [];
    const controller = createSearchController({
      search: searchCountries,
      delay: DELAY,
      onChange: (state) => states.push(state),
    });

    controller.setQuery('uk');
    await vi.advanceTimersByTimeAsync(DELAY); // "uk" request in flight
    controller.setQuery('pol'); // must abort "uk" right away
    await vi.advanceTimersByTimeAsync(DELAY + 2000); // let everything settle

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(signals['uk']!.aborted).toBe(true);
    expect(controller.getState()).toMatchObject({
      status: 'success',
      query: 'pol',
      countries: [{ name: 'Result for pol' }],
    });
    expect(states.some((s) => s.status === 'success' && s.query === 'uk')).toBe(
      false,
    );
    expect(states.some((s) => s.status === 'error')).toBe(false);
  });
});
