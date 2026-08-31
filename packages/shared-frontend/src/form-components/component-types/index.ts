import { FormComponentType } from '@navikt/skjemadigitalisering-shared-domain';
import { TypedComponentDefinition } from './definitions';
import { GenericComponentDefinition } from './generic';

/**
 * Total, discriminated union of every form component definition: the migrated
 * typed variants plus the `GenericComponentDefinition` fallback for anything not
 * yet migrated. This is the type the render registries and the shared-frontend
 * tree-walkers consume instead of the legacy `Component` god-interface.
 *
 * Because it is total and distributive, `ComponentDefinitionByType<K>` resolves
 * to the exact variant for any component type `K`. Every member is structurally
 * assignable to `Component`, so a `ComponentDefinition` still flows into
 * shared-domain utilities (typed as `Component`) without a cast; only the
 * reverse direction - the single ingestion boundary that converts incoming form
 * JSON into `ComponentDefinition` - needs an explicit conversion.
 */
type ComponentDefinition = TypedComponentDefinition | GenericComponentDefinition;

/** The typed definition for a given component `type` literal. */
type ComponentDefinitionByType<K extends FormComponentType> = Extract<ComponentDefinition, { type: K }>;

export type { BaseComponentDefinition } from './base';
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
} from './definitions';
export type { GenericComponentDefinition } from './generic';
export type { ComponentDefinition, ComponentDefinitionByType };
