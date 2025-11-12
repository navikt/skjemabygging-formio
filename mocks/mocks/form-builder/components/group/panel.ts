import { generateId, trimAndLowerCase } from '../../shared/utils';

export interface PanelType {
  title: string;
  components: any[];
  key?: string;
}

const panel = (props: PanelType) => {
  const { title, components, key } = props ?? {};

  return {
    ...staticDefaultValues,
    id: generateId(),
    navId: generateId(),
    key: key ?? trimAndLowerCase(title),
    title,
    components,
  };
};

const staticDefaultValues = {
  tree: false,
  type: 'panel',
  input: false,
  label: 'Panel',
  theme: 'default',
  addons: [],
  hidden: false,
  prefix: '',
  suffix: '',
  unique: false,
  dbIndex: false,
  overlay: {
    top: '',
    left: '',
    style: '',
    width: '',
    height: '',
  },
  tooltip: '',
  disabled: false,
  lazyLoad: false,
  multiple: false,
  redrawOn: '',
  tabindex: '',
  autofocus: false,
  encrypted: false,
  hideLabel: false,
  modalEdit: false,
  protected: false,
  refreshOn: '',
  tableView: false,
  attributes: {},
  breadcrumb: 'default',
  errorLabel: '',
  persistent: false,
  properties: {},
  validateOn: 'change',
  clearOnHide: false,
  customClass: '',
  placeholder: '',
  dataGridLabel: false,
  labelPosition: 'top',
  showCharCount: false,
  showWordCount: false,
  calculateValue: '',
  calculateServer: false,
  allowMultipleMasks: false,
  customDefaultValue: '',
  allowCalculateOverride: false,
};

export default panel;
