const focusField = (element: HTMLElement): boolean => {
  const inputSelector = 'input:not([type="hidden"]):not(:disabled), select:not(:disabled), textarea:not(:disabled)';
  const buttonSelector = 'button:not(:disabled)';
  const target = element.matches(`${inputSelector}, ${buttonSelector}`)
    ? element
    : (element.querySelector<HTMLElement>(inputSelector) ??
      element.querySelector<HTMLElement>(buttonSelector) ??
      (element.matches('[tabindex]') ? element : element.querySelector<HTMLElement>('[tabindex]')));
  if (!target) return false;
  element.scrollIntoView({ block: 'center' });
  target.focus({ preventScroll: true });
  return document.activeElement === target;
};

export { focusField };
