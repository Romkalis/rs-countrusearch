function readEntries(storage, key) {
    try {
        const parsed = JSON.parse(storage.getItem(key) ?? '[]');
        return Array.isArray(parsed)
            ? parsed.filter((item) => typeof item === 'string')
            : [];
    }
    catch {
        return [];
    }
}
export function createSearchHistory(storage, key = 'country-search-history', limit = 10) {
    let entries = readEntries(storage, key);
    return {
        getAll: () => [...entries],
        add(rawQuery) {
            const query = rawQuery.trim();
            if (query === '')
                return [...entries];
            entries = [
                query,
                ...entries.filter((item) => item.toLowerCase() !== query.toLowerCase()),
            ].slice(0, limit);
            try {
                storage.setItem(key, JSON.stringify(entries));
            }
            catch {
                return [...entries];
            }
            return [...entries];
        },
    };
}
//# sourceMappingURL=searchHistory.js.map