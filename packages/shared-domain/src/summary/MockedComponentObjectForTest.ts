import { AttachmentSettingValues } from '../attachment';
import type { Component, ComponentProperties, FormPropertiesType, NavFormType } from '../form';
import { Form } from '../forms-api-form';
import { formioFormsApiUtils } from '../index';
import FormioUtils from '../utils/formio/FormioUtils';

const keyFromLabel = (label = '') => label.toLowerCase().replace(/\s/gi, '');
const createNavId = () => FormioUtils.getRandomComponentId();

const createDummyCheckbox = (label = 'NavCheckbox', navId: string = createNavId()): Component => ({
  label,
  key: keyFromLabel(label),
  type: 'navCheckbox',
  navId,
});

const createDummyTextfield = (label = 'Tekstfelt', navId: string = createNavId()): Component => ({
  label,
  key: keyFromLabel(label),
  type: 'textfield',
  navId,
});

const createDummyImage = (label = 'Bilde', navId: string = createNavId()): Component =>
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
    navId,
  }) as Component;

const createDummyEmail = (label = 'Email', navId: string = createNavId()): Component =>
  ({
    label,
    key: keyFromLabel(label),
    type: 'email',
    navId,
  }) as Component;

const createDummyLandvelger = (label = 'Land', navId: string = createNavId()): Component =>
  ({
    label,
    key: keyFromLabel(label),
    type: 'landvelger',
    navId,
  }) as Component;

type LabelValuePair = {
  label: string;
  value: string;
  description?: string;
};

const createDummyFlervalg = (
  label = 'Flervalg',
  values: LabelValuePair[] = [
    { label: 'Valg 1', value: 'valg1' },
    { label: 'Valg 2', value: 'valg2' },
  ],
  navId: string = createNavId(),
): Component => ({
  label,
  key: keyFromLabel(label),
  type: 'flervalg',
  values,
  navId,
});

const createDummyRadioPanel = (
  label = 'RadioPanel',
  values: LabelValuePair[] = [
    { label: 'NO-label', value: 'no' },
    { label: 'YES-label', value: 'yes' },
  ],
  navId: string = createNavId(),
): Component =>
  ({
    label,
    key: keyFromLabel(label),
    type: 'radiopanel',
    values,
    navId,
  }) as Component;

const defaultAttachmentValues: AttachmentSettingValues = {
  leggerVedNaa: { enabled: true },
  ettersender: { enabled: true },
  levertTidligere: { enabled: true },
};

const defaultAttachmentProperties: ComponentProperties = {
  vedleggstittel: 'Bekreftelse fra skole',
  vedleggskode: 'S1',
};

const createDummyAttachmentValues = (
  values: Array<{ key: keyof AttachmentSettingValues; label?: string; description?: string; showDeadline?: boolean }>,
): AttachmentSettingValues => {
  return Object.fromEntries(
    values.map(({ key, label, description, showDeadline }) => [
      key,
      {
        enabled: true,
        showDeadline,
        ...{ additionalDocumentation: label || description ? { enabled: true, label, description } : undefined },
      },
    ]),
  );
};

const createDummyAttachment = (
  label = 'Vedlegg1',
  properties: ComponentProperties = defaultAttachmentProperties,
  attachmentValues: AttachmentSettingValues = defaultAttachmentValues,
  navId: string = createNavId(),
): Component =>
  ({
    label,
    key: keyFromLabel(label),
    type: 'attachment',
    attachmentValues,
    properties,
    navId,
  }) as Component;

const createDummyRadioPanelWithNumberValues = (
  label = 'RadioPanelWithNumberValues',
  values: LabelValuePair[] = [
    { label: '30-label', value: '30' },
    { label: '40-label', value: '40' },
  ],
  navId: string = createNavId(),
): Component =>
  ({
    label,
    key: keyFromLabel(label),
    type: 'radiopanel',
    values,
    navId,
  }) as Component;

const createDummySelectboxes = (
  label = 'Selectboxes',
  values: LabelValuePair[] = [
    { label: 'Milk', value: 'milk' },
    { label: 'Bread', value: 'bread' },
    { label: 'Juice', value: 'juice' },
  ],
  navId: string = createNavId(),
): Component =>
  ({
    label,
    key: keyFromLabel(label),
    type: 'selectboxes',
    values,
    navId,
  }) as Component;

const createDummyContentElement = (label = 'Content', html?: string, navId: string = createNavId()): Component =>
  ({
    label,
    key: keyFromLabel(label),
    type: 'content',
    html,
    navId,
  }) as Component;

const createDummyHTMLElement = (
  label = 'HTMLelement',
  content = '',
  contentForPdf = '',
  navId: string = createNavId(),
): Component =>
  ({
    label,
    key: keyFromLabel(label),
    type: 'htmlelement',
    contentForPdf,
    content,
    navId,
  }) as Component;

