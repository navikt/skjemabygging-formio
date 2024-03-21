import type { Component, ComponentProperties, FormPropertiesType, NavFormType } from '../form';

const keyFromLabel = (label = '') => label.toLowerCase().replace(/\s/gi, '');

const createDummyCheckbox = (label = 'NavCheckbox'): Component => ({
  label,
  key: keyFromLabel(label),
  type: 'navCheckbox',
});

const createDummyTextfield = (label = 'Tekstfelt'): Component => ({
  label,
  key: keyFromLabel(label),
  type: 'textfield',
});

const createDummyImage = (label = 'Bilde'): Component =>
  ({
    image: [
      {
        url: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEBLAEsAAD/4QBGRXhpZ...',
      },
    ],
    label,
    key: keyFromLabel(label),
    altText: 'Bilde beskrivelse',
    type: 'image',
    widthPercent: 100,
  }) as Component;

const createDummyEmail = (label = 'Email'): Component =>
  ({
    label,
    key: keyFromLabel(label),
    type: 'email',
  }) as Component;

const createDummyLandvelger = (label = 'Land'): Component =>
  ({
    label,
    key: keyFromLabel(label),
    type: 'landvelger',
  }) as Component;

type RadioPanelOption = {
  label: string;
  value: string;
};

const createDummyRadioPanel = (
  label = 'RadioPanel',
  values: RadioPanelOption[] = [
    { label: 'NO-label', value: 'no' },
    { label: 'YES-label', value: 'yes' },
  ],
): Component =>
  ({
    label,
    key: keyFromLabel(label),
    type: 'radiopanel',
    values,
  }) as Component;

const defaultAttachmentValues: RadioPanelOption[] = [
  {
    value: 'leggerVedNaa',
    label: 'Jeg legger det ved denne søknaden (anbefalt)',
  },
  {
    value: 'ettersender',
    label:
      'Jeg ettersender dokumentasjonen senere (jeg er klar over at NAV ikke kan behandle søknaden før jeg har levert dokumentasjonen)',
  },
  {
    value: 'levertTidligere',
    label: 'Jeg har levert denne dokumentasjonen tidligere',
  },
];

const defaultAttachmentProperties: ComponentProperties = {
  vedleggstittel: 'Bekreftelse fra skole',
  vedleggskode: 'S1',
};

const createDummyAttachment = (
  label = 'Vedlegg1',
  properties: ComponentProperties = defaultAttachmentProperties,
  values: RadioPanelOption[] = defaultAttachmentValues,
): Component =>
  ({
    label,
    key: keyFromLabel(label),
    type: 'radiopanel',
    values,
    properties,
  }) as Component;

const createDummyRadioPanelWithNumberValues = (
  label = 'RadioPanelWithNumberValues',
  values: RadioPanelOption[] = [
    { label: '30-label', value: '30' },
    { label: '40-label', value: '40' },
  ],
): Component =>
  ({
    label,
    key: keyFromLabel(label),
    type: 'radiopanel',
    values,
  }) as Component;

const createDummySelectboxes = (
  label = 'Selectboxes',
  values: RadioPanelOption[] = [
    { label: 'Milk', value: 'milk' },
    { label: 'Bread', value: 'bread' },
    { label: 'Juice', value: 'juice' },
  ],
): Component =>
  ({
    label,
    key: keyFromLabel(label),
    type: 'selectboxes',
    values,
  }) as Component;

const createDummyContentElement = (label = 'Content', html?: string): Component =>
  ({
    label,
    key: keyFromLabel(label),
    type: 'content',
    html,
  }) as Component;

const createDummyHTMLElement = (label = 'HTMLelement', content = '', contentForPdf = ''): Component =>
  ({
    label,
    key: keyFromLabel(label),
    type: 'htmlelement',
    contentForPdf,
    content,
  }) as Component;

const createDummyAlertstripe = (
  label = 'Alertstripe',
  content?: string,
  contentForPdf = '',
  conditional = {},
): Component =>
  ({
    label,
    key: keyFromLabel(label),
    type: 'alertstripe',
    contentForPdf,
    conditional,
    content,
  }) as Component;

const createDummyContainerElement = (label = 'Container', components?: Component[], hideLabel?: boolean): Component =>
  ({
    label,
    key: keyFromLabel(label),
    type: 'container',
    components,
    hideLabel,
  }) as Component;

