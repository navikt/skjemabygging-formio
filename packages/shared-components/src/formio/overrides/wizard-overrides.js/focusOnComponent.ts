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

  const component = wizard.getComponent(key);
  if (component) {
    let topPanel = component.parent;
    while (!topPanel.parent.isWizard) {
      topPanel = topPanel.parent;
    }
    const pageIndex = wizard.pages.findIndex((page) => page.id === topPanel.id);
    if (pageIndex >= 0) {
      const page = wizard.pages[pageIndex];
      if (page && page !== wizard.currentPage) {
        return wizard.setPage(pageIndex).then(() => {
          component.focus({ elementId });
          wizard.emit('focusOnComponentPageChanged', pageMeta);
        });
      } else {
        component.focus({ elementId });
      }
    }
  }
};

export default focusOnComponent;
