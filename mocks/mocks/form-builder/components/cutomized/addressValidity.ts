import baseComponent, { BaseComponentType } from '../../shared/baseComponent';

const addressValidity = (props: BaseComponentType) => {
  const { customConditional } = props ?? {};
  return {
    ...staticDefaultValues,
    ...baseComponent(props),
    customConditional: customConditional ?? '',
  };
};

const staticDefaultValues = {
  input: true,
  tableView: false,
  type: 'addressValidity',
  protectedApiKey: true,
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
  hideLabel: true,
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
  keyModified: true,
};

export default addressValidity;
