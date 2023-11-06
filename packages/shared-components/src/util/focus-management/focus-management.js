export function scrollToAndSetFocus(selector, alignTarget = 'center') {
  const targetTag = document.querySelector(selector);
  if (!targetTag) {
    return;
  }

  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  targetTag.scrollIntoView({
    behavior,
    block: alignTarget,
  });
  targetTag.focus({ preventScroll: true });
}