const createDummyNavSkjemagruppe = (label = 'NavSkjemagruppe', components?: Component[]): Component =>
  ({
    label: `${label}-label`,
    legend: `${label}-legend`,
    key: keyFromLabel(label),
    type: 'navSkjemagruppe',
    components,
  }) as Component;

const createDummyNavDatepicker = (label = 'NavSkjemagruppe'): Component =>
  ({
    label: `${label}-label`,
    legend: `${label}-legend`,
    key: keyFromLabel(label),
    type: 'navDatepicker',
  }) as Component;

const createDummyDataGrid = (label = 'DataGrid', components?: Component[], hideLabel?: boolean): Component =>
  ({
    label,
    key: keyFromLabel(label),
    type: 'datagrid',
    rowTitle: 'datagrid-row-title',
    components,
    hideLabel,
  }) as Component;

const createDummyDayComponent = (label = 'Mnd/år'): Component => ({
  label,
  key: keyFromLabel(label),
  type: 'day',
});

const createDummySelectComponent = (
  label = 'Select',
  values = [
    { label: 'Milk', value: 'milk' },
    { label: 'Bread', value: 'bread' },
    { label: 'Juice', value: 'juice' },
  ],
) => ({
  label,
  key: keyFromLabel(label),
  type: 'select',
  data: { values },
});

const createDummyButtonComponent = (buttonText = 'Submit', label = 'Knapp') => ({
  label,
  buttonText,
  key: keyFromLabel(label),
  type: 'button',
});

const createPanelObject = (title?: string, components?: Component[], label?: string): Component =>
  ({
    title,
    label,
    key: keyFromLabel(title),
    type: 'panel',
    components,
  }) as Component;

const dummyFormProperties: FormPropertiesType = {
  skjemanummer: '',
  tema: '',
};

const createFormPropertiesObject = (partialFormProperties: Partial<FormPropertiesType> = {}) => ({
  ...dummyFormProperties,
  ...partialFormProperties,
});

const createFormObject = (
  panels: Component[] = [],
  title: string = 'Test form',
  properties: Partial<FormPropertiesType> = {},
): NavFormType =>
  ({
    components: panels,
    type: 'form',
    title,
    properties,
  }) as unknown as NavFormType;

const createDummyCurrencyField = (currency = 'NOK', label = 'Penger'): Component =>
  ({
    label,
    key: keyFromLabel(label),
    type: 'currency',
    currency,
  }) as Component;

const createDummyNumberField = (prefix = '', suffix = '', label = 'Number'): Component =>
  ({
    label,
    key: keyFromLabel(label),
    type: 'number',
    prefix,
    suffix,
  }) as Component;

const createDummyAmountWithCurrency = (label = 'AmountWithCurrency'): Component =>
  ({
    label,
    key: keyFromLabel(label),
    type: 'row',
    components: [
      {
        label: 'Velg valuta',
        key: 'valutavelger',
        type: 'valutavelger',
      },
      {
        label: 'Beløp',
        key: 'belop',
        type: 'number',
      },
    ],
    isAmountWithCurrencySelector: true,
  }) as Component;

const createDummyBankAccountField = (label = 'bankAccount'): Component =>
  ({
    label,
    key: keyFromLabel(label),
    type: 'bankAccount',
  }) as Component;

const createDummyOrgNrField = (label = 'orgNr'): Component =>
  ({
    label,
    key: keyFromLabel(label),
    type: 'orgNr',
  }) as Component;

const mockedComponentObjectForTest = {
  keyFromLabel,
  createDummyCheckbox,
  createDummyTextfield,
  createDummyEmail,
  createDummyRadioPanel,
  createDummyAttachment,
  createDummyRadioPanelWithNumberValues,
  createDummySelectboxes,
  createDummyImage,
  createDummyContentElement,
  createDummyHTMLElement,
  createDummyAlertstripe,
  createDummyContainerElement,
  createDummyNavDatepicker,
  createDummyNavSkjemagruppe,
  createDummyDataGrid,
  createPanelObject,
  createFormObject,
  createFormPropertiesObject,
  createDummyDayComponent,
  createDummySelectComponent,
  createDummyLandvelger,
  createDummyButtonComponent,
  createDummyCurrencyField,
  createDummyNumberField,
  createDummyAmountWithCurrency,
  createDummyBankAccountField,
  createDummyOrgNrField,
};
export default mockedComponentObjectForTest;
