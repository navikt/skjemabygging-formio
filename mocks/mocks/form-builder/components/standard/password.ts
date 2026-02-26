import baseComponent, { BaseComponentType } from '../../shared/baseComponent';

const password = (props?: BaseComponentType) => {
  const { label } = props ?? {};

  return {
    ...staticDefaultValues,
    ...baseComponent({ ...props, label: label ?? 'Passord' }),
  };
};

const staticDefaultValues = {
  type: 'password',
  input: true,
  mask: false,
  addons: [],
  errors: '',
  hidden: false,
  prefix: '',
  suffix: '',
  unique: false,
  widget: { type: 'input' },
  dbIndex: false,
  tooltip: '',
  disabled: false,
  multiple: false,
  readOnly: false,
  redrawOn: '',
  tabindex: '',
  autofocus: false,
  encrypted: false,
  fieldSize: 'input--xxl',
  hideLabel: false,
  inputType: 'password',
  modalEdit: false,
  protected: true,
  refreshOn: '',
  tableView: false,
  attributes: {},
  errorLabel: '',
  persistent: true,
  properties: {},
  validateOn: 'blur',
  clearOnHide: true,
  customClass: '',
  placeholder: '',
  dataGridLabel: false,
  labelPosition: 'top',
  showCharCount: false,
  showWordCount: false,
  calculateServer: false,
  allowMultipleMasks: false,
  customDefaultValue: '',
  allowCalculateOverride: false,
};

export default password;
