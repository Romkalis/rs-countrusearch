export type CountryDetails = {
  name: string;
  flag: string;
  description: string;
  /** km², null when the API does not know it */
  area: number | null;
  borders: string[];
  languages: string[];
  /** e.g. "Ukrainian hryvnia (₴)" */
  currencies: string[];
};
