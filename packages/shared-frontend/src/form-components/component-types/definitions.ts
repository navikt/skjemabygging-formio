import type {
  AccordionSettingValues,
  AddressType,
  AttachmentSettingValues,
  AttachmentType,
  ComponentData,
  ComponentProperties,
  ComponentValue,
  CustomLabels,
  DataFetcherSourceId,
  PrefillKey,
  RecipientRole,
} from '@navikt/skjemadigitalisering-shared-domain';
import { BaseComponentDefinition, TextInputDefinition } from './base';

/**
 * Per-type component definitions. Each variant is `BaseComponentDefinition` plus
 * a `type` literal discriminant and the capabilities its renderer uses.
 */

interface OptionValuesDefinition {
  values?: ComponentValue[];
  data?: ComponentData;
}

interface DefaultValueDefinition {
  defaultValue?: string | number | boolean | object | unknown[] | null;
}

interface CustomLabelsDefinition {
  customLabels?: CustomLabels;
}

interface DateOffsetDefinition {
  earliestAllowedDate?: string;
  latestAllowedDate?: string;
}

interface DatePickerRangeDefinition extends DateOffsetDefinition {
  beforeDateInputKey?: string;
  mayBeEqual?: string;
  specificEarliestAllowedDate?: string;
  specificLatestAllowedDate?: string;
}

type AccordionDefinition = BaseComponentDefinition & { accordionValues?: AccordionSettingValues; type: 'accordion' };
type AlertDefinition = BaseComponentDefinition & {
  alerttype?: string;
  isInline?: boolean;
  content?: string;
  type: 'alertstripe';
};
type CheckboxDefinition = BaseComponentDefinition & DefaultValueDefinition & { type: 'navCheckbox' };
type HtmlElementDefinition = BaseComponentDefinition & { content?: string; type: 'htmlelement' };
type ImageDefinition = BaseComponentDefinition & {
  altText?: string;
  image?: unknown;
  widthPercent?: number;
  type: 'image';
};
type NumberDefinition = BaseComponentDefinition & TextInputDefinition & DefaultValueDefinition & { type: 'number' };
type RadioPanelDefinition = BaseComponentDefinition &
  OptionValuesDefinition &
  DefaultValueDefinition & { type: 'radiopanel' };
type SelectDefinition = BaseComponentDefinition &
  OptionValuesDefinition &
  DefaultValueDefinition & { selectType?: 'auto' | 'select' | 'combobox'; type: 'select' };
type NavSelectDefinition = BaseComponentDefinition &
  OptionValuesDefinition &
  DefaultValueDefinition & { selectType?: 'auto' | 'select' | 'combobox'; type: 'navSelect' };
type SelectBoxesDefinition = BaseComponentDefinition &
  OptionValuesDefinition &
  DefaultValueDefinition & { type: 'selectboxes' };
type TextAreaDefinition = BaseComponentDefinition & { type: 'textarea' };
type TextFieldDefinition = BaseComponentDefinition & TextInputDefinition & { type: 'textfield' };

type AccountNumberDefinition = BaseComponentDefinition & { type: 'bankAccount' };
type AddressDefinition = BaseComponentDefinition &
  CustomLabelsDefinition & {
    addressPriority?: 'bostedsadresse' | 'oppholdsadresse' | 'kontaktadresse';
    addressType?: AddressType;
    addressTypeWizard?: 'predefined' | 'user';
    prefillKey?: PrefillKey | PrefillKey[];
    type: 'navAddress';
  };
type AddressValidityDefinition = BaseComponentDefinition & { type: 'addressValidity' };
type AttachmentDefinition = BaseComponentDefinition &
  OptionValuesDefinition &
  DefaultValueDefinition & {
    attachmentValues?: AttachmentSettingValues;
    attachmentType?: AttachmentType;
    otherDocumentation?: boolean;
    properties?: ComponentProperties;
    type: 'attachment';
  };
type CountrySelectDefinition = BaseComponentDefinition &
  DefaultValueDefinition & { ignoreNorway?: boolean; type: 'landvelger' };
type CurrencyDefinition = BaseComponentDefinition &
  TextInputDefinition &
  DefaultValueDefinition & { currency?: string; type: 'currency' };
type CurrencySelectDefinition = BaseComponentDefinition & DefaultValueDefinition & { type: 'valutavelger' };
type EmailDefinition = BaseComponentDefinition & TextInputDefinition & { type: 'email' };
type FirstNameDefinition = BaseComponentDefinition & TextInputDefinition & { type: 'firstName' };
type IbanDefinition = BaseComponentDefinition & { type: 'iban' };
type IdentityDefinition = BaseComponentDefinition & CustomLabelsDefinition & { type: 'identity' };
type NationalIdentityNumberDefinition = BaseComponentDefinition & { type: 'fnrfield' };
type OrganizationNumberDefinition = BaseComponentDefinition & TextInputDefinition & { type: 'orgNr' };
type PhoneNumberDefinition = BaseComponentDefinition & { showAreaCode?: boolean; type: 'phoneNumber' };
type SenderDefinition = BaseComponentDefinition &
  CustomLabelsDefinition & {
    senderRole?: RecipientRole;
    descriptions?: Record<string, string>;
    type: 'sender';
  };
