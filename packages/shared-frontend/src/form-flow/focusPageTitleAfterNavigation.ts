const PAGE_TITLE_ID = 'page-title';
const EDITABLE_FIELD_SELECTOR = 'input, select, textarea';

/**
 * The page title is focused after step navigation, but the new step may render in several passes,
 * which can replace the heading element and drop the focus. Reapply focus for a few frames, without
 * stealing focus from a field the user is editing or from another element that got focus meanwhile.
 */
const focusPageTitleAfterNavigation = () => {
  let animationFrame: number | undefined;
  const focusPageTitle = (remainingAttempts = 10, isFirstAttempt = true) => {
    const pageTitle = document.getElementById(PAGE_TITLE_ID);
    const activeElement = document.activeElement;

    if (activeElement?.matches(EDITABLE_FIELD_SELECTOR)) {
      return;
    }

    const canTakeFocus = isFirstAttempt || !activeElement || activeElement === document.body;
    if (canTakeFocus) {
      pageTitle?.focus();
    } else if (activeElement !== pageTitle) {
      return;
    }

    if (remainingAttempts > 1) {
      animationFrame = requestAnimationFrame(() => focusPageTitle(remainingAttempts - 1, false));
    }
  };

  focusPageTitle();
  return () => {
    if (animationFrame !== undefined) {
      cancelAnimationFrame(animationFrame);
    }
  };
};

export { focusPageTitleAfterNavigation };
