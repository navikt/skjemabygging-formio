import baseComponent, { BaseComponentType } from '../../shared/baseComponent';

interface AddressType extends BaseComponentType {
  addressType?: 'NORWEGIAN_ADDRESS' | 'POST_OFFICE_BOX' | 'FOREIGN_ADDRESS';
  prefill?: boolean;
}

const address = (props: AddressType) => {
  const { addressType, prefill } = props ?? {};

  return {
    ...staticDefaultValues,
    ...baseComponent(props),
    addressType: addressType ?? 'NORWEGIAN_ADDRESS',
    prefill: prefill ?? false,
  };
};

const staticDefaultValues = {
  type: 'navAddress',
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
  fieldSize: 'input--xxl',
  keyModified: true,
};

export default address;
