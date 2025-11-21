export function scrollToAndSetFocus(selector, _alignTarget = 'center') {
  const targetTag = document.querySelector(selector);
  console.log('targetTag', targetTag);
  console.log('Before focus', document.activeElement);
  if (!targetTag) {
    return;
  }

  targetTag.focus();

  console.log('After focus', document.activeElement);

  /*
  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  targetTag.scrollIntoView({
    behavior,
    block: alignTarget,
  });
  targetTag.focus({ preventScroll: true });
  */
}
