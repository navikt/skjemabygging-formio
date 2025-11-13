import baseComponent, { BaseComponentType } from '../../shared/baseComponent';

interface TextFieldType extends BaseComponentType {
  autocomplete?: string;
  spellcheck?: boolean;
  calculateValue?: string;
}

const textField = (props: TextFieldType) => {
  const { spellcheck, calculateValue } = props ?? {};

  return {
    ...staticDefaultValues,
    ...baseComponent(props),
    spellcheck: spellcheck ?? false,
    calculateValue: calculateValue ?? '',
  };
};

const staticDefaultValues = {
  type: 'textfield',
  input: true,
  mask: false,
  addons: [],
  errors: '',
  hidden: false,
  prefix: '',
  suffix: '',
  unique: false,
  widget: {
    type: 'input',
  },
  dbIndex: false,
  overlay: {
    top: '',
    left: '',
    style: '',
    width: '',
    height: '',
  },
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
  inputType: 'text',
  modalEdit: false,
  protected: false,
  refreshOn: '',
  tableView: true,
  attributes: {},
  errorLabel: '',
  persistent: true,
  properties: {},
  validateOn: 'blur',
  clearOnHide: true,
  customClass: '',
  inputFormat: 'plain',
  placeholder: '',
  dataGridLabel: false,
  labelPosition: 'top',
  showCharCount: false,
  showWordCount: false,
  calculateServer: false,
  allowMultipleMasks: false,
  customDefaultValue: '',
  allowCalculateOverride: false,
  truncateMultipleSpaces: false,
};

export default textField;
