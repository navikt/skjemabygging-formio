export const keyFromLabel = (label = "") => label.toLowerCase().replace(/\s/gi, "");

export const createDummyCheckbox = (label = "NavCheckbox") => ({
  label,
  key: keyFromLabel(label),
  type: "navCheckbox",
});

export const createDummyTextfield = (label = "Tekstfelt") => ({
  label,
  key: keyFromLabel(label),
  type: "textfield",
});

export const createDummyEmail = (label = "Email") => ({
  label,
  key: keyFromLabel(label),
  type: "email",
});

export const createDummyRadioPanel = (
  label = "RadioPanel",
  values = [
    { label: "NO-label", value: "no" },
    { label: "YES-label", value: "yes" },
  ]
) => ({
  label,
  key: keyFromLabel(label),
  type: "radiopanel",
  values,
});

export const createDummyContentElement = (label = "Content", html) => ({
  label,
  key: keyFromLabel(label),
  type: "content",
  html,
});

export const createDummyHTMLElement = (label = "HTMLelement", content) => ({
  label,
  key: keyFromLabel(label),
  type: "htmlelement",
  content,
});

export const createDummyContainerElement = (label = "Container", components, hideLabel) => ({
  label,
  key: keyFromLabel(label),
  type: "container",
  components,
  hideLabel,
});

export const createDummyNavSkjemagruppe = (label = "NavSkjemagruppe", components) => ({
  label: `${label}-label`,
  legend: `${label}-legend`,
  key: keyFromLabel(label),
  type: "navSkjemagruppe",
  components,
});

export const createDummyDataGrid = (label = "DataGrid", components, hideLabel) => ({
  label,
  key: keyFromLabel(label),
  type: "datagrid",
  rowTitle: "datagrid-row-title",
  components,
  hideLabel,
});

export const createPanelObject = (title, components, label) => ({
  title,
  label,
  key: keyFromLabel(title),
  type: "panel",
  components,
});

export const createFormObject = (panels = [], title) => ({
  components: panels,
  type: "form",
  title,
});
