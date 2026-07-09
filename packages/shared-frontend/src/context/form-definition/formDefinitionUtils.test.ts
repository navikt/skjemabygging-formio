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
});
