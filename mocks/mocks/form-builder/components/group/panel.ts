import baseComponent, { BaseComponentType } from '../../shared/baseComponent';

interface PanelType
  extends Omit<
    BaseComponentType,
    'description' | 'additionalDescriptionText' | 'additionalDescriptionLabel' | 'validate'
  > {
  title: string;
  components: any[];
  isAttachmentPanel?: boolean;
}

const panel = (props: PanelType) => {
  const { title, components, isAttachmentPanel } = props ?? {};

  return {
    ...staticDefaultValues,
    ...baseComponent(props),
    title,
    components,
    isAttachmentPanel: isAttachmentPanel ?? false,
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
