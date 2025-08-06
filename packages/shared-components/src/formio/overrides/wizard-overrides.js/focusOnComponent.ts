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
  const pageMeta = {
    index: 0,
    key: undefined,
  };
  const paramIsString = typeof keyOrFocusComponentId === 'string';
  const key = paramIsString ? keyOrFocusComponentId : keyOrFocusComponentId.path;
  const elementId = !paramIsString ? keyOrFocusComponentId.elementId : undefined;

  const [page] = wizard.pages.filter((page, index) => {
    let hasComponent = false;
    page.getComponent(key, (comp) => {
      if (comp.path === key) {
        pageMeta.index = index;
        pageMeta.key = page.key;
        hasComponent = true;
      }
    });
    return hasComponent;
  });

  if (page && page !== wizard.currentPage) {
    return wizard.setPage(pageMeta.index).then(() => {
      const component = wizard.getComponent(key);
      if (component) {
        component.focus({ elementId });
        wizard.emit('focusOnComponentPageChanged', pageMeta);
      }
    });
  }
  const component = wizard.getComponent(key);
  if (component) {
    component.focus({ elementId });
  }
};

export default focusOnComponent;
