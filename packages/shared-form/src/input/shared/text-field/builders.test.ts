import type { Component, Submission, TranslateFunction } from '@navikt/skjemadigitalisering-shared-domain';
import { buildTextFieldInputNode } from './builders';

const translate: TranslateFunction = ((text?: string) => (text ? `translated:${text}` : '')) as TranslateFunction;

const createComponent = (overrides: Partial<Component> = {}): Component =>
  ({
    key: 'field',
    label: 'Field label',
    description: 'Field description',
    type: 'textfield',
    ...overrides,
  }) as Component;

const createSubmission = (data: Submission['data']): Submission => ({ data });

describe('text field input builders', () => {
  it('builds a text field input node from component metadata and submission data', () => {
    const node = buildTextFieldInputNode({
      component: createComponent(),
      submissionPath: 'field',
      submission: createSubmission({ field: 'hello' }),
      translate,
    });

    expect(node).toEqual({
      type: 'text-field',
      key: 'field',
      component: createComponent(),
      submissionPath: 'field',
      label: 'translated:Field label',
      description: 'translated:Field description',
      value: 'hello',
      validators: undefined,
      autoComplete: undefined,
      readOnly: undefined,
    });
  });

  it('keeps runtime-facing wrapper options on the node', () => {
    const node = buildTextFieldInputNode({
      component: createComponent(),
      submissionPath: 'field',
      submission: createSubmission({ field: 'hello' }),
      translate,
      validators: { required: true, minLength: 2 },
      autoComplete: 'name',
      readOnly: true,
    });

    expect(node.validators).toEqual({ required: true, minLength: 2 });
    expect(node.autoComplete).toBe('name');
    expect(node.readOnly).toBe(true);
  });
});
