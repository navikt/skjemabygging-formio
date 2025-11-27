import baseComponent, { BaseComponentType } from '../../shared/baseComponent';
import validateComponent from '../../shared/validateComponent';

const accountNumber = (props?: BaseComponentType) => {
  const { label } = props ?? {};
  return {
    ...staticDefaultValues,
    ...baseComponent(props),
    ...validateComponent({
      custom: 'valid = instance.validateAccountNumber(input)',
    }),
    label: label ?? 'Kontonummer',
  };
};

const staticDefaultValues = {
  type: 'bankAccount',
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
  fieldSize: 'input--s',
  spellcheck: false,
  keyModified: true,
};

export default accountNumber;
