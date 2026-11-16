import { el } from './dom.js';
import { renderCard } from './renderCard.js';
export function renderState(state, { onRetry, onOpen }) {
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
                el('ul', { className: 'results' }, state.countries.map((country) => renderCard(country, onOpen))),
            ];
    }
}
//# sourceMappingURL=renderState.js.map