type SurnameDefinition = BaseComponentDefinition & TextInputDefinition & { type: 'surname' };

type DatePickerDefinition = BaseComponentDefinition & DatePickerRangeDefinition & { type: 'navDatepicker' };
type MonthPickerDefinition = BaseComponentDefinition & DateOffsetDefinition & { type: 'monthPicker' };
type YearDefinition = BaseComponentDefinition & TextInputDefinition & { type: 'year' };

type ContainerDefinition = BaseComponentDefinition & { type: 'container' };
type DataGridDefinition = BaseComponentDefinition & {
  initEmpty?: boolean;
  addAnother?: string;
  removeAnother?: string;
  disableAddingRemovingRows?: boolean;
  rowTitle?: string;
  tree?: boolean;
  type: 'datagrid';
};
type FormGroupDefinition = BaseComponentDefinition & {
  legend?: string;
  backgroundColor?: boolean;
  type: 'navSkjemagruppe' | 'fieldset';
};
type PanelDefinition = BaseComponentDefinition & { title?: string; type: 'panel' };
type RowDefinition = BaseComponentDefinition & {
  widthPercent?: number;
  isAmountWithCurrencySelector?: boolean;
  type: 'row';
};

type ActivitiesDefinition = BaseComponentDefinition & { type: 'activities' };
type DataFetcherDefinition = BaseComponentDefinition &
  OptionValuesDefinition & {
    dataFetcherSourceId?: DataFetcherSourceId;
    queryParams?: Record<string, string>;
    showOther?: boolean;
    type: 'dataFetcher';
  };
type DrivingListDefinition = BaseComponentDefinition & { type: 'drivinglist' };
type TargetGroupDefinition = BaseComponentDefinition & { type: 'maalgruppe' };

/**
 * Union of every component type. Must stay total over `FormComponentType`:
 * adding a type there without a variant here is a compile error.
 */
type TypedComponentDefinition =
  | AccordionDefinition
  | AlertDefinition
  | CheckboxDefinition
  | HtmlElementDefinition
  | ImageDefinition
  | NumberDefinition
  | RadioPanelDefinition
  | SelectDefinition
  | NavSelectDefinition
  | SelectBoxesDefinition
  | TextAreaDefinition
  | TextFieldDefinition
  | AccountNumberDefinition
  | AddressDefinition
  | AddressValidityDefinition
  | AttachmentDefinition
  | CountrySelectDefinition
  | CurrencyDefinition
  | CurrencySelectDefinition
  | EmailDefinition
  | FirstNameDefinition
  | IbanDefinition
  | IdentityDefinition
  | NationalIdentityNumberDefinition
  | OrganizationNumberDefinition
  | PhoneNumberDefinition
  | SenderDefinition
  | SurnameDefinition
  | DatePickerDefinition
  | MonthPickerDefinition
  | YearDefinition
  | ContainerDefinition
  | DataGridDefinition
  | FormGroupDefinition
  | PanelDefinition
  | RowDefinition
  | ActivitiesDefinition
  | DataFetcherDefinition
  | DrivingListDefinition
  | TargetGroupDefinition;

/** The `type` literals that have a dedicated typed variant. */
type TypedComponentType = TypedComponentDefinition['type'];

export type {
  AccordionDefinition,
  AccountNumberDefinition,
  ActivitiesDefinition,
  AddressDefinition,
  AddressValidityDefinition,
  AlertDefinition,
  AttachmentDefinition,
  CheckboxDefinition,
  ContainerDefinition,
  CountrySelectDefinition,
  CurrencyDefinition,
  CurrencySelectDefinition,
  DataFetcherDefinition,
  DataGridDefinition,
  DateOffsetDefinition,
  DatePickerDefinition,
  DatePickerRangeDefinition,
  DrivingListDefinition,
  EmailDefinition,
  FirstNameDefinition,
  FormGroupDefinition,
  HtmlElementDefinition,
  IbanDefinition,
  IdentityDefinition,
  ImageDefinition,
  MonthPickerDefinition,
  NationalIdentityNumberDefinition,
  NavSelectDefinition,
  NumberDefinition,
  OrganizationNumberDefinition,
  PanelDefinition,
  PhoneNumberDefinition,
  RadioPanelDefinition,
  RowDefinition,
  SelectBoxesDefinition,
  SelectDefinition,
  SenderDefinition,
  SurnameDefinition,
  TargetGroupDefinition,
  TextAreaDefinition,
  TextFieldDefinition,
  TypedComponentDefinition,
  TypedComponentType,
  YearDefinition,
};
