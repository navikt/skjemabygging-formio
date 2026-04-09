import { Component, Submission, TranslateFunction } from '@navikt/skjemadigitalisering-shared-domain';
import { resolveComponent, resolveForm } from '..';

const translate: TranslateFunction = (text) => `translated:${text ?? ''}`;

const createTextField = (overrides: Partial<Component> = {}): Component => ({
  input: true,
  key: 'firstName',
  label: 'First name',
  type: 'textfield',
  ...overrides,
});

const createSubmission = (value: Submission['data'][string]): Submission => ({
  data: {
    firstName: value,
  },
});

describe('resolveComponent', () => {
  it('maps legacy textfield components to a resolved textField model', () => {
    const resolvedComponent = resolveComponent({
      component: createTextField(),
      currentLanguage: 'nb',
      submission: createSubmission('Ada'),
      submissionPath: '',
      translate,
    });

    expect(resolvedComponent).toEqual({
      autocomplete: undefined,
      description: undefined,
      disabled: undefined,
      hideLabel: undefined,
      id: undefined,
      inputType: undefined,
      key: 'firstName',
      label: 'First name',
      navId: undefined,
      readOnly: undefined,
      spellCheck: undefined,
      submissionPath: 'firstName',
      translatedLabel: 'translated:First name',
      type: 'textField',
      validate: undefined,
      value: 'Ada',
    });
  });

  it('returns null when the submission does not contain a displayable value', () => {
    const resolvedComponent = resolveComponent({
      component: createTextField(),
      currentLanguage: 'nb',
      submission: createSubmission(''),
      submissionPath: '',
      translate,
    });

    expect(resolvedComponent).toBeNull();
  });
});

describe('resolveForm', () => {
  it('resolves supported components and skips unsupported ones', () => {
    const resolvedComponents = resolveForm({
      components: [
        createTextField(),
        {
          key: 'unsupported',
          label: 'Unsupported',
          type: 'select',
        },
      ],
      currentLanguage: 'nb',
      submission: createSubmission('Ada'),
      submissionPath: '',
      translate,
    });

    expect(resolvedComponents).toHaveLength(1);
    expect(resolvedComponents[0]).toMatchObject({
      key: 'firstName',
      type: 'textField',
      value: 'Ada',
    });
  });
});
