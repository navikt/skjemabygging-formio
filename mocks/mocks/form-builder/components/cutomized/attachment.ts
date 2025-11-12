import baseComponent, { BaseComponentType } from '../../shared/baseComponent';

export interface AttachmentType extends BaseComponentType {
  attachmentType?: 'attachment' | 'other';
}

const attachment = (props: AttachmentType) => {
  const { label, description, attachmentType } = props ?? {};

  // Add possibility to override attachmentValues
  return {
    ...staticDefaultValues,
    ...baseComponent(props),
    ...baseComponent(props),
    label: (label ?? attachmentType === 'other') ? 'Annen dokumentasjon' : 'Vedlegg',
    description:
      (description ?? attachmentType === 'other')
        ? '<p>Har du noen annen dokumentasjon du ønsker å legge ved?</p>'
        : '',
    attachmentType: attachmentType ?? 'attachment',
    attachmentValues: attachmentType === 'other' ? defaultOtherAttachmentValues : defaultAttachmentValues,
  };
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
    additionalDocumentation: {
      label: 'Mer info',
      enabled: true,
      description: 'Vennligst gi oss mer info',
    },
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
  defaultValue: null,
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
  properties: {},
  allowMultipleMasks: false,
  addons: [],
  fieldSize: 'input--xxl',
  dataSrc: 'values',
  keyModified: true,
};

export default attachment;
