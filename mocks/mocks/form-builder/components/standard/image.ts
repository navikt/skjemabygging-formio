import baseComponent, { BaseComponentType } from '../../shared/baseComponent';

// A minimal 1x1 px transparent PNG
const TEST_IMAGE_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

interface ImageType extends BaseComponentType {
  altText?: string;
  widthPercent?: number;
  url?: string;
}

const image = (props: ImageType) => {
  const { altText, widthPercent, url, ...rest } = props ?? {};

  return {
    ...staticDefaultValues,
    ...baseComponent(rest),
    image: [
      {
        url: url ?? TEST_IMAGE_URL,
        hash: '',
        name: 'test-bilde.png',
        size: 68,
        type: 'image/png',
        storage: 'base64',
        originalName: 'test-bilde.png',
      },
    ],
    altText: altText ?? 'Bilde',
    widthPercent: widthPercent ?? 100,
  };
};

const staticDefaultValues = {
  type: 'image',
  input: false,
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
  fieldSize: 'input--xxl',
  keyModified: true,
};

export default image;
