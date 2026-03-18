import baseComponent, { BaseComponentType } from '../../shared/baseComponent';

interface SenderType extends Omit<
  BaseComponentType,
  'validate' | 'description' | 'additionalDescriptionText' | 'additionalDescriptionLabel'
> {
  senderRole?: 'person' | 'organization';
  descriptions?: {
    nationalIdentityNumber?: string;
    organizationNumber?: string;
  };
}

const sender = (props?: SenderType) => {
  const { label, senderRole, descriptions } = props ?? {};

  return {
    ...staticDefaultValues,
    ...baseComponent({
      ...props,
      label: label ?? 'Avsender',
      key: props?.key ?? 'avsender',
    }),
    role: senderRole ?? 'person',
    descriptions: descriptions ?? {},
    labels:
      senderRole === 'organization'
        ? {
            organizationNumber: 'Organisasjonsnummeret til den virksomheten / underenheten du representerer',
            organizationName: 'Virksomhetens navn',
          }
        : {
            nationalIdentityNumber: 'Representantens fødselsnummer eller d-nummer',
            firstName: 'Representantens fornavn',
            surname: 'Representantens etternavn',
          },
  };
};

const staticDefaultValues = {
  input: true,
  tableView: false,
  validate: {
    required: true,
    custom: '',
    customPrivate: false,
    strictDateValidation: false,
    multiple: false,
    unique: false,
  },
  type: 'sender',
  senderRole: 'person',
  navId: 'esrkxdj',
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
  description: '',
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
  conditional: {
    show: null,
    when: null,
    eq: '',
  },
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
  spellcheck: false,
  id: 'ef6gur8',
  keyModified: true,
};

export default sender;
