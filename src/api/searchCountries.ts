import { HttpError } from '../lib/httpError.js';
import type { CountryResponse } from '../types/countryResponse.type.js';

export const API_URL = 'https://countries.dev/name/';
export const DEFAULT_TIMEOUT_MS = 8000;

export type SearchOptions = { timeoutMs?: number };

/**
 * Fetches countries whose name matches `query`.
 *
 * - 404 means "no matches" and resolves to `[]`.
 * - Other non-OK statuses throw `HttpError`.
 * - The caller's `signal` (AbortError) and an internal timeout (TimeoutError)
 *   are combined, so both really cancel the HTTP request.
 */
export async function searchCountries(
  query: string,
  signal: AbortSignal,
  { timeoutMs = DEFAULT_TIMEOUT_MS }: SearchOptions = {},
): Promise<CountryResponse[]> {
  const combinedSignal = AbortSignal.any([
    signal,
    AbortSignal.timeout(timeoutMs),
  ]);

  const response = await fetch(`${API_URL}${encodeURIComponent(query)}`, {
    signal: combinedSignal,
  });

  if (response.status === 404) return [];
  if (!response.ok) throw new HttpError(response.status);

  return (await response.json()) as CountryResponse[];
}
