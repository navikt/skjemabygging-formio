import { Component, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';

const originalPanelComponent = {
  title: 'Veiledning',
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
  key: 'veiledning',
  type: 'panel',
  label: 'Veiledning',
  input: false,
  components: [],
  tableView: false,
};

const originalSkjemaGruppeComponent = {
  legend: 'Skjemagruppe',
  key: 'navSkjemagruppe',
  type: 'navSkjemagruppe',
  label: 'Skjemagruppe',
  input: false,
  tableView: false,
  components: [],
};

const originalTextFieldComponent = {
  label: 'Fornavn',
  fieldSize: 'input--xxl',
  autocomplete: 'given-name',
  validateOn: 'blur',
  validate: {
    required: true,
  },
  key: 'nyttFornavn',
  type: 'textfield',
  input: true,
  dataGridLabel: true,
  tableView: true,
} as unknown as Component;

const originalFodselsnummerComponent = {
  label: 'Fødselsnummer / D-nummer',
  key: 'fodselsnummerDNummer',
  type: 'fnrfield',
  fieldSize: 'input--s',
  input: true,
  spellcheck: false,
  dataGridLabel: true,
  validateOn: 'blur',
  validate: {
    custom: 'valid = instance.originalValidateFnr(input)',
    required: true,
  },
  tableView: true,
};

const originalOtherDocumentationAttachmentComponent: Component = {
  key: 'annenDokumentasjon',
  type: 'attachment',
  input: true,
  label: 'Annen dokumentasjon',
  validate: {
    required: true,
  },
  properties: {
    vedleggskode: 'N6',
    vedleggstittel: 'Annet',
  },
  description: 'Har du noen annen dokumentasjon du ønsker å legge ved?',
  attachmentType: 'other',
  attachmentValues: {
    nei: {
      enabled: true,
    },
    leggerVedNaa: {
      enabled: true,
    },
  },
};

const originalForm: NavFormType = {
  path: 'testform',
  components: [originalFodselsnummerComponent, originalTextFieldComponent],
  properties: {
    skjemanummer: 'Test Form',
    tema: 'BIL',
    submissionTypes: ['DIGITAL'],
  },
} as NavFormType;

const radioComponent = {
  key: 'radioComponent',
  id: 'radioComponent',
  label: 'Radio',
  type: 'radio',
  values: [
    {
      value: 'ja',
      label: 'Ja',
    },
    {
      value: 'nei',
      label: 'Nei',
    },
  ],
} as unknown as Component;

const checkboxComponent = {
  key: 'checkboxComponent',
  id: 'checkboxComponent',
  type: 'checkbox',
  label: 'Checkbox',
};

const componentWithSimpleConditionalToRadio = {
  key: 'componentWithSimpleConditionalToRadio',
  id: 'componentWithSimpleConditionalToRadio',
  label: 'Component with simple conditional to radio',
  conditional: {
    show: true,
    when: 'radioComponent',
    eq: 'ja',
  },
} as unknown as Component;

const componentWithAdvancedConditionalToRadio = {
  key: 'componentWithAdvancedConditionalToRadio',
  id: 'componentWithAdvancedConditionalToRadio',
  label: 'Component with advanced conditional to radio',
  customConditional: 'show = data.radioComponent === "ja"',
  conditional: {
    show: true,
    when: 'radioComponent',
    eq: 'ja',
  },
} as unknown as Component;

const componentWithSimpleConditionalToCheckbox = {
  key: 'componentWithSimpleConditionalToCheckbox',
  id: 'componentWithSimpleConditionalToCheckbox',
  label: 'Component with simple conditional to checkbox',
  conditional: {
    show: true,
    when: 'checkboxComponent',
    eq: true,
  },
};

const generalProperties = {
  modified: '2022-11-17T13:12:38.825Z',
  modifiedBy: 'user@company.com',
  published: '2022-11-17T13:12:38.825Z',
  publishedBy: 'publisher@company.com',
  unpublished: '2022-12-24T17:00:00.825Z',
  unpublishedBy: 'user@company.com',
  isTestForm: false,
  publishedLanguages: ['en'],
};

const formWithSimpleConditionalToRadio = {
  name: 'formWithSimpleConditionalToRadio',
  path: 'formWithSimpleConditionalToRadio',
  title: 'Form with simple conditional to radio',
  changedAt: '2022-11-17T13:12:38.825Z',
  changedBy: 'user@company.com',
  publishedAt: '2022-11-17T13:12:38.825Z',
  publishedBy: 'user@company.com',
  publishedLanguages: ['en'],
  status: 'published',
  properties: {
    skjemanummer: 'formWithSimpleConditionalToRadio',
    ...generalProperties,
  },
  components: [radioComponent, componentWithSimpleConditionalToRadio],
} as NavFormType;

const formWithAdvancedConditionalToRadio = {
  name: 'formWithAdvancedConditionalToRadio',
  path: 'formWithAdvancedConditionalToRadio',
  title: 'Form with advanced conditional to radio',
  properties: {
    skjemanummer: 'formWithAdvancedConditionalToRadio',
    ...generalProperties,
  },
  components: [radioComponent, componentWithAdvancedConditionalToRadio],
} as NavFormType;

const formWithSimpleConditionalToCheckbox = {
  name: 'formWithSimpleConditionalToCheckbox',
  path: 'formWithSimpleConditionalToCheckbox',
  title: 'Form with simple conditional to checkbox',
  properties: {
    skjemanummer: 'formWithSimpleConditionalToCheckbox',
    ...generalProperties,
  },
  components: [checkboxComponent, componentWithSimpleConditionalToCheckbox],
} as NavFormType;

export {
  checkboxComponent,
  componentWithAdvancedConditionalToRadio,
  componentWithSimpleConditionalToCheckbox,
  componentWithSimpleConditionalToRadio,
  formWithAdvancedConditionalToRadio,
  formWithSimpleConditionalToCheckbox,
  formWithSimpleConditionalToRadio,
  originalFodselsnummerComponent,
  originalForm,
  originalOtherDocumentationAttachmentComponent,
  originalPanelComponent,
  originalSkjemaGruppeComponent,
  originalTextFieldComponent,
  radioComponent,
};
