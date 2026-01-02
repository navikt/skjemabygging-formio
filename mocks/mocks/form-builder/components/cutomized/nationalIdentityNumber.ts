import baseComponent, { BaseComponentType } from '../../shared/baseComponent';

const nationalIdentityNumber = (props?: BaseComponentType) => {
  const { key, label } = props ?? {};

  return {
    ...staticDefaultValues,
    ...baseComponent({
      ...props,
      label: label ?? 'Fødselsnummer eller d-nummer',
      key,
    }),
  };
};

const staticDefaultValues = {
  type: 'fnrfield',
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

export default nationalIdentityNumber;
