export function el(tag, { className, text, attrs = {} } = {}, children = []) {
    const node = document.createElement(tag);
    if (className)
        node.className = className;
    if (text !== undefined)
        node.textContent = text;
    for (const [name, value] of Object.entries(attrs)) {
        node.setAttribute(name, value);
    }
    node.append(...children);
    return node;
}
export const formatNumber = (value) => new Intl.NumberFormat('en-US').format(value);
export const orDash = (value) => value || '—';
//# sourceMappingURL=dom.js.map