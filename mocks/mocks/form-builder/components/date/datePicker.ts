import baseComponent, { BaseComponentType } from '../../shared/baseComponent';

const datePicker = (props?: BaseComponentType) => {
  const { label } = props ?? {};

  // Add override for date picker validation values.
  return {
    ...staticDefaultValues,
    ...baseComponent(props),
    label: label ?? 'Dato (dd.mm.åååå)',
  };
};

const staticDefaultValues = {
  type: 'navDatepicker',
  input: true,
  tableView: false,
  mayBeEqual: false,
  visArvelger: true,
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
  keyModified: true,
};

export default datePicker;
