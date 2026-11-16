import type { CountryResponse } from '../types/countryResponse.type.js';
import type { SearchState } from '../types/searchState.type.js';
import { el } from './dom.js';
import { renderCard } from './renderCard.js';

export type RenderHandlers = {
  onRetry: () => void;
  onOpen: (country: CountryResponse) => void;
};

/** Returns the nodes for the results area for a given search state. */
export function renderState(
  state: SearchState,
  { onRetry, onOpen }: RenderHandlers,
): Node[] {
  switch (state.status) {
    case 'idle':
      return [
        el('p', {
          className: 'hint',
          text: 'Start typing a country name.',
        }),
      ];
    case 'loading':
      return [
        el('div', { className: 'loader', attrs: { role: 'status' } }, [
          el('span', {
            className: 'loader__spinner',
            attrs: { 'aria-hidden': 'true' },
          }),
          document.createTextNode(`Searching “${state.query}”…`),
        ]),
      ];
    case 'empty':
      return [
        el('p', {
          className: 'empty',
          text: `Nothing found for “${state.query}”. Try another name.`,
        }),
      ];
    case 'error': {
      const retry = el('button', {
        className: 'error__retry',
        text: 'Retry',
        attrs: { type: 'button' },
      });
      retry.addEventListener('click', onRetry);
      return [
        el('div', { className: 'error', attrs: { role: 'alert' } }, [
          el('p', { text: state.message }),
          retry,
        ]),
      ];
    }
    case 'success':
      return [
        el(
          'ul',
          { className: 'results' },
          state.countries.map((country) => renderCard(country, onOpen)),
        ),
      ];
  }
}
