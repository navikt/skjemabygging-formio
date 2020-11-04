export function scrollToAndSetFocus(selector, alignTarget = "center") {
  const targetTag = document.querySelector(selector);
  if (targetTag) {
    if (typeof targetTag.scrollIntoView === "function") {
      targetTag.scrollIntoView({
        behavior: "smooth",
        block: alignTarget,
      });
    }
    targetTag.focus({ preventScroll: true });
  }
}
