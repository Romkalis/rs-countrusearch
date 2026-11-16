import { describe, expect, it, vi } from 'vitest';
import { createCachedSearch } from '../lib/cachedSearch.js';
import type { SearchFn } from '../lib/searchController.js';
import type { CountryResponse } from '../types/countryResponse.type.js';
import ukraine from './fixtures/ukraine.json';

const result: CountryResponse[] = [ukraine];

function deferredSearch() {
  const calls: {
    signal: AbortSignal;
    resolve: (v: CountryResponse[]) => void;
  }[] = [];
  const search = vi.fn<SearchFn>(
    (_query, signal) =>
      new Promise((resolve, reject) => {
        calls.push({ signal, resolve });
        signal.addEventListener('abort', () => reject(signal.reason));
      }),
  );
  return { search, calls };
}

describe('createCachedSearch', () => {
  it('serves a repeated query from the cache', async () => {
    const search = vi.fn<SearchFn>(async () => result);
    const cached = createCachedSearch(search);

    await cached('ukr', new AbortController().signal);
    const second = await cached('ukr', new AbortController().signal);

    expect(search).toHaveBeenCalledOnce();
    expect(second).toEqual(result);
  });

  it('uses a case-insensitive cache key', async () => {
    const search = vi.fn<SearchFn>(async () => result);
    const cached = createCachedSearch(search);

    await cached('Ukr', new AbortController().signal);
    await cached('uKR', new AbortController().signal);

    expect(search).toHaveBeenCalledOnce();
  });

  it('shares one in-flight request between identical queries', async () => {
    const { search, calls } = deferredSearch();
    const cached = createCachedSearch(search);

    const first = cached('ukr', new AbortController().signal);
    const second = cached('ukr', new AbortController().signal);
    calls[0]!.resolve(result);

    await expect(first).resolves.toEqual(result);
    await expect(second).resolves.toEqual(result);
    expect(search).toHaveBeenCalledOnce();
  });

  it('aborting one caller does not break the shared request for others', async () => {
    const { search, calls } = deferredSearch();
    const cached = createCachedSearch(search);
    const firstController = new AbortController();

    const first = cached('ukr', firstController.signal);
    const second = cached('ukr', new AbortController().signal);
    firstController.abort();
    calls[0]!.resolve(result);

    await expect(first).rejects.toMatchObject({ name: 'AbortError' });
    await expect(second).resolves.toEqual(result);
    expect(calls[0]!.signal.aborted).toBe(false);
  });

  it('really aborts the request when every caller has aborted', async () => {
    const { search, calls } = deferredSearch();
    const cached = createCachedSearch(search);
    const a = new AbortController();
    const b = new AbortController();

    const first = cached('ukr', a.signal);
    const second = cached('ukr', b.signal);
    a.abort();
    b.abort();

    await expect(first).rejects.toMatchObject({ name: 'AbortError' });
    await expect(second).rejects.toMatchObject({ name: 'AbortError' });
    expect(calls[0]!.signal.aborted).toBe(true);
  });

  it('starts a new request after an aborted one instead of reusing it', async () => {
    const { search, calls } = deferredSearch();
    const cached = createCachedSearch(search);
    const controller = new AbortController();

    const aborted = cached('ukr', controller.signal);
    controller.abort();
    await expect(aborted).rejects.toMatchObject({ name: 'AbortError' });

    const next = cached('ukr', new AbortController().signal);
    calls[1]!.resolve(result);

    await expect(next).resolves.toEqual(result);
    expect(search).toHaveBeenCalledTimes(2);
  });

  it('rejects immediately for an already aborted signal', async () => {
    const search = vi.fn<SearchFn>(async () => result);
    const cached = createCachedSearch(search);
    const controller = new AbortController();
    controller.abort();

    await expect(cached('ukr', controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    });
    expect(search).not.toHaveBeenCalled();
  });

  it('does not cache errors', async () => {
    const search = vi
      .fn<SearchFn>()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(result);
    const cached = createCachedSearch(search);

    await expect(
      cached('ukr', new AbortController().signal),
    ).rejects.toBeInstanceOf(TypeError);
    await expect(cached('ukr', new AbortController().signal)).resolves.toEqual(
      result,
    );
    expect(search).toHaveBeenCalledTimes(2);
  });
});
