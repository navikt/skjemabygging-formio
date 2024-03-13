export type KeyOrFocusComponentId = string | { path: string; elementId?: string };

/**
 * Overriding wizard's focusOnComponent to allow giving focus to components inside the formio component,
 * accounting for complex custom components.
 * @param wizard
 */
const focusOnComponent = (wizard) => (keyOrFocusComponentId: KeyOrFocusComponentId) => {
  if (!keyOrFocusComponentId) {
    return;
  }
  let pageIndex = 0;
  const paramIsString = typeof keyOrFocusComponentId === 'string';
  const key = paramIsString ? keyOrFocusComponentId : keyOrFocusComponentId.path;
  const elementId = !paramIsString ? keyOrFocusComponentId.elementId : undefined;

  const [page] = wizard.pages.filter((page, index) => {
    let hasComponent = false;
    page.getComponent(key, (comp) => {
      if (comp.path === key) {
        pageIndex = index;
        hasComponent = true;
      }
    });
    return hasComponent;
  });

  if (page && page !== wizard.currentPage) {
    return wizard.setPage(pageIndex).then(() => {
      wizard.checkValidity(wizard.submission.data, true, wizard.submission.data);
      wizard.showErrors();
      const component = wizard.getComponent(key);
      if (component) {
        component.focus({ elementId });
      }
    });
  }
  const component = wizard.getComponent(key);
  if (component) {
    component.focus({ elementId });
  }
};

export default focusOnComponent;
