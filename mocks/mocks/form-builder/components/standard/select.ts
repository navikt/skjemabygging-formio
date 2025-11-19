import baseComponent, { BaseComponentType } from '../../shared/baseComponent';

interface SelectType extends BaseComponentType {
  values: {
    label: string;
    value: string;
  }[];
  widget?: 'html5' | 'choicesjs';
}

const select = (props: SelectType) => {
  const { values, widget } = props ?? {};

  return {
    ...staticDefaultValues,
    ...baseComponent(props),
    data: {
      values,
    },
    widget: widget ?? 'choicesjs',
  };
};

const staticDefaultValues = {
  id: 'eo5kjt',
  tags: [],
  type: 'select',
  input: true,
  limit: 100,
  logic: [],
  addons: [],
  filter: '',
  hidden: false,
  idPath: 'id',
  prefix: '',
  suffix: '',
  unique: false,
  dataSrc: 'values',
  dbIndex: false,
  overlay: {
    top: '',
    left: '',
    page: '',
    style: '',
    width: '',
    height: '',
  },
  tooltip: '',
  dataType: '',
  disabled: false,
  lazyLoad: true,
  multiple: false,
  redrawOn: '',
  tabindex: '',
  template: '<span>{{ item.label }}</span>',
  autofocus: false,
  encrypted: false,
  hideLabel: false,
  indexeddb: {
    filter: {},
  },
  minSearch: 0,
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
  description: '',
  fuseOptions: {
    include: 'score',
    threshold: 0.3,
  },
  ignoreCache: false,
  placeholder: '',
  searchField: '',
  authenticate: false,
  defaultValue: '',
  selectFields: '',
  customOptions: {},
  dataGridLabel: true,
  labelPosition: 'top',
  readOnlyValue: false,
  refreshOnBlur: '',
  searchEnabled: true,
  showCharCount: false,
  showWordCount: false,
  uniqueOptions: false,
  valueProperty: '',
  calculateValue: '',
  clearOnRefresh: false,
  searchDebounce: 0.3,
  useExactSearch: false,
  calculateServer: false,
  selectThreshold: 0.3,
  allowMultipleMasks: false,
  customDefaultValue: '',
  validateWhenHidden: false,
  allowCalculateOverride: false,
};

export default select;
