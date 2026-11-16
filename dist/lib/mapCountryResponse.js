export function mapCountryResponse(rawData) {
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
//# sourceMappingURL=mapCountryResponse.js.map