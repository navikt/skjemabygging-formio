import baseComponent, { BaseComponentType } from '../../shared/baseComponent';

interface FirstNameType extends BaseComponentType {
  autocomplete?: string;
  prefill?: boolean;
}

const firstName = (props?: FirstNameType) => {
  const { autocomplete, prefill, label } = props ?? {};

  return {
    ...staticDefaultValues,
    ...baseComponent({ ...props, label: label ?? 'Fornavn' }),
    autocomplete: autocomplete ?? 'given-name',
    prefill: prefill ?? false,
  };
};

const staticDefaultValues = {
  type: 'firstName',
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
  keyModified: true,
};

export default firstName;
