import baseComponent, { BaseComponentType } from '../../shared/baseComponent';

interface AttachmentType extends BaseComponentType {
  attachmentType?: 'default' | 'other';
  attachmentValues?: Partial<typeof defaultAttachmentValues>;
  properties?: Record<string, any>;
}

const attachment = (props: AttachmentType) => {
  const { label, description, attachmentType = 'default', properties, attachmentValues = {} } = props ?? {};

  return {
    ...staticDefaultValues,
    ...baseComponent({
      ...props,
      label: label ?? (attachmentType === 'other' ? 'Annen dokumentasjon' : 'Vedlegg'),
      description:
        description ??
        (attachmentType === 'other' ? '<p>Har du noen annen dokumentasjon du ønsker å legge ved?</p>' : ''),
    }),
    attachmentType,
    attachmentValues:
      attachmentType === 'other' ? defaultOtherAttachmentValues : { ...defaultAttachmentValues, ...attachmentValues },
    properties: attachmentType === 'other' ? defaultOtherProperties : (properties ?? createDefaultProperties()),
  };
};

const randomAttachmentCodes = ['U1', 'T1', 'M1', 'M2', 'E6', 'E7', 'U7', 'U8', 'U9', 'U10'];
const createDefaultProperties = () => {
  const vedleggskode = randomAttachmentCodes[Math.floor(Math.random() * randomAttachmentCodes.length)];
  return {
    vedleggskode,
    vedleggstittel: `Vedleggstittel for ${vedleggskode}`,
  };
};

const defaultOtherProperties = {
  vedleggskode: 'N6',
  vedleggstittel: 'Annet',
};

const defaultOtherAttachmentValues = {
  nei: {
    enabled: true,
  },
  leggerVedNaa: {
    enabled: true,
    additionalDocumentation: {},
  },
};

const defaultAttachmentValues = {
  nav: {
    enabled: false,
    additionalDocumentation: {},
  },
  andre: {
    enabled: false,
    additionalDocumentation: {},
  },
  harIkke: {
    enabled: false,
    additionalDocumentation: {},
  },
  ettersender: {
    enabled: true,
    showDeadline: true,
    additionalDocumentation: {
      enabled: false,
    },
  },
  leggerVedNaa: {
    enabled: true,
    additionalDocumentation: {},
  },
  levertTidligere: {
    enabled: true,
    additionalDocumentation: {
      enabled: false,
    },
  },
};

const staticDefaultValues = {
  type: 'attachment',
  input: true,
  tableView: false,
  placeholder: '',
  prefix: '',
  customClass: '',
  suffix: '',
  multiple: false,
  protected: false,
  unique: false,
  persistent: true,
  hidden: false,
  clearOnHide: true,
  refreshOn: '',
  redrawOn: '',
  modalEdit: false,
  dataGridLabel: false,
  labelPosition: 'top',
  errorLabel: '',
  tooltip: '',
  hideLabel: false,
  tabindex: '',
  disabled: false,
  autofocus: false,
  dbIndex: false,
  customDefaultValue: '',
  calculateValue: '',
  calculateServer: false,
  widget: null,
  attributes: {},
  validateOn: 'blur',
  overlay: {
    style: '',
    left: '',
    top: '',
    width: '',
    height: '',
  },
  allowCalculateOverride: false,
  encrypted: false,
  showCharCount: false,
  showWordCount: false,
  allowMultipleMasks: false,
  addons: [],
  fieldSize: 'input--xxl',
  dataSrc: 'values',
  keyModified: true,
};

export default attachment;
