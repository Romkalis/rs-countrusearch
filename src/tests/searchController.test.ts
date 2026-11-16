import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import { createSearchController } from '../lib/searchController.js';
import type { SearchFn } from '../lib/searchController.js';
import { HttpError } from '../lib/httpError.js';
import type { SearchState } from '../types/searchState.type.js';
import type { CountryResponse } from '../types/countryResponse.type.js';
import ukraine from './fixtures/ukraine.json';

const DELAY = 300;
const country = (name: string): CountryResponse => ({ ...ukraine, name });

function setup(
  search: Mock<SearchFn> = vi.fn<SearchFn>(async () => [country('Ukraine')]),
) {
  const states: SearchState[] = [];
  const controller = createSearchController({
    search,
    delay: DELAY,
    onChange: (state) => states.push(state),
  });
  return { controller, search, states };
}

describe('createSearchController', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('does not send a request for empty or blank input', async () => {
    const { controller, search } = setup();

    controller.setQuery('');
    controller.setQuery('   ');
    await vi.advanceTimersByTimeAsync(DELAY * 2);

    expect(search).not.toHaveBeenCalled();
    expect(controller.getState()).toEqual({ status: 'idle' });
  });

  it('debounces typing into a single trimmed request', async () => {
    const { controller, search } = setup();

    controller.setQuery('u');
    controller.setQuery('uk');
    controller.setQuery(' ukr ');
    await vi.advanceTimersByTimeAsync(DELAY);

    expect(search).toHaveBeenCalledOnce();
    expect(search).toHaveBeenCalledWith('ukr', expect.any(AbortSignal));
  });

  it('shows loading while the request is in flight, then results', async () => {
    let resolve: (value: CountryResponse[]) => void = () => {};
    const search = vi.fn(
      () => new Promise<CountryResponse[]>((r) => (resolve = r)),
    );
    const { controller } = setup(search);

    controller.setQuery('ukr');
    await vi.advanceTimersByTimeAsync(DELAY);
    expect(controller.getState()).toEqual({ status: 'loading', query: 'ukr' });

    resolve([country('Ukraine')]);
    await vi.advanceTimersByTimeAsync(0);
    expect(controller.getState()).toEqual({
      status: 'success',
      query: 'ukr',
      countries: [country('Ukraine')],
    });
  });

  it('reports "empty" (not error) when nothing matches', async () => {
    const { controller } = setup(vi.fn(async () => []));

    controller.setQuery('zzzz');
    await vi.advanceTimersByTimeAsync(DELAY);

    expect(controller.getState()).toEqual({ status: 'empty', query: 'zzzz' });
  });

  it('aborts the in-flight request on every input change, before debounce fires', async () => {
    const signals: AbortSignal[] = [];
    const search = vi.fn(
      (_q: string, signal: AbortSignal) =>
        new Promise<CountryResponse[]>(() => signals.push(signal)),
    );
    const { controller } = setup(search);

    controller.setQuery('ukr');
    await vi.advanceTimersByTimeAsync(DELAY);
    controller.setQuery('ukra');

    expect(signals[0]!.aborted).toBe(true);
  });

  it('clears results and aborts when the input becomes empty', async () => {
    const signals: AbortSignal[] = [];
    const search = vi.fn(
      (_q: string, signal: AbortSignal) =>
        new Promise<CountryResponse[]>(() => signals.push(signal)),
    );
    const { controller } = setup(search);

    controller.setQuery('ukr');
    await vi.advanceTimersByTimeAsync(DELAY);
    controller.setQuery('');
    await vi.advanceTimersByTimeAsync(DELAY);

    expect(signals[0]!.aborted).toBe(true);
    expect(search).toHaveBeenCalledOnce();
    expect(controller.getState()).toEqual({ status: 'idle' });
  });

  it('stays silent when its own request is aborted', async () => {
    const search = vi.fn(
      (_q: string, signal: AbortSignal) =>
        new Promise<CountryResponse[]>((_r, reject) =>
          signal.addEventListener('abort', () => reject(signal.reason)),
        ),
    );
    const { controller, states } = setup(search);

    controller.setQuery('ukr');
    await vi.advanceTimersByTimeAsync(DELAY);
    controller.setQuery('');
    await vi.advanceTimersByTimeAsync(0);

    expect(states.some((s) => s.status === 'error')).toBe(false);
  });

  it('shows real errors with a message', async () => {
    const { controller } = setup(
      vi.fn(async () => {
        throw new HttpError(500);
      }),
    );

    controller.setQuery('ukr');
    await vi.advanceTimersByTimeAsync(DELAY);

    expect(controller.getState()).toMatchObject({
      status: 'error',
      query: 'ukr',
    });
  });

  it('retry repeats the last query immediately', async () => {
    const search = vi
      .fn<SearchFn>()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce([country('Ukraine')]);
    const { controller } = setup(search);

    controller.setQuery('ukr');
    await vi.advanceTimersByTimeAsync(DELAY);
    expect(controller.getState().status).toBe('error');

    controller.retry();
    await vi.advanceTimersByTimeAsync(0);

    expect(search).toHaveBeenCalledTimes(2);
    expect(search).toHaveBeenLastCalledWith('ukr', expect.any(AbortSignal));
    expect(controller.getState().status).toBe('success');
  });
});
