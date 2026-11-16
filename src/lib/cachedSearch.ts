import type { SearchFn } from './searchController.js';
import type { CountryResponse } from '../types/countryResponse.type.js';

type InFlight = {
  promise: Promise<CountryResponse[]>;
  controller: AbortController;
  subscribers: number;
};

export function createCachedSearch(search: SearchFn): SearchFn {
  const cache = new Map<string, CountryResponse[]>();
  const inFlight = new Map<string, InFlight>();

  function startRequest(key: string, query: string): InFlight {
    const controller = new AbortController();
    const entry: InFlight = {
      controller,
      subscribers: 0,
      promise: search(query, controller.signal)
        .then((countries) => {
          cache.set(key, countries);
          return countries;
        })
        .finally(() => {
          if (inFlight.get(key) === entry) inFlight.delete(key);
        }),
    };
    entry.promise.catch(() => {});
    inFlight.set(key, entry);
    return entry;
  }

  return (query, signal) => {
    if (signal.aborted) return Promise.reject(signal.reason);

    const key = query.trim().toLowerCase();
    const cached = cache.get(key);
    if (cached) return Promise.resolve(cached);

    const entry = inFlight.get(key) ?? startRequest(key, query);
    entry.subscribers += 1;

    return new Promise<CountryResponse[]>((resolve, reject) => {
      const onAbort = () => {
        entry.subscribers -= 1;
        if (entry.subscribers === 0) {
          inFlight.delete(key);
          entry.controller.abort();
        }
        reject(signal.reason);
      };
      signal.addEventListener('abort', onAbort, { once: true });

      entry.promise.then(
        (countries) => {
          signal.removeEventListener('abort', onAbort);
          resolve(countries);
        },
        (error: unknown) => {
          signal.removeEventListener('abort', onAbort);
          reject(error);
        },
      );
    });
  };
}
