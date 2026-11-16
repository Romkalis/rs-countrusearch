import { searchCountries } from '../api/searchCountries.js';
import { debounce } from '../utils/debounce.js';
import { classifyError } from './classifyError.js';
export const DEFAULT_DEBOUNCE_MS = 300;
export function createSearchController({ onChange, search = searchCountries, delay = DEFAULT_DEBOUNCE_MS, }) {
    let state = { status: 'idle' };
    let inFlight = null;
    let latestQuery = '';
    function setState(next) {
        state = next;
        onChange(state);
    }
    function abortInFlight() {
        inFlight?.abort();
        inFlight = null;
    }
    async function run(query) {
        abortInFlight();
        const controller = new AbortController();
        inFlight = controller;
        setState({ status: 'loading', query });
        try {
            const countries = await search(query, controller.signal);
            if (controller.signal.aborted)
                return;
            setState(countries.length > 0
                ? { status: 'success', query, countries }
                : { status: 'empty', query });
        }
        catch (error) {
            const { kind, message } = classifyError(error);
            if (kind === 'aborted')
                return;
            setState({ status: 'error', query, message });
        }
        finally {
            if (inFlight === controller)
                inFlight = null;
        }
    }
    const debouncedRun = debounce((query) => {
        if (query === latestQuery)
            void run(query);
    }, delay);
    return {
        setQuery(rawQuery) {
            const query = rawQuery.trim();
            if (query === latestQuery && state.status !== 'idle')
                return;
            latestQuery = query;
            abortInFlight();
            if (query === '') {
                setState({ status: 'idle' });
                return;
            }
            debouncedRun(query);
        },
        searchNow(rawQuery) {
            const query = rawQuery.trim();
            latestQuery = query;
            if (query === '') {
                abortInFlight();
                setState({ status: 'idle' });
                return;
            }
            void run(query);
        },
        retry() {
            if (latestQuery !== '')
                void run(latestQuery);
        },
        getState: () => state,
    };
}
//# sourceMappingURL=searchController.js.map