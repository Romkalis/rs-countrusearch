import type { CountryResponse } from '../types/responseType.type';
import type { CardFields } from '../types/cardField.type';

export function getCountryCardField(rawData: CountryResponse): CardFields {
  return {
    name: rawData.name,
    code: rawData.alpha3Code,
    capital: rawData.capital,
    region: rawData.region,
    population: rawData.population,
    languages: rawData.languages.map((lang) => lang.name),
    flag: rawData.flag,
  };
}
