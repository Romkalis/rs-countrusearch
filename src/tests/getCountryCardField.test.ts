import { getCountryCardField } from '../lib/getCountryCardField';
import { describe, it, expect } from 'vitest';
import type { CountryResponse } from '../types/responseType.type';
import type { CardFields } from '../types/cardField.type';

describe('get essential fields from response', () => {
  const mockData: CountryResponse = {
    name: 'United States of America',
    alpha2Code: 'US',
    alpha3Code: 'USA',
    capital: 'Washington, D.C.',
    region: 'Americas',
    subregion: 'North America',
    population: 329484123,
    area: 9372610,
    currencies: [{ code: 'USD', name: 'United States dollar', symbol: '$' }],
    languages: [{ iso639_1: 'en', name: 'English' }, { iso639_1: 'es', name: 'Spanish' }],
    callingCodes: ['1'],
    topLevelDomain: ['.us'],
    borders: ['CAN', 'MEX'],
    flag: 'https://countries.dev/flags/us.svg',
  };
  const expectedFields: CardFields = {
    name: 'United States of America',
    code: 'USA',
    capital: 'Washington, D.C.',
    region: 'Americas',
    population: 329484123,
    languages: ['English','Spanish'],
    flag: 'https://countries.dev/flags/us.svg',
  }

  it('if received object returned data correctly', () => {
    expect(getCountryCardField(mockData)).toEqual(expectedFields)
  })
  it('if received empty languages array', () => {
    expect(getCountryCardField({...mockData, languages: []})).toEqual({...expectedFields, languages: []})
  })
});
