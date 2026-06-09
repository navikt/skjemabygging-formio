/**
 * Single source of truth for component `type` values used by NavForms.
 *
 * The PDF and Summary renderers each maintain a registry keyed by this union.
 * Adding a new component type here forces TypeScript to fail at the registry
 * declarations until the new type's `Pdf*` / `Summary*` renderer is wired in, so a
 * new component cannot ship without its PDF and Summary representations.
 *
 * Note: `Component.type` is still typed as `string` upstream because it
 * also carries Formio-internal types we don't render ourselves. Registries
 * subset this list explicitly.
 */
const FORM_COMPONENT_TYPES = [
  // Standard
  'accordion',
  'alertstripe',
  'navCheckbox',
  'htmlelement',
  'image',
  'number',
  'radiopanel',
  'select',
  'navSelect',
  'selectboxes',
  'textarea',
  'formioTextArea',
  'textfield',

  // Customized
  'bankAccount',
  'navAddress',
  'addressValidity',
  'attachment',
  'landvelger',
  'currency',
  'valutavelger',
  'email',
  'firstName',
  'iban',
  'identity',
  'fnrfield',
  'orgNr',
  'password',
  'phoneNumber',
  'sender',
  'surname',

  // Date
  'navDatepicker',
  'monthPicker',
  'year',

  // Group
  'container',
  'datagrid',
  'navSkjemagruppe',
  'fieldset',
  'panel',
  'row',

  // System
  'activities',
  'dataFetcher',
  'drivinglist',
  'maalgruppe',
] as const;

type FormComponentType = (typeof FORM_COMPONENT_TYPES)[number];

export { FORM_COMPONENT_TYPES };
export type { FormComponentType };
