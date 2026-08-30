import { Component, Form } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import { applyDefaultValuesToSubmission } from './defaultValues';

const createForm = (components: Component[]): Form =>
  ({
    title: 'Test',
    path: 'test',
    properties: { submissionTypes: ['PAPER'] },
    components: [
      {
        key: 'panel',
        title: 'Panel',
        type: 'panel',
        navId: 'panel',
        components,
      },
    ],
  }) as unknown as Form;

describe('applyDefaultValuesToSubmission', () => {
  it('applies the string "0" default of number components (nav001004)', () => {
    const form = createForm([
      { key: 'mandag', label: 'Mandag', type: 'number', input: true, navId: 'mandag', defaultValue: '0' },
      { key: 'tirsdag', label: 'Tirsdag', type: 'number', input: true, navId: 'tirsdag', defaultValue: '0' },
    ] as unknown as Component[]);

    expect(applyDefaultValuesToSubmission(form, { data: {} })?.data).toEqual({ mandag: '0', tirsdag: '0' });
  });

  it('applies the numeric 0 default of currency components (nav100736)', () => {
    const form = createForm([
      { key: 'pris', label: 'Pris', type: 'currency', input: true, navId: 'pris', defaultValue: 0 },
    ] as unknown as Component[]);

    expect(applyDefaultValuesToSubmission(form, { data: {} })?.data).toEqual({ pris: 0 });
  });

  it('applies country defaults as the stored option object (nav111217b)', () => {
    const form = createForm([
      {
        key: 'velgLandReiseTilSamling',
        label: 'Velg land',
        type: 'landvelger',
        input: true,
        navId: 'land',
        defaultValue: { label: 'Norge', value: 'NO' },
      },
    ] as unknown as Component[]);

    expect(applyDefaultValuesToSubmission(form, { data: {} })?.data).toEqual({
      velgLandReiseTilSamling: { label: 'Norge', value: 'NO' },
    });
  });

  it('applies attachment defaults (nav550063)', () => {
    const form = createForm([
      {
        key: 'andreBestemmelserTilknyttetAvtalen',
        label: 'Andre bestemmelser',
        type: 'attachment',
        input: true,
        navId: 'vedlegg',
        defaultValue: 'leggerVedNaa',
      },
    ] as unknown as Component[]);

    expect(applyDefaultValuesToSubmission(form, { data: {} })?.data).toEqual({
      andreBestemmelserTilknyttetAvtalen: 'leggerVedNaa',
    });
  });

  it('ignores empty defaults such as the empty country object (nav020805)', () => {
    const form = createForm([
      { key: 'land', label: 'Land', type: 'landvelger', input: true, navId: 'land', defaultValue: {} },
      { key: 'utenDefault', label: 'Uten default', type: 'number', input: true, navId: 'uten' },
      { key: 'tomStreng', label: 'Tom streng', type: 'number', input: true, navId: 'tom', defaultValue: '' },
    ] as unknown as Component[]);

    expect(applyDefaultValuesToSubmission(form, { data: {} })?.data).toEqual({});
  });

  it('leaves defaults for components that apply them in the input control', () => {
    const form = createForm([
      {
        key: 'jegVetIkkeHvaOrganisasjonsnummeretEr',
        label: 'Jeg vet ikke hva organisasjonsnummeret er.',
        type: 'navCheckbox',
        input: true,
        navId: 'checkbox',
        defaultValue: 'ja',
      },
      {
        key: 'sphH',
        label: 'Sph høyre',
        type: 'select',
        input: true,
        navId: 'select',
        defaultValue: '0.00',
      },
    ] as unknown as Component[]);

    expect(applyDefaultValuesToSubmission(form, { data: {} })?.data).toEqual({});
  });

  it('never overwrites an existing answer', () => {
    const form = createForm([
      { key: 'mandag', label: 'Mandag', type: 'number', input: true, navId: 'mandag', defaultValue: '0' },
    ] as unknown as Component[]);

    expect(applyDefaultValuesToSubmission(form, { data: { mandag: 12 } })?.data).toEqual({ mandag: 12 });
  });

  it('applies defaults to nested containers', () => {
    const form = createForm([
      {
        key: 'utgifter',
        label: 'Utgifter',
        type: 'container',
        input: true,
        tree: true,
        navId: 'container',
        components: [
          { key: 'pris', label: 'Pris', type: 'currency', input: true, navId: 'pris', defaultValue: 0 },
        ] as unknown as Component[],
      },
    ] as unknown as Component[]);

    expect(applyDefaultValuesToSubmission(form, { data: {} })?.data).toEqual({ utgifter: { pris: 0 } });
  });

  it('returns the same submission when the form has no defaults', () => {
    const form = createForm([
      { key: 'mandag', label: 'Mandag', type: 'number', input: true, navId: 'mandag' },
    ] as unknown as Component[]);
    const submission = { data: {} };

    expect(applyDefaultValuesToSubmission(form, submission)).toBe(submission);
  });
});
