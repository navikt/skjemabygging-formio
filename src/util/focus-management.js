export function scrollToAndSetFocus(selector, alignTarget = "center") {
  const targetTag = document.querySelector(selector);
  if (!targetTag) {
    return;
  }
  targetTag.scrollIntoView({
    behavior: "smooth",
    block: alignTarget,
  });
  targetTag.focus({ preventScroll: true });
}

export function scrollToMainAndFocusOnForm(scrollToSelector, focusOnSelector, scrollToAlignTarget = "center") {
  const scrollToTag = document.querySelector(scrollToSelector);
  const focusOnTag = document.querySelector(focusOnSelector);

  if (!scrollToTag || !focusOnTag) return;

  scrollToTag.scrollIntoView({
    behavior: "smooth",
    block: scrollToAlignTarget,
  });

  focusOnTag.tabIndex = -1;
  focusOnTag.focus({ preventScroll: true });
}
