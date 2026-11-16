import { describe, it, expect } from 'vitest';
import { getCountryCardField } from '../lib/getCountryCardField.js';
import type { CountryResponse } from '../types/countryResponse.type.js';
import type { CardFields } from '../types/cardField.type.js';
import ukraine from './fixtures/ukraine.json';
import antarctica from './fixtures/antarctica.json';

const ukraineData: CountryResponse = ukraine;
const antarcticaData: CountryResponse = antarctica;

describe('getCountryCardField', () => {
  it('maps a raw API country to card fields', () => {
    const expected: CardFields = {
      name: 'Ukraine',
      code: 'UKR',
      capital: 'Kyiv',
      region: 'Europe',
      population: 44134693,
      languages: ['Ukrainian'],
      flag: 'https://flagcdn.com/ua.svg',
    };

    expect(getCountryCardField(ukraineData)).toEqual(expected);
  });

  it('keeps every language name in order', () => {
    expect(getCountryCardField(antarcticaData).languages).toEqual([
      'English',
      'Russian',
    ]);
  });

  it('returns an empty languages array when the API has none', () => {
    const result = getCountryCardField({ ...ukraineData, languages: [] });

    expect(result.languages).toEqual([]);
  });

  it('returns an empty capital when the country has none', () => {
    expect(getCountryCardField(antarcticaData).capital).toBe('');
  });

  it('does not mutate the raw response', () => {
    const snapshot = structuredClone(ukraineData);

    getCountryCardField(ukraineData);

    expect(ukraineData).toEqual(snapshot);
  });
});
