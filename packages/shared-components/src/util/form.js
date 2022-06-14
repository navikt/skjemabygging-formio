export const getPanels = (components) => components.filter((component) => component.type === "panel");

export function getPanelSlug(form, pageIndex) {
  const panels = form?.components.filter((component) => component.type === "panel") || [];
  const panelAtPageIndex = panels[pageIndex];
  return panelAtPageIndex?.key;
}
