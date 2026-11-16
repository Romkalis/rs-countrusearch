import { searchCountries } from './api/searchCountries.js';
import { createCachedSearch } from './lib/cachedSearch.js';
import { createSearchController } from './lib/searchController.js';
import { createSearchHistory } from './lib/searchHistory.js';
import type { HistoryStorage } from './lib/searchHistory.js';
import type { CountryResponse } from './types/countryResponse.type.js';
import { el } from './ui/dom.js';
import { renderDetails } from './ui/renderDetails.js';
import { renderHistory } from './ui/renderHistory.js';
import { renderState } from './ui/renderState.js';

const noopStorage: HistoryStorage = {
  getItem: () => null,
  setItem: () => {},
};

function getStorage(): HistoryStorage {
  try {
    return window.localStorage;
  } catch {
    return noopStorage;
  }
}

function bootstrap(): void {
  const history = createSearchHistory(getStorage());
  const historySection = el('section', { className: 'history' });
  const input = el('input', {
    className: 'search__input',
    attrs: {
      type: 'search',
      placeholder: 'e.g. Ukraine, Poland, Japan',
      'aria-label': 'Country name',
      autocomplete: 'off',
    },
  });
  const output = el('section', {
    className: 'output',
    attrs: { 'aria-live': 'polite' },
  });

  const dialogContent = el('div');
  const closeButton = el('button', {
    className: 'dialog__close',
    text: 'Close',
    attrs: { type: 'button' },
  });
  const dialog = el('dialog', { className: 'dialog' }, [
    closeButton,
    dialogContent,
  ]);
  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  function openDetails(country: CountryResponse): void {
    dialogContent.replaceChildren(renderDetails(country));
    dialog.showModal();
  }

  function showHistory(entries: string[]): void {
    historySection.replaceChildren(
      ...renderHistory(entries, (query) => {
        input.value = query;
        controller.searchNow(query);
      }),
    );
  }

  const controller = createSearchController({
    search: createCachedSearch(searchCountries),
    onChange: (state) => {
      output.replaceChildren(
        ...renderState(state, {
          onRetry: () => controller.retry(),
          onOpen: openDetails,
        }),
      );
      if (state.status === 'success' || state.status === 'empty') {
        showHistory(history.add(state.query));
      }
    },
  });

  input.addEventListener('input', () => controller.setQuery(input.value));

  document.body.append(
    el('main', { className: 'app' }, [
      el('h1', { className: 'app__title', text: 'Country Search' }),
      el('label', { className: 'search' }, [input]),
      historySection,
      output,
    ]),
    dialog,
  );
  output.replaceChildren(
    ...renderState(controller.getState(), {
      onRetry: () => controller.retry(),
      onOpen: openDetails,
    }),
  );
  showHistory(history.getAll());
  input.focus();
}

bootstrap();
