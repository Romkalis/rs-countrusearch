import type { CountryResponse } from '../types/countryResponse.type.js';
import type { CardFields } from '../types/cardField.type.js';

/** Pure mapper: raw API country -> fields shown on a result card. */
export function getCountryCardField(rawData: CountryResponse): CardFields {
  return {
    name: rawData.name,
    code: rawData.alpha3Code,
    capital: rawData.capital ?? '',
    region: rawData.region,
    population: rawData.population,
    languages: rawData.languages.map((lang) => lang.name),
    flag: rawData.flags.svg,
  };
}