const createDummyAlertstripe = (
  label = 'Alertstripe',
  content?: string,
  contentForPdf = '',
  conditional = {},
  navId: string = createNavId(),
): Component =>
  ({
    label,
    key: keyFromLabel(label),
    type: 'alertstripe',
    contentForPdf,
    conditional,
    content,
    navId,
  }) as Component;

const createDummyContainerElement = (
  label = 'Container',
  components?: Component[],
  hideLabel?: boolean,
  navId: string = createNavId(),
): Component =>
  ({
    label,
    key: keyFromLabel(label),
    type: 'container',
    components,
    hideLabel,
    navId,
  }) as Component;

const createDummyNavSkjemagruppe = (
  label = 'NavSkjemagruppe',
  components?: Component[],
  navId: string = createNavId(),
): Component =>
  ({
    label: `${label}-label`,
    legend: `${label}-legend`,
    key: keyFromLabel(label),
    type: 'navSkjemagruppe',
    components,
    navId,
  }) as Component;

const createDummyNavDatepicker = (label = 'NavSkjemagruppe', navId: string = createNavId()): Component =>
  ({
    label: `${label}-label`,
    legend: `${label}-legend`,
    key: keyFromLabel(label),
    type: 'navDatepicker',
    navId,
  }) as Component;

const createDummyDataGrid = (
  label = 'DataGrid',
  components?: Component[],
  hideLabel?: boolean,
  navId: string = createNavId(),
): Component =>
  ({
    label,
    key: keyFromLabel(label),
    type: 'datagrid',
    rowTitle: 'datagrid-row-title',
    components,
    hideLabel,
    navId,
  }) as Component;

const createDummyDayComponent = (label = 'Mnd/år', navId: string = createNavId()): Component => ({
  label,
  key: keyFromLabel(label),
  type: 'day',
  navId,
});

const createDummySelectComponent = (
  label = 'Select',
  values = [
    { label: 'Milk', value: 'milk' },
    { label: 'Bread', value: 'bread' },
    { label: 'Juice', value: 'juice' },
  ],
  navId: string = createNavId(),
) => ({
  label,
  key: keyFromLabel(label),
  type: 'select',
  data: { values },
  navId,
});

const createDummyButtonComponent = (buttonText = 'Submit', label = 'Knapp', navId: string = createNavId()) => ({
  label,
  buttonText,
  key: keyFromLabel(label),
  type: 'button',
  navId,
});

const createPanelObject = (
  title?: string,
  components?: Component[],
  label?: string,
  navId: string = createNavId(),
): Component =>
  ({
    title,
    label,
    key: keyFromLabel(title),
    type: 'panel',
    components,
    navId,
  }) as Component;

const dummyFormProperties: FormPropertiesType = {
  skjemanummer: '',
  tema: '',
  mellomlagringDurationDays: '28',
  submissionTypes: [],
  subsequentSubmissionTypes: [],
};

const createFormPropertiesObject = (partialFormProperties: Partial<FormPropertiesType> = {}) => ({
  ...dummyFormProperties,
  ...partialFormProperties,
});

const createFormObject = (
  panels: Component[] = [],
  title: string = 'Test form',
  properties: Partial<FormPropertiesType> = {},
  navId: string = createNavId(),
): NavFormType =>
  ({
    components: panels,
    type: 'form',
    title,
    properties,
    navId,
  }) as unknown as NavFormType;

const createFormsApiFormObject = (
  panels: Component[] = [],
  title: string = 'Test form',
  properties: Partial<FormPropertiesType> = {},
  navId?: string,
): Form => formioFormsApiUtils.mapNavFormToForm(createFormObject(panels, title, properties, navId));

const createDummyCurrencyField = (currency = 'NOK', label = 'Penger', navId: string = createNavId()): Component =>
  ({
    label,
    key: keyFromLabel(label),
    type: 'currency',
    currency,
    navId,
  }) as Component;

const createDummyNumberField = (prefix = '', suffix = '', label = 'Number', navId: string = createNavId()): Component =>
  ({
    label,
    key: keyFromLabel(label),
    type: 'number',
    prefix,
    suffix,
    navId,
  }) as Component;

const createDummyAmountWithCurrency = (label = 'AmountWithCurrency', navId: string = createNavId()): Component =>
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
    navId,
  }) as Component;

const createDummyBankAccountField = (label = 'bankAccount', navId: string = createNavId()): Component =>
  ({
    label,
    key: keyFromLabel(label),
    type: 'bankAccount',
    navId,
  }) as Component;

const createDummyOrgNrField = (label = 'orgNr', navId: string = createNavId()): Component =>
  ({
    label,
    key: keyFromLabel(label),
    type: 'orgNr',
    navId,
  }) as Component;

const mockedComponentObjectForTest = {
  keyFromLabel,
  createDummyCheckbox,
  createDummyTextfield,
  createDummyEmail,
  createDummyRadioPanel,
  createDummyAttachment,
  createDummyAttachmentValues,
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
  createFormsApiFormObject,
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
  createDummyFlervalg,
};
export default mockedComponentObjectForTest;
