function formatCurrency({ name, symbol }) {
    return symbol ? `${name} (${symbol})` : name;
}
function buildDescription(raw) {
    return `${raw.name} (${raw.nativeName}) is located in ${raw.subregion}, ${raw.region}. Its people are called ${raw.demonym}.`;
}
export function getCountryDetails(rawData) {
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
//# sourceMappingURL=getCountryDetails.js.map