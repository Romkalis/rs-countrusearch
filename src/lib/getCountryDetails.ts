import type {
  CountryResponse,
  Currency,
} from '../types/countryResponse.type.js';
import type { CountryDetails } from '../types/countryDetails.type.js';

function formatCurrency({ name, symbol }: Currency): string {
  return symbol ? `${name} (${symbol})` : name;
}

function buildDescription(raw: CountryResponse): string {
  return `${raw.name} (${raw.nativeName}) is located in ${raw.subregion}, ${raw.region}. Its people are called ${raw.demonym}.`;
}

/** Pure mapper: raw API country -> fields shown in the detail view. */
export function getCountryDetails(rawData: CountryResponse): CountryDetails {
  return {
    name: rawData.name,
    flag: rawData.flags.svg,
    description: buildDescription(rawData),
    area: rawData.area ?? null,
    borders: rawData.borders ?? [],
    languages: rawData.languages.map((lang) => lang.name),
    currencies: (rawData.currencies ?? []).map(formatCurrency),
  };
}
