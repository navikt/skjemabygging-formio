import baseComponent, { BaseComponentType } from '../../shared/baseComponent';

interface SenderType extends BaseComponentType {
  role?: 'person' | 'organization';
  labels?: {
    nationalIdentityNumber?: string;
    firstName?: string;
    surname?: string;
    organization?: string;
    organizationName?: string;
  };
  descriptions?: {
    organization?: string;
  };
}

const sender = (props?: SenderType) => {
  const { role, label, labels, descriptions } = props ?? {};

  return {
    ...staticDefaultValues,
    ...baseComponent({
      ...props,
      label: label ?? 'Mottaker',
      key: props?.key ?? 'mottaker',
    }),
    role: role ?? 'person',
    labels: labels ?? {},
    descriptions: descriptions ?? {},
  };
};

const staticDefaultValues = {
  type: 'recipient',
  input: true,
  tableView: false,
  spellcheck: false,
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
  overlay: { style: '', left: '', top: '', width: '', height: '' },
  allowCalculateOverride: false,
  encrypted: false,
  showCharCount: false,
  showWordCount: false,
  properties: {},
  allowMultipleMasks: false,
  addons: [],
  keyModified: true,
};

export default sender;
