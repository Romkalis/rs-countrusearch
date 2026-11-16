export type Currency = {
  code: string;
  name: string;
  symbol: string;
};
export type Language = {
  iso639_1: string;
  name: string;
};
export type CountryResponse = {
  name: string;
  alpha2Code: string;
  alpha3Code: string;
  capital: string;
  region: string;
  subregion: string;
  population: number;
  area: number;
  currencies: Currency[];
  languages: Language[];
  callingCodes: string[];
  topLevelDomain: string[];
  borders: string[];
  flag: string;
};
