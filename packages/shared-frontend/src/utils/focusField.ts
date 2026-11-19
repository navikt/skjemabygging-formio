const focusField = (element: HTMLElement, preferInputFocus = false): boolean => {
  const inputSelector = 'input:not([type="hidden"]):not(:disabled), select:not(:disabled), textarea:not(:disabled)';
  const buttonSelector = 'button:not(:disabled)';
  // Keep the host's fieldset focus contract unless it explicitly requests an input.
  const isFocusableField = element.matches('[tabindex]') || element.tabIndex >= 0;
  const target =
    element.matches(`${inputSelector}, ${buttonSelector}`) || (!preferInputFocus && isFocusableField)
      ? element
      : (element.querySelector<HTMLElement>(inputSelector) ??
        element.querySelector<HTMLElement>(buttonSelector) ??
        (isFocusableField ? element : element.querySelector<HTMLElement>('[tabindex]')));
  if (!target) return false;
  element.scrollIntoView({ block: 'center' });
  target.focus({ preventScroll: true });
  return document.activeElement === target;
};

export { focusField };
