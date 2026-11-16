import { getCountryDetails } from '../lib/getCountryDetails.js';
import type { CountryResponse } from '../types/countryResponse.type.js';
import { el, formatNumber, orDash } from './dom.js';

function item(term: string, value: string): Node[] {
  return [el('dt', { text: term }), el('dd', { text: value })];
}

export function renderDetails(country: CountryResponse): HTMLElement {
  const details = getCountryDetails(country);
  const area =
    details.area === null ? '—' : `${formatNumber(details.area)} km²`;

  return el('article', { className: 'details' }, [
    el('img', {
      className: 'details__flag',
      attrs: { src: details.flag, alt: `Flag of ${details.name}` },
    }),
    el('h2', { className: 'details__title', text: details.name }),
    el('p', { className: 'details__description', text: details.description }),
    el('dl', { className: 'details__list' }, [
      ...item('Area', area),
      ...item('Borders', orDash(details.borders.join(', '))),
      ...item('Languages', orDash(details.languages.join(', '))),
      ...item('Currency', orDash(details.currencies.join(', '))),
    ]),
  ]);
}
