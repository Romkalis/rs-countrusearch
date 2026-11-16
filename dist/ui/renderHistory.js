import { el } from './dom.js';
export function renderHistory(entries, onSelect) {
    if (entries.length === 0)
        return [];
    const buttons = entries.map((query) => {
        const button = el('button', {
            className: 'history__item',
            text: query,
            attrs: { type: 'button' },
        });
        button.addEventListener('click', () => onSelect(query));
        return el('li', {}, [button]);
    });
    return [
        el('h2', { className: 'history__title', text: 'Recent searches' }),
        el('ul', { className: 'history__list' }, buttons),
    ];
}
//# sourceMappingURL=renderHistory.js.map