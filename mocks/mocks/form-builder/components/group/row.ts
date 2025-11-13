import baseComponent, { BaseComponentType } from '../../shared/baseComponent';

interface RowType extends BaseComponentType {
  components: any[];
  isAmountWithCurrencySelector?: boolean;
  hideLabel?: boolean;
}

const row = (props: RowType) => {
  const { components, isAmountWithCurrencySelector, hideLabel } = props ?? {};

  return {
    ...staticDefaultValues,
    ...baseComponent(props),
    components,
    isAmountWithCurrencySelector: isAmountWithCurrencySelector ?? false,
    hideLabel: hideLabel ?? true,
  };
};

const staticDefaultValues = {
  type: 'row',
  input: true,
  tableView: false,
  isAmountWithCurrencySelector: true,
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
  tabindex: '',
  disabled: false,
  autofocus: false,
  dbIndex: false,
  customDefaultValue: '',
  calculateValue: '',
  calculateServer: false,
  widget: null,
  attributes: {},
  validateOn: 'change',
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
  tree: true,
  lazyLoad: false,
  keyModified: true,
};

export default row;
