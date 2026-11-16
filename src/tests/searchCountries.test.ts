import { afterEach, describe, expect, it, vi } from 'vitest';
import { API_URL, searchCountries } from '../api/searchCountries.js';
import { HttpError } from '../lib/httpError.js';
import { abortableResponse, jsonResponse } from './helpers/mockFetch.js';
import ukraine from './fixtures/ukraine.json';

function stubFetch(
  impl: (url: string, init?: RequestInit) => Promise<Response>,
) {
  const fetchMock = vi.fn(impl);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('searchCountries', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('requests the name endpoint with an encoded query and a signal', async () => {
    const fetchMock = stubFetch((_url, init) =>
      abortableResponse(init, jsonResponse([ukraine])),
    );

    await searchCountries('côte d', new AbortController().signal);

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${API_URL}c%C3%B4te%20d`);
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  });

  it('returns parsed countries for a 200 response', async () => {
    stubFetch((_url, init) => abortableResponse(init, jsonResponse([ukraine])));

    const result = await searchCountries('ukr', new AbortController().signal);

    expect(result).toEqual([ukraine]);
  });

  it('treats 404 as an empty result, not an error', async () => {
    stubFetch((_url, init) =>
      abortableResponse(init, jsonResponse({ message: 'Not Found' }, 404)),
    );

    await expect(
      searchCountries('zzzz', new AbortController().signal),
    ).resolves.toEqual([]);
  });

  it('throws HttpError with the status for other non-OK responses', async () => {
    stubFetch((_url, init) => abortableResponse(init, jsonResponse({}, 503)));

    const promise = searchCountries('ukr', new AbortController().signal);

    await expect(promise).rejects.toBeInstanceOf(HttpError);
    await expect(promise).rejects.toMatchObject({ status: 503 });
  });

  it('rejects with AbortError when the caller aborts', async () => {
    stubFetch((_url, init) => abortableResponse(init, null));
    const controller = new AbortController();

    const promise = searchCountries('ukr', controller.signal);
    controller.abort();

    await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('rejects with TimeoutError when the request takes too long', async () => {
    stubFetch((_url, init) => abortableResponse(init, null));

    const promise = searchCountries('ukr', new AbortController().signal, {
      timeoutMs: 20,
    });

    await expect(promise).rejects.toMatchObject({ name: 'TimeoutError' });
  });

  it('propagates network failures', async () => {
    stubFetch(() => Promise.reject(new TypeError('Failed to fetch')));

    await expect(
      searchCountries('ukr', new AbortController().signal),
    ).rejects.toBeInstanceOf(TypeError);
  });
});
