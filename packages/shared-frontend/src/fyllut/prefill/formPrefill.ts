import { Component, Form, SubmissionData } from '@navikt/skjemadigitalisering-shared-domain';

const collectPrefillKeys = (components: Component[] = []): string[] =>
  components.flatMap((component) => [
    ...(Array.isArray(component.prefillKey)
      ? component.prefillKey
      : typeof component.prefillKey === 'string'
        ? [component.prefillKey]
        : []),
    ...(component.components ? collectPrefillKeys(component.components) : []),
  ]);

const toComponentPrefillValue = (value: unknown): string | object | undefined =>
  typeof value === 'string' || (typeof value === 'object' && value !== null) ? value : undefined;

const enrichComponentsWithPrefillValues = (components: Component[] = [], prefillData?: SubmissionData): Component[] =>
  components.map((component) => {
    const prefillValue = Array.isArray(component.prefillKey)
      ? component.prefillKey.reduce<Record<string, unknown>>((accumulator, key) => {
          if (prefillData?.[key] !== undefined) {
            accumulator[key] = prefillData[key];
          }
          return accumulator;
        }, {})
      : typeof component.prefillKey === 'string'
        ? toComponentPrefillValue(prefillData?.[component.prefillKey])
        : undefined;

    return {
      ...component,
      ...(component.components
        ? { components: enrichComponentsWithPrefillValues(component.components, prefillData) }
        : {}),
      ...(component.protectedApiKey && prefillValue !== undefined ? { readOnly: true } : {}),
      ...((
        Array.isArray(component.prefillKey)
          ? typeof prefillValue === 'object' && prefillValue !== null && Object.keys(prefillValue).length > 0
          : prefillValue !== undefined
      )
        ? { prefillValue }
        : {}),
    };
  });

const getFormPrefillKeys = (form: Pick<Form, 'components'>): string[] =>
  Array.from(new Set(collectPrefillKeys(form.components)));

const applyPrefillDataToForm = (form: Form, prefillData?: SubmissionData): Form => ({
  ...form,
  components: enrichComponentsWithPrefillValues(form.components, prefillData),
});

export { applyPrefillDataToForm, getFormPrefillKeys };
