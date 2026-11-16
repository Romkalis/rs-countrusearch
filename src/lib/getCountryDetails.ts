import type { CountryResponse } from '../types/countryResponse.type.js';
import type { CountryDetails } from '../types/countryDetails.type.js';

export function getCountryDetails(rawData: CountryResponse): CountryDetails {
  void rawData;
  return {
    name: '',
    flag: '',
    description: '',
    area: null,
    borders: [],
    languages: [],
    currencies: [],
  };
}
