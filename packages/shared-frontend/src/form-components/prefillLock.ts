import { Component, SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';

const hasPrefillKey = (component: Component) =>
  Array.isArray(component.prefillKey) ? component.prefillKey.length > 0 : !!component.prefillKey;

const isLockedByPrefill = (component: Component, submissionMethod?: SubmissionMethod) =>
  submissionMethod === 'digital' && hasPrefillKey(component);

const withPrefillLock = (component: Component, submissionMethod?: SubmissionMethod): Component =>
  isLockedByPrefill(component, submissionMethod) && !component.readOnly ? { ...component, readOnly: true } : component;

export { isLockedByPrefill, withPrefillLock };
