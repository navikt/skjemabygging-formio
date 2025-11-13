import baseComponent, { BaseComponentType } from '../../shared/baseComponent';

interface DataGridType extends BaseComponentType {
  components: any[];
  addAnother?: string;
  removeAnother?: string;
  rowTitle?: string;
}

const dataGrid = (props: DataGridType) => {
  const { components, addAnother, removeAnother, rowTitle } = props ?? {};

  return {
    ...staticDefaultValues,
    ...baseComponent(props),
    components,
    addAnother,
    removeAnother,
    rowTitle,
  };
};

const staticDefaultValues = {
  type: 'datagrid',
  input: true,
  tableView: false,
  validateOn: 'blur',
  isNavDataGrid: true,
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
  description: '',
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
  disableAddingRemovingRows: false,
  keyModified: true,
};

export default dataGrid;
