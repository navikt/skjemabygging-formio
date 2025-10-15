import { AccordionSettingValues } from '../accordion';
import { AttachmentSettingValues } from '../attachment';
import { DataFetcherSourceId } from '../data-fetcher';
import { TextSize } from '../text';
import { NavFormType } from './navFormType';
import { PrefillKey } from './prefill';
import { Submission, SubmissionData } from './submission';

export type AddressType = 'NORWEGIAN_ADDRESS' | 'POST_OFFICE_BOX' | 'FOREIGN_ADDRESS';
export type InputMode = 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';

type ComponentDataSrc = 'values' | 'url' | 'json' | 'custom' | 'resource';

export interface ComponentData {
  values?: ComponentValue[];
  url?: string;
  custom?: any;
}

export type AttachmentType = 'default' | 'other';

export interface ComponentValue {
  value: string;
  label: string;
  upload?: boolean;
  description?: string;
}

export interface CustomLabels {
  [key: string]: string;
}

export interface Component {
  id?: string;
  navId?: string;
  key: string;
  label: string;
  customLabels?: CustomLabels;
  type: string;
  disabled?: boolean;
  content?: string;
  calculateValue?: string;
  allowCalculateOverride?: boolean;
  data?: ComponentData;
  dataSrc?: ComponentDataSrc;
  validate?: ComponentValidate;
  conditional?: ComponentConditional;
  customConditional?: string;
  valueProperty?: string;
  labelProperty?: string;
  properties?: ComponentProperties;
  component?: Component;
  components?: Component[];
  otherDocumentation?: boolean;
  isAttachmentPanel?: boolean;
  prefillKey?: PrefillKey;
  values?: ComponentValue[];
  attachmentValues?: AttachmentSettingValues;
  accordionValues?: AccordionSettingValues;
  attachmentType?: AttachmentType;
  showAreaCode?: boolean;
  hideLabel?: boolean;
  description?: string;
  suffix?: string;
  prefix?: string;
  title?: string;
  html?: string;
  legend?: string;
  additionalDescriptionLabel?: string;
  additionalDescriptionText?: string;
  contentForPdf?: string;
  altText?: string;
  buttonText?: string;
  addAnother?: string;
  removeAnother?: string;
  input?: boolean;
  readOnly?: boolean;
  weight?: number;
  tag?: string;
  collapsible?: boolean;
  collapsed?: boolean;
  fieldSize?: string;
  titleSize?: TextSize;
  autocomplete?: string;
  spellCheck?: boolean;
  rows?: number;
  editor?: string;
  wysiwyg?: object | boolean;
  as?: string;
  style?: object;
  theme?: string;
  defaultValue?: string | number | boolean | any[] | object;
  tooltip?: string;
  reorder?: boolean;
  dataGridLabel?: boolean;
  alerttype?: string;
  fileMaxSize?: string;
  storage?: string;
  image?: any;
  filePattern?: string;
  webcam?: boolean;
  multiple?: boolean;
  customDefaultValue?: string;
  keyLabel?: string;
  valueComponent?: Component;
  isInline?: boolean;
  textDisplay?: 'form' | 'formPdf' | 'pdf';
  autoExpand?: boolean;
  customClass?: string;
  validateOn?: string;
  isNavDataGrid?: boolean;
  hidden?: boolean;
  clearOnHide?: boolean;
  specificEarliestAllowedDate?: string;
  specificLatestAllowedDate?: string;
  beforeDateInputKey?: string;
  mayBeEqual?: string;
  earliestAllowedDate?: string;
  latestAllowedDate?: string;
  getValue?: () => string;
  rerender?: () => void;
  onChange?: (props) => void;
  inputType?: InputMode;
  ignoreNorway?: boolean;
  tree?: boolean;
  path?: string;
  protected?: boolean;
  disableAddingRemovingRows?: boolean;
  addressPriority?: 'bostedsadresse' | 'oppholdsadresse' | 'kontaktadresse';
  addressType?: AddressType;
  prefillValue?: string | object;
  protectedApiKey?: boolean;
  yourInformation?: boolean;
  widthPercent?: number;
  logic?: any;
  currency?: string;
  isAmountWithCurrencySelector?: boolean;
}

export interface DataFetcherComponent extends Component {
  queryParams?: Record<string, string>;
  showOther: boolean;
  dataFetcherSourceId: DataFetcherSourceId;
}

export interface ComponentProperties {
  vedleggstittel?: string;
  vedleggskode?: string;
  vedleggskjema?: string;
}

export interface Attachment {
  vedleggstittel?: string;
  vedleggskode?: string;
  label?: string;
}

export interface Panel extends Component {
  title: string;
}

export interface ComponentValidate {
  custom?: string;
  json?: string;
  required?: boolean;
  pattern?: string;
  patternMessage?: string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  minYear?: number;
  maxYear?: number;
  digitsOnly?: number;
}

export interface ComponentConditional {
  when?: string;
  json?: object;
}

export interface Webform {
  id: string;
  form?: NavFormType;
  language?: string;
  submission?: Submission;
  setSubmission: (submission: Submission) => Promise<void>;
  src?: string;
  url?: string;
  onAny?: any;
  destroy: (deleteFromGlobal: boolean) => void;
  focusOnComponent: (args: any) => void;
  validateOnNextPage: (resultCallback: (valid: boolean) => void) => void;
  redrawNavigation: () => void;
  checkData: (data: SubmissionData, flags: any[], row: any) => void;
  currentPanel: Component;
  currentPanels: string[];
  setPage: (index: number) => void;
  redraw: () => Promise<void>;
  submissionReady: Promise<void>;
  _data: SubmissionData;
  emitNavigationPathsChanged: () => void;
  emit: (event: string, args: any) => void;
  page: number;
  currentNextPage: number;
}
