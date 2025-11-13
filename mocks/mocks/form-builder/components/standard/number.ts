import baseComponent, { BaseComponentType } from '../../shared/baseComponent';

interface NumberType extends BaseComponentType {
  inputType?: 'numeric' | 'decimal';
}

const number = (props: NumberType) => {
  const { inputType } = props ?? {};

  return {
    ...staticDefaultValues,
    ...baseComponent(props),
    inputType: inputType ?? 'numeric',
  };
};

const staticDefaultValues = {
  type: 'number',
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
  fieldSize: 'input--xxl',
  spellcheck: false,
  keyModified: true,
};

export default number;
