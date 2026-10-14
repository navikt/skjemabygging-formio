import { Component, SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';

// Mirrors the legacy components that extend TextField, plus identity. Address and sender resolve
// their prefill lock themselves.
const PREFILL_LOCKED_TYPES = new Set([
  'textfield',
  'firstName',
  'surname',
  'email',
  'orgNr',
  'fnrfield',
  'identity',
  'number',
  'bankAccount',
  'iban',
]);

const hasPrefillKey = (component: Component) =>
  Array.isArray(component.prefillKey) ? component.prefillKey.length > 0 : !!component.prefillKey;

const isLockedByPrefill = (component: Component, submissionMethod?: SubmissionMethod) =>
  submissionMethod === 'digital' && PREFILL_LOCKED_TYPES.has(component.type) && hasPrefillKey(component);

const withPrefillLock = (component: Component, submissionMethod?: SubmissionMethod): Component =>
  isLockedByPrefill(component, submissionMethod) && !component.readOnly ? { ...component, readOnly: true } : component;

export { isLockedByPrefill, withPrefillLock };
