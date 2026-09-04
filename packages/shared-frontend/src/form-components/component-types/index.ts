import { FormComponentType } from '@navikt/skjemadigitalisering-shared-domain';
import { TypedComponentDefinition } from './definitions';

/**
 * Total, discriminated union of every form component definition. This is the
 * type the render registries and the shared-frontend tree-walkers consume
 * instead of the legacy `Component` god-interface.
 *
 * Because it is total and distributive, `ComponentDefinitionByType<K>` resolves
 * to the exact variant for any component type `K`. Every member is structurally
 * assignable to `Component`, so a `ComponentDefinition` still flows into
 * shared-domain utilities (typed as `Component`) without a cast; only the
 * reverse direction - the single ingestion boundary that converts incoming form
 * JSON into `ComponentDefinition` - needs an explicit conversion.
 */
type ComponentDefinition = TypedComponentDefinition;

/** The typed definition for a given component `type` literal. */
type ComponentDefinitionByType<K extends FormComponentType> = Extract<ComponentDefinition, { type: K }>;

/**
 * Compile-time guarantee that `ComponentDefinition` stays total over
 * `FormComponentType`. Adding a type to `FORM_COMPONENT_TYPES` without a
 * matching definition variant makes this fail to compile.
 */
type AssertNever<T extends never> = T;
type NoUncoveredComponentTypes = AssertNever<Exclude<FormComponentType, ComponentDefinition['type']>>;

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
export type { ComponentDefinition, ComponentDefinitionByType, NoUncoveredComponentTypes };
