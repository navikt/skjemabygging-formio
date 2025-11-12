import baseComponent, { BaseComponentType } from '../../shared/baseComponent';

export interface PhoneNumberType extends BaseComponentType {
  showAreaCode?: boolean;
}

const phoneNumber = (props: PhoneNumberType) => {
  const { showAreaCode } = props ?? {};

  return {
    ...staticDefaultValues,
    ...baseComponent(props),
    showAreaCode: showAreaCode ?? true,
  };
};

const staticDefaultValues = {
  type: 'phoneNumber',
  input: true,
  fieldSize: 'input--s',
  inputMask: false,
  tableView: false,
  spellcheck: false,
  autocomplete: 'tel',
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
  keyModified: true,
};

export default phoneNumber;
