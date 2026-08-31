import { Component, DataFetcherComponent } from '@navikt/skjemadigitalisering-shared-domain';
import { BaseComponentDefinition } from './base';

/**
 * Per-type component definitions. Each variant is `BaseComponentDefinition` plus
 * a `type` literal discriminant and only the fields distinctive to that
 * component (derived from `Component` via `Pick` to stay in sync). Components
 * whose renderer reads nothing beyond the base set are `BaseComponentDefinition`
 * plus their `type` literal.
 */

/* Standard */
type AccordionDefinition = BaseComponentDefinition & Pick<Component, 'accordionValues'> & { type: 'accordion' };
type AlertDefinition = BaseComponentDefinition & Pick<Component, 'alerttype' | 'isInline'> & { type: 'alertstripe' };
type CheckboxDefinition = BaseComponentDefinition & { type: 'navCheckbox' };
type HtmlElementDefinition = BaseComponentDefinition & { type: 'htmlelement' };
type ImageDefinition = BaseComponentDefinition &
  Pick<Component, 'altText' | 'image' | 'widthPercent'> & { type: 'image' };
type NumberDefinition = BaseComponentDefinition & { type: 'number' };
type RadioPanelDefinition = BaseComponentDefinition & { type: 'radiopanel' };
type SelectDefinition = BaseComponentDefinition & { type: 'select' };
type NavSelectDefinition = BaseComponentDefinition & { type: 'navSelect' };
type SelectBoxesDefinition = BaseComponentDefinition & { type: 'selectboxes' };
type TextAreaDefinition = BaseComponentDefinition & { type: 'textarea' };
type TextFieldDefinition = BaseComponentDefinition & { type: 'textfield' };

/* Customized */
type AccountNumberDefinition = BaseComponentDefinition & { type: 'bankAccount' };
type AddressDefinition = BaseComponentDefinition &
  Pick<Component, 'addressPriority' | 'addressType' | 'addressTypeWizard'> & { type: 'navAddress' };
type AddressValidityDefinition = BaseComponentDefinition & { type: 'addressValidity' };
type AttachmentDefinition = BaseComponentDefinition & Pick<Component, 'attachmentValues'> & { type: 'attachment' };
type CountrySelectDefinition = BaseComponentDefinition & Pick<Component, 'ignoreNorway'> & { type: 'landvelger' };
type CurrencyDefinition = BaseComponentDefinition & { type: 'currency' };
type CurrencySelectDefinition = BaseComponentDefinition & { type: 'valutavelger' };
type EmailDefinition = BaseComponentDefinition & { type: 'email' };
type FirstNameDefinition = BaseComponentDefinition & { type: 'firstName' };
type IbanDefinition = BaseComponentDefinition & { type: 'iban' };
type IdentityDefinition = BaseComponentDefinition & { type: 'identity' };
type NationalIdentityNumberDefinition = BaseComponentDefinition & { type: 'fnrfield' };
type OrganizationNumberDefinition = BaseComponentDefinition & { type: 'orgNr' };
type PhoneNumberDefinition = BaseComponentDefinition & Pick<Component, 'showAreaCode'> & { type: 'phoneNumber' };
type SenderDefinition = BaseComponentDefinition & Pick<Component, 'senderRole' | 'descriptions'> & { type: 'sender' };
type SurnameDefinition = BaseComponentDefinition & { type: 'surname' };

/* Date */
type DatePickerDefinition = BaseComponentDefinition & { type: 'navDatepicker' };
type MonthPickerDefinition = BaseComponentDefinition & { type: 'monthPicker' };
type YearDefinition = BaseComponentDefinition & { type: 'year' };

/* Group */
type ContainerDefinition = BaseComponentDefinition & { type: 'container' };
type DataGridDefinition = BaseComponentDefinition &
  Pick<Component, 'initEmpty' | 'addAnother' | 'removeAnother' | 'disableAddingRemovingRows' | 'rowTitle'> & {
    type: 'datagrid';
  };
type FormGroupDefinition = BaseComponentDefinition &
  Pick<Component, 'legend' | 'backgroundColor'> & { type: 'navSkjemagruppe' | 'fieldset' };
type PanelDefinition = BaseComponentDefinition & Pick<Component, 'title'> & { type: 'panel' };
type RowDefinition = BaseComponentDefinition & Pick<Component, 'widthPercent'> & { type: 'row' };

/* System */
type ActivitiesDefinition = BaseComponentDefinition & { type: 'activities' };
type DataFetcherDefinition = BaseComponentDefinition &
  Partial<Pick<DataFetcherComponent, 'dataFetcherSourceId' | 'queryParams' | 'showOther'>> & { type: 'dataFetcher' };
type DrivingListDefinition = BaseComponentDefinition & { type: 'drivinglist' };
type TargetGroupDefinition = BaseComponentDefinition & { type: 'maalgruppe' };

/**
 * Union of every component type that has a dedicated typed variant. Grows as
 * components are migrated; shrinks `GenericComponentDefinition` accordingly.
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
  DatePickerDefinition,
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
