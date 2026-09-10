import { Component, Form } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import { hasLegacyPersonalInformationLayout } from './fyllutLegacyPersonalInformationLayout';

const formWithComponents = (components: Component[]): Form => ({ components }) as Form;

describe('hasLegacyPersonalInformationLayout', () => {
  it('recognizes legacy personal-information fields in nested form components', () => {
    const form = formWithComponents([
      {
        type: 'container',
        key: 'personalInformation',
        label: 'Personal information',
        components: [{ type: 'textfield', key: 'fornavnSoker', label: 'First name' }],
      },
    ]);

    expect(hasLegacyPersonalInformationLayout(form)).toBe(true);
  });

  it('does not classify a form with only legacy sender fields as a personal-information layout', () => {
    const form = formWithComponents([
      { type: 'textfield', key: 'fornavnAvsender', label: 'Sender first name' },
      { type: 'textfield', key: 'etternavnAvsender', label: 'Sender surname' },
    ]);

    expect(hasLegacyPersonalInformationLayout(form)).toBe(false);
  });

  it('does not classify forms using current personal-information components as legacy', () => {
    const form = formWithComponents([
      { type: 'container', key: 'yourInformation', label: 'Your information', yourInformation: true, input: true },
    ]);

    expect(hasLegacyPersonalInformationLayout(form)).toBe(false);
  });
});
