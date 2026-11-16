type Props = {
  className?: string;
  text?: string;
  attrs?: Record<string, string>;
};

/** Small createElement helper: no innerHTML, text is always escaped. */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  { className, text, attrs = {} }: Props = {},
  children: Node[] = [],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  for (const [name, value] of Object.entries(attrs)) {
    node.setAttribute(name, value);
  }
  node.append(...children);
  return node;
}

export const formatNumber = (value: number): string =>
  new Intl.NumberFormat('en-US').format(value);

export const orDash = (value: string): string => value || '—';
