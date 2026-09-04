import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import {
  enrichComponentsWithBaseSubmissionPath,
  flattenComponentsWithBaseSubmissionPath,
  getResolvedSubmissionPath,
} from './formDefinitionUtils';

describe('formDefinitionUtils', () => {
  it('enriches tree and transparent parents with base submission paths', () => {
    const components = [
      {
        key: 'container',
        type: 'container',
        input: true,
        tree: true,
        components: [
          {
            key: 'fieldset',
            type: 'fieldset',
            input: false,
            tree: false,
            components: [{ key: 'name', type: 'textfield', input: true }],
          },
        ],
      },
    ] as Component[];

    const [container] = enrichComponentsWithBaseSubmissionPath(components);
    const [fieldset] = container.components ?? [];
    const [name] = fieldset?.components ?? [];

    expect(container.baseSubmissionPath).toBe('');
    expect(getResolvedSubmissionPath(container)).toBe('container');
    expect(fieldset.baseSubmissionPath).toBe('container');
    expect(getResolvedSubmissionPath(fieldset)).toBe('container');
    expect(name.baseSubmissionPath).toBe('container');
    expect(getResolvedSubmissionPath(name)).toBe('container.name');
  });

  it('flattens enriched components without losing base submission paths', () => {
    const components = enrichComponentsWithBaseSubmissionPath([
      {
        key: 'container',
        type: 'container',
        input: true,
        tree: true,
        components: [{ key: 'name', type: 'textfield', input: true }],
      } as Component,
    ]);

    expect(
      flattenComponentsWithBaseSubmissionPath(components).map((component) => component.baseSubmissionPath),
    ).toEqual(['', 'container']);
  });

  it('does not duplicate the submission path for a your-information panel containing a same-key container', () => {
    const components = enrichComponentsWithBaseSubmissionPath([
      {
        key: 'dineOpplysninger',
        type: 'panel',
        input: false,
        yourInformation: true,
        components: [
          {
            key: 'dineOpplysninger',
            type: 'container',
            input: true,
            components: [{ key: 'fornavn', type: 'firstName', input: true }],
          },
        ],
      } as Component,
    ]);

    const [panel] = components;
    const [container] = panel.components ?? [];
    const [firstName] = container?.components ?? [];

    expect(container.baseSubmissionPath).toBe('');
    expect(firstName.baseSubmissionPath).toBe('dineOpplysninger');
    expect(getResolvedSubmissionPath(firstName)).toBe('dineOpplysninger.fornavn');
  });

  it('keeps omitted-input your-information containers as submission objects', () => {
    const [container] = enrichComponentsWithBaseSubmissionPath([
      {
        key: 'dineOpplysninger',
        type: 'container',
        yourInformation: true,
        components: [{ key: 'fornavn', type: 'firstName', input: true }],
      } as Component,
    ]);
    const [firstName] = container.components ?? [];

    expect(firstName.baseSubmissionPath).toBe('dineOpplysninger');
    expect(getResolvedSubmissionPath(firstName)).toBe('dineOpplysninger.fornavn');
  });

  it.each([undefined, null])('keeps the key in attachment paths when input is %s', (input) => {
    const [panel] = enrichComponentsWithBaseSubmissionPath([
      {
        key: 'vedlegg',
        type: 'panel',
        input: false,
        components: [{ key: 'dokumentasjon', type: 'attachment', input }],
      } as Component,
    ]);
    const [attachment] = panel.components ?? [];

    expect(getResolvedSubmissionPath(attachment)).toBe('dokumentasjon');
  });
});
