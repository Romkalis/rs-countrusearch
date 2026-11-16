import { createSearchController } from './lib/searchController.js';
import type { CountryResponse } from './types/countryResponse.type.js';
import { el } from './ui/dom.js';
import { renderDetails } from './ui/renderDetails.js';
import { renderState } from './ui/renderState.js';

function bootstrap(): void {
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

  const controller = createSearchController({
    onChange: (state) =>
      output.replaceChildren(
        ...renderState(state, {
          onRetry: () => controller.retry(),
          onOpen: openDetails,
        }),
      ),
  });

  input.addEventListener('input', () => controller.setQuery(input.value));

  document.body.append(
    el('main', { className: 'app' }, [
      el('h1', { className: 'app__title', text: 'Country Search' }),
      el('label', { className: 'search' }, [input]),
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
  input.focus();
}

bootstrap();
