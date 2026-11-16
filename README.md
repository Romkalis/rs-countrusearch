# Country Search

Live country search powered by the [countries.dev](https://countries.dev) API.
Results update as you type. Stale requests are really cancelled with
`AbortController`, so slow responses never overwrite newer results.

**Deploy:** https://romkalis.github.io/rs-countrusearch/

**Task:** [RS School: Country Search](https://github.com/rolling-scopes-school/tasks/blob/master/fullstack-engineering/tasks/country-search/README.md)

## Features

- Debounced search (300 ms) with a hand-written `debounce`.
- The previous request is aborted on every input change.
- A timeout through `AbortSignal.timeout`, combined with the user's signal via
  `AbortSignal.any`.
- Separate UI states for idle, loading, results, nothing found (404) and error.
- The error state has a **Retry** button that repeats the last query.
- Clicking a card opens a detail view with the description, area, borders,
  languages and currency.
- Bonus: a query cache with in-flight deduplication, where each caller has its
  own abort signal.
- Bonus: search history in `localStorage`. Clicking an entry repeats the
  search, served from the cache when possible.

## Tech stack

TypeScript compiled by `tsc` to native ES modules (no bundler), Vitest, ESLint,
Prettier, Husky and lint-staged.

## Getting started

```bash
npm install
npm run build
npx serve .
```

Then open the URL that `serve` prints.

## Scripts

| Script              | Description                                 |
| ------------------- | ------------------------------------------- |
| `npm run build`     | Compile `src` to `dist` with `tsc`          |
| `npm test`          | Run unit tests with Vitest                  |
| `npm run typecheck` | Type-check sources and tests without output |
| `npm run lint`      | Run ESLint                                  |
| `npm run format`    | Format the code with Prettier               |

Git hooks:

- **pre-commit** runs `lint-staged` (ESLint and Prettier on staged files).
- **pre-push** runs `npm test`.

## Project structure

```
src/
  api/searchCountries.ts      fetch wrapper: 404 → [], HttpError, abort/timeout
  lib/
    debounce                  (utils/debounce.ts)
    mapCountryResponse.ts     raw API country → card fields
    getCountryDetails.ts      raw API country → detail view fields
    httpError.ts              Error subclass with an HTTP status
    classifyError.ts          AbortError (silent) / TimeoutError / HttpError / network
    searchController.ts       DOM-free state machine: debounce + cancellation
    cachedSearch.ts           cache + in-flight deduplication
    searchHistory.ts          search history over a Storage-like object
  ui/                         DOM rendering (createElement only, no innerHTML)
  main.ts                     wiring
  tests/                      Vitest specs and JSON fixtures
```

## Deployment

The site is served by GitHub Pages from the `gh-pages` branch. That branch
holds only the static build: `index.html`, `styles.css` and `dist/`.

```bash
npm run build
git worktree add ../gh-pages gh-pages
rm -rf ../gh-pages/dist && cp -r index.html styles.css dist ../gh-pages/
cd ../gh-pages && git add -A && git commit -m "chore: deploy" && git push origin gh-pages
cd - && git worktree remove ../gh-pages
```

In the repository settings, set **Pages → Source: Deploy from a branch →
`gh-pages` / root**.

## Design notes

See [DESIGN.md](DESIGN.md) for how stale-request cancellation works, why the
debounce delay is 300 ms, complexity analysis and the clean-code principles
used.
