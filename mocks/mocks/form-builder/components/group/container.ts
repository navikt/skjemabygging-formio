import baseComponent, { BaseComponentType } from '../../shared/baseComponent';

interface ContainerType extends BaseComponentType {
  yourInformation?: boolean;
  hideLabel?: boolean;
  components: any[];
}

const container = (props: ContainerType) => {
  const { components, hideLabel, yourInformation } = props ?? {};

  return {
    ...staticDefaultValues,
    ...baseComponent(props),
    components,
    hideLabel: hideLabel ?? true,
    yourInformation: yourInformation ?? false,
  };
};

const staticDefaultValues = {
  type: 'container',
  input: true,
  tableView: false,
  validateOn: 'blur',
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

export default container;
