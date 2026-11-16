# Country Search — Design Notes

## 1. Cancelling stale requests

**Problem.** The user types `uk`, then `pol`. The `uk` request is slower and
arrives last. A naive implementation renders it on top of the `pol` results.

**Solution: real cancellation with `AbortController`.**
The search logic lives in
[`src/lib/searchController.ts`](src/lib/searchController.ts) and has no DOM
dependency:

1. `setQuery()` is called on **every** input event. The first thing it does is
   `abortInFlight()`, which calls `controller.abort()` on the current request.
   This happens immediately, without waiting for the debounce to fire, so a
   request that has become stale is cancelled the moment the input changes.
2. After the debounce delay, `run(query)` creates a fresh `AbortController` and
   passes its `signal` to
   [`searchCountries`](src/api/searchCountries.ts).
3. `searchCountries` combines the caller's signal with
   `AbortSignal.timeout(8000)` using `AbortSignal.any`, and passes the result to
   `fetch`. Both cancelling the request and the timeout really stop the HTTP
   request. DevTools → Network shows it as _(canceled)_.
4. An aborted `fetch` rejects with a `DOMException` named `AbortError`.
   [`classifyError`](src/lib/classifyError.ts) maps it to the `aborted` kind,
   and the controller ignores it silently. A `TimeoutError`, an `HttpError` or a
   network `TypeError` becomes a visible `error` state with a Retry button.

**Why not just a "latest request id" flag?** A flag only _hides_ the late
response. The request keeps running, so it still uses bandwidth, a connection
slot and server time, and its body is still downloaded and parsed. Abort
cancels the work itself, so the stale response cannot exist and there is
nothing to filter out. It also gives us one mechanism for both user
cancellation and timeouts. The single `signal.aborted` check after `await` is a
safety net for the edge case where the response resolved in the same tick that
the abort happened.

This is covered by
[`src/tests/raceCondition.test.ts`](src/tests/raceCondition.test.ts). A mocked
`fetch` answers `uk` in 1000 ms and `pol` in 50 ms, and rejects with
`AbortError` when its signal is aborted. The test asserts that the `uk` signal
was aborted, that the final state is `pol`, and that no `uk` success or error
state was ever emitted.

## 2. Debounce delay (300 ms)

[`debounce`](src/utils/debounce.ts) is hand-written. Every call clears the
previous timer and starts a new one, so the callback runs once, `delay` ms after
the **last** call, with the last call's arguments.

300 ms is roughly the gap between keystrokes of an average typist. While the
user is typing, no request is sent. When they pause, results appear quickly
enough to feel live.

- **No debounce (0 ms):** a request on every keystroke. `ukraine` means 7
  requests, 6 of them immediately aborted. That is wasted traffic and server
  load, the loader flickers, and the public API may rate-limit us. Correctness
  is still safe thanks to abort, but it is wasteful.
- **Large debounce (1–2 s):** few requests, but the UI feels unresponsive. The
  user stops typing and nothing happens, so they may think the app is broken.

## 3. Complexity

[`mapCountryResponse`](src/lib/mapCountryResponse.ts) and
[`getCountryDetails`](src/lib/getCountryDetails.ts): for one country, time is **O(L + C)**, where L is the
number of languages and C is the number of currencies. Each list is mapped
once, and every other field is an O(1) copy. Mapping a whole response of N
countries is **O(N · (L + C))**, which is effectively O(N) because L and C are
small constants. Extra memory is the size of the output, O(L + C) per country.
The input is never mutated, and this is covered by a test.

`debounce`: O(1) per call (clear one timer, set one timer).

## 4. Clean-code principles applied

- **Single responsibility / separation of concerns:**
  - `api/searchCountries.ts` handles HTTP only (URL, status handling,
    cancellation).
  - `lib/classifyError.ts` decides which errors are shown to the user.
  - `lib/searchController.ts` holds the state machine plus debounce and
    cancellation, with no DOM.
  - `ui/*` turns state into DOM.
  - `main.ts` only wires these pieces together.
- **Pure functions:** `mapCountryResponse`, `getCountryDetails`,
  `classifyError` and `renderState` (input → output, no hidden state) are easy
  to test with fixtures (`src/tests/fixtures/*.json`).
- **Explicit state instead of flags:** `SearchState`
  ([`types/searchState.type.ts`](src/types/searchState.type.ts)) is a
  discriminated union (`idle | loading | success | empty | error`).
  `renderState` uses an exhaustive `switch`, so impossible combinations such as
  "loading and error at the same time" cannot be represented.
- **Dependency injection:** `createSearchController({ search, delay })` accepts
  the search function. Tests pass mocks, and the app uses the real
  `searchCountries`.
- **Meaningful errors:** `HttpError` ([`lib/httpError.ts`](src/lib/httpError.ts))
  carries a `status` and a `name`. 404 is treated as data (an empty list), not as
  an error.
- **Safe DOM:** `ui/dom.ts#el` builds elements with `createElement` and
  `textContent`. `innerHTML` is never used, so API data cannot inject markup.
- **TDD:** every module has its failing tests committed before the
  implementation (see `git log`).
