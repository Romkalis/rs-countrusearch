import { HttpError } from '../lib/httpError.js';
export const API_URL = 'https://countries.dev/name/';
export const DEFAULT_TIMEOUT_MS = 8000;
export async function searchCountries(query, signal, { timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
    const combinedSignal = AbortSignal.any([
        signal,
        AbortSignal.timeout(timeoutMs),
    ]);
    const response = await fetch(`${API_URL}${encodeURIComponent(query)}`, {
        signal: combinedSignal,
    });
    if (response.status === 404)
        return [];
    if (!response.ok)
        throw new HttpError(response.status);
    return (await response.json());
}
//# sourceMappingURL=searchCountries.js.map