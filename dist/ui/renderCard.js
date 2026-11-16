import { mapCountryResponse } from '../lib/mapCountryResponse.js';
import { el, formatNumber, orDash } from './dom.js';
function row(label, value) {
    return el('p', { className: 'card__row' }, [
        el('span', { className: 'card__label', text: `${label}: ` }),
        document.createTextNode(value),
    ]);
}
export function renderCard(country, onOpen) {
    const card = mapCountryResponse(country);
    const button = el('button', { className: 'card', attrs: { type: 'button' } }, [
        el('img', {
            className: 'card__flag',
            attrs: { src: card.flag, alt: `Flag of ${card.name}`, loading: 'lazy' },
        }),
        el('div', { className: 'card__body' }, [
            el('h2', { className: 'card__title', text: card.name }),
            row('Capital', orDash(card.capital)),
            row('Region', orDash(card.region)),
            row('Population', formatNumber(card.population)),
            row('Languages', orDash(card.languages.join(', '))),
        ]),
    ]);
    button.addEventListener('click', () => onOpen(country));
    return el('li', { className: 'results__item' }, [button]);
}
//# sourceMappingURL=renderCard.js.map