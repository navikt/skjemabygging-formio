import { Component, Form } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import { applyPrefillDataToForm, getFormPrefillKeys } from './formPrefill';

const createForm = (components: Component[]): Form => ({
  skjemanummer: 'NAV 12-34.56',
  path: 'test-form',
  title: 'Test form',
  components,
  properties: {
    skjemanummer: 'NAV 12-34.56',
    tema: 'GEN',
    submissionTypes: [],
    subsequentSubmissionTypes: [],
  },
});
const createComponent = (component: Partial<Component>): Component => ({
  key: 'component',
  label: 'Component',
  type: 'textfield',
  ...component,
});

describe('formPrefill', () => {
  it('collects unique prefill keys from nested components', () => {
    const form = createForm([
      createComponent({
        prefillKey: 'sokerFornavn',
        components: [createComponent({ prefillKey: ['sokerFornavn', 'sokerEtternavn'] })],
      }),
    ]);

    expect(getFormPrefillKeys(form)).toEqual(['sokerFornavn', 'sokerEtternavn']);
  });

  it('adds prefill values recursively and locks protected values', () => {
    const form = createForm([
      createComponent({
        prefillKey: 'sokerFornavn',
        protectedApiKey: true,
        components: [createComponent({ prefillKey: ['sokerTelefonnummer', 'sokerKjonn'] })],
      }),
    ]);

    const enrichedForm = applyPrefillDataToForm(form, {
      sokerFornavn: 'Ola',
      sokerTelefonnummer: '12345678',
    });

    expect(enrichedForm.components?.[0]).toMatchObject({
      prefillValue: 'Ola',
      readOnly: true,
      components: [{ prefillValue: { sokerTelefonnummer: '12345678' } }],
    });
  });
});
