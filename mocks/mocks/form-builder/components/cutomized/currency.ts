import baseComponent, { BaseComponentType } from '../../shared/baseComponent';

interface CurrencyType extends BaseComponentType {
  inputType?: 'numeric' | 'decimal';
}

const currency = (props?: CurrencyType) => {
  const { inputType, label } = props ?? {};

  return {
    ...staticDefaultValues,
    ...baseComponent({ ...props, label: label ?? 'Beløp' }),
    inputType: inputType ?? 'decimal',
  };
};

const staticDefaultValues = {
  type: 'currency',
  input: true,
  readOnly: false,
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
  currency: 'nok',
  keyModified: true,
};

export default currency;
