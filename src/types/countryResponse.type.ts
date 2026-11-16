export type Currency = {
  code: string;
  name: string;
  symbol?: string;
};

export type Language = {
  name: string;
  iso639_1?: string;
  iso639_2?: string;
  nativeName?: string;
};

export type CountryResponse = {
  name: string;
  nativeName: string;
  alpha2Code: string;
  alpha3Code: string;
  capital?: string;
  region: string;
  subregion: string;
  demonym: string;
  population: number;
  area?: number;
  flag: string;
  flags: { png: string; svg: string };
  languages: Language[];
  currencies?: Currency[];
  borders?: string[];
};
