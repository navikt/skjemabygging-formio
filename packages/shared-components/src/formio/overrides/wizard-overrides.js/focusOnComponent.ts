export type KeyOrFocusComponentId = string | { path: string; metadataId?: string };

/**
 * Overriding wizard's focusOnComponent to allow giving focus to components inside the formio component,
 * accounting for complex custom components.
 * @param wizard
 */
const focusOnComponent = (wizard) => (keyOrFocusComponentId: KeyOrFocusComponentId) => {
  console.log(`Wizard focusOnComponent param='${JSON.stringify(keyOrFocusComponentId)}'`);
  if (!keyOrFocusComponentId) {
    return;
  }
  let pageIndex = 0;
  const paramIsString = typeof keyOrFocusComponentId === 'string';
  const key = paramIsString ? keyOrFocusComponentId : keyOrFocusComponentId.path;
  const metadataId = !paramIsString ? keyOrFocusComponentId.metadataId : undefined;

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
        component.focus({ metadataId });
      }
    });
  }
  const component = wizard.getComponent(key);
  if (component) {
    component.focus({ metadataId });
  }
};

export default focusOnComponent;
