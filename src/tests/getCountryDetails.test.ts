import { describe, it, expect } from 'vitest';
import { getCountryDetails } from '../lib/getCountryDetails.js';
import type { CountryResponse } from '../types/countryResponse.type.js';
import type { CountryDetails } from '../types/countryDetails.type.js';
import ukraine from './fixtures/ukraine.json';
import antarctica from './fixtures/antarctica.json';

const ukraineData: CountryResponse = ukraine;
const antarcticaData: CountryResponse = antarctica;

describe('getCountryDetails', () => {
  it('maps a raw API country to detail fields', () => {
    const expected: CountryDetails = {
      name: 'Ukraine',
      flag: 'https://flagcdn.com/ua.svg',
      description:
        'Ukraine (Україна) is located in Eastern Europe, Europe. Its people are called Ukrainian.',
      area: 603700,
      borders: ['BLR', 'HUN', 'MDA', 'POL', 'ROU', 'RUS', 'SVK'],
      languages: ['Ukrainian'],
      currencies: ['Ukrainian hryvnia (₴)'],
    };

    expect(getCountryDetails(ukraineData)).toEqual(expected);
  });

  it('uses empty lists when borders and currencies are missing', () => {
    const result = getCountryDetails(antarcticaData);

    expect(result.borders).toEqual([]);
    expect(result.currencies).toEqual([]);
  });

  it('returns null area when the API has no area', () => {
    const { area: _area, ...withoutArea } = ukraineData;
    void _area;

    expect(getCountryDetails(withoutArea).area).toBeNull();
  });

  it('omits the symbol when a currency has none', () => {
    const result = getCountryDetails({
      ...ukraineData,
      currencies: [{ code: 'XXX', name: 'Test coin' }],
    });

    expect(result.currencies).toEqual(['Test coin']);
  });
});
