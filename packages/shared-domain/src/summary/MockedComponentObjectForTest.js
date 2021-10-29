const keyFromLabel = (label = "") => label.toLowerCase().replace(/\s/gi, "");

const createDummyCheckbox = (label = "NavCheckbox") => ({
  label,
  key: keyFromLabel(label),
  type: "navCheckbox",
});

const createDummyTextfield = (label = "Tekstfelt") => ({
  label,
  key: keyFromLabel(label),
  type: "textfield",
});

const createDummyEmail = (label = "Email") => ({
  label,
  key: keyFromLabel(label),
  type: "email",
});

const createDummyRadioPanel = (
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

const createDummyRadioPanelWithNumberValues = (
  label = "RadioPanelWithNumberValues",
  values = [
    { label: "30-label", value: "30" },
    { label: "40-label", value: "40" },
  ]
) => ({
  label,
  key: keyFromLabel(label),
  type: "radiopanel",
  values,
});

const createDummySelectboxes = (
  label = "Selectboxes",
  values = [
    { label: "Milk", value: "milk" },
    { label: "Bread", value: "bread" },
    { label: "Juice", value: "juice" },
  ]
) => ({
  label,
  key: keyFromLabel(label),
  type: "selectboxes",
  values,
});

const createDummyContentElement = (label = "Content", html) => ({
  label,
  key: keyFromLabel(label),
  type: "content",
  html,
});

const createDummyHTMLElement = (label = "HTMLelement", content = "", contentForPdf = "") => ({
  label,
  key: keyFromLabel(label),
  type: "htmlelement",
  contentForPdf,
  content,
});

const createDummyAlertstripe = (label = "Alertstripe", content, contentForPdf = "", conditional = {}) => ({
  label,
  key: keyFromLabel(label),
  type: "alertstripe",
  contentForPdf,
  conditional,
  content,
});

const createDummyContainerElement = (label = "Container", components, hideLabel) => ({
  label,
  key: keyFromLabel(label),
  type: "container",
  components,
  hideLabel,
});

const createDummyNavSkjemagruppe = (label = "NavSkjemagruppe", components) => ({
  label: `${label}-label`,
  legend: `${label}-legend`,
  key: keyFromLabel(label),
  type: "navSkjemagruppe",
  components,
});

const createDummyNavDatepicker = (label = "NavSkjemagruppe") => ({
  label: `${label}-label`,
  legend: `${label}-legend`,
  key: keyFromLabel(label),
  type: "navDatepicker",
});

const createDummyDataGrid = (label = "DataGrid", components, hideLabel) => ({
  label,
  key: keyFromLabel(label),
  type: "datagrid",
  rowTitle: "datagrid-row-title",
  components,
  hideLabel,
});

const createDummyDayComponent = (label = "Mnd/år") => ({
  label,
  key: keyFromLabel(label),
  type: "day",
});

const createPanelObject = (title, components, label) => ({
  title,
  label,
  key: keyFromLabel(title),
  type: "panel",
  components,
});

const createFormObject = (panels = [], title) => ({
  components: panels,
  type: "form",
  title,
});

const mockedComponentObjectForTest = {
  keyFromLabel,
  createDummyCheckbox,
  createDummyTextfield,
  createDummyEmail,
  createDummyRadioPanel,
  createDummyRadioPanelWithNumberValues,
  createDummySelectboxes,
  createDummyContentElement,
  createDummyHTMLElement,
  createDummyAlertstripe,
  createDummyContainerElement,
  createDummyNavDatepicker,
  createDummyNavSkjemagruppe,
  createDummyDataGrid,
  createPanelObject,
  createFormObject,
  createDummyDayComponent,
};
export default mockedComponentObjectForTest;
