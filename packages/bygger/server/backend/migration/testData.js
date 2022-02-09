const originalPanelComponent = {
  title: "Veiledning",
  breadcrumbClickable: true,
  buttonSettings: {
    previous: true,
    cancel: true,
    next: true,
  },
  navigateOnEnter: false,
  saveOnEnter: false,
  scrollToTop: false,
  collapsible: false,
  key: "veiledning",
  type: "panel",
  label: "Veiledning",
  input: false,
  components: [],
  tableView: false,
};

const originalSkjemaGruppeComponent = {
  legend: "Skjemagruppe",
  key: "navSkjemagruppe",
  type: "navSkjemagruppe",
  label: "Skjemagruppe",
  input: false,
  tableView: false,
  components: [],
};

const originalTextFieldComponent = {
  label: "Fornavn",
  fieldSize: "input--xxl",
  autocomplete: "given-name",
  validateOn: "blur",
  validate: {
    required: true,
  },
  key: "nyttFornavn",
  type: "textfield",
  input: true,
  dataGridLabel: true,
  tableView: true,
};

const originalFodselsnummerComponent = {
  label: "Fødselsnummer / D-nummer",
  key: "fodselsnummerDNummer",
  type: "fnrfield",
  fieldSize: "input--s",
  input: true,
  spellcheck: false,
  dataGridLabel: true,
  validateOn: "blur",
  validate: {
    custom: "valid = instance.originalValidateFnr(input)",
    required: true,
  },
  tableView: true,
};

const originalForm = {
  path: "test-form",
  components: [originalFodselsnummerComponent, originalTextFieldComponent],
};

export {
  originalTextFieldComponent,
  originalSkjemaGruppeComponent,
  originalFodselsnummerComponent,
  originalPanelComponent,
  originalForm,
};
