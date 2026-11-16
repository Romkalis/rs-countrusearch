import type { CountryResponse } from './countryResponse.type.js';

export type SearchState =
  | { status: 'idle' }
  | { status: 'loading'; query: string }
  | { status: 'success'; query: string; countries: CountryResponse[] }
  | { status: 'empty'; query: string }
  | { status: 'error'; query: string; message: string };
