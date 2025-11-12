import baseComponent, { BaseComponentType } from '../../shared/baseComponent';

const image = (props: BaseComponentType) => {
  // Not worth overriding any defaults for now, since this component is not in use at the moment.
  return {
    ...staticDefaultValues,
    ...baseComponent(props),
  };
};

const staticDefaultValues = {
  hash: '',
  name: 'logo-f2808e10-5924-48d4-a16c-b2b531a59ee9.jpg',
  size: 51653,
  type: 'image/jpeg',
  storage: 'base64',
  originalName: 'logo.jpg',
  input: false,
  altText: 'Logo',
  tableView: false,
  widthPercent: 50,
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

export default image;
