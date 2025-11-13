import baseComponent, { BaseComponentType } from '../../shared/baseComponent';

interface DataFetcherType extends BaseComponentType {
  dataFetcherSourceId: 'activities';
  showOther?: boolean;
}

const dataFetcher = (props: DataFetcherType) => {
  const { label, dataFetcherSourceId, showOther } = props ?? {};

  return {
    ...staticDefaultValues,
    ...baseComponent(props),
    dataFetcherSourceId,
    label: (label ?? dataFetcherSourceId === 'activities') ? 'Aktivitetsvelger' : '',
    showOther: showOther ?? false,
  };
};

const staticDefaultValues = {
  queryParams: {},
  key: 'aktivitetsvelger',
  input: true,
  tableView: false,
  type: 'dataFetcher',
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

export default dataFetcher;
