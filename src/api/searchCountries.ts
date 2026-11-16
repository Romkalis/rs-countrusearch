import type { CountryResponse } from '../types/countryResponse.type.js';

export const API_URL = 'https://countries.dev/name/';

export type SearchOptions = { timeoutMs?: number };

export async function searchCountries(
  query: string,
  signal: AbortSignal,
  options: SearchOptions = {},
): Promise<CountryResponse[]> {
  void query;
  void signal;
  void options;
  return [];
}
