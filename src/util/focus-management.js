export function scrollToAndSetFocus(selector) {
  const targetTag = document.querySelector(selector);
  if (targetTag) {
    targetTag.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    targetTag.focus({ preventScroll: true });
  }
}
