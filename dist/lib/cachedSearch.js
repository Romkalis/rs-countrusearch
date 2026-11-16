export function createCachedSearch(search) {
    const cache = new Map();
    const inFlight = new Map();
    function startRequest(key, query) {
        const controller = new AbortController();
        const entry = {
            controller,
            subscribers: 0,
            promise: search(query, controller.signal)
                .then((countries) => {
                cache.set(key, countries);
                return countries;
            })
                .finally(() => {
                if (inFlight.get(key) === entry)
                    inFlight.delete(key);
            }),
        };
        entry.promise.catch(() => { });
        inFlight.set(key, entry);
        return entry;
    }
    return (query, signal) => {
        if (signal.aborted)
            return Promise.reject(signal.reason);
        const key = query.trim().toLowerCase();
        const cached = cache.get(key);
        if (cached)
            return Promise.resolve(cached);
        const entry = inFlight.get(key) ?? startRequest(key, query);
        entry.subscribers += 1;
        return new Promise((resolve, reject) => {
            const onAbort = () => {
                entry.subscribers -= 1;
                if (entry.subscribers === 0) {
                    inFlight.delete(key);
                    entry.controller.abort();
                }
                reject(signal.reason);
            };
            signal.addEventListener('abort', onAbort, { once: true });
            entry.promise.then((countries) => {
                signal.removeEventListener('abort', onAbort);
                resolve(countries);
            }, (error) => {
                signal.removeEventListener('abort', onAbort);
                reject(error);
            });
        });
    };
}
//# sourceMappingURL=cachedSearch.js.map