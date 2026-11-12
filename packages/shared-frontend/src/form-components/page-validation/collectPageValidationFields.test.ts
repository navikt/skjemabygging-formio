import { Component, Form, SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import {
  enrichFormWithBaseSubmissionPath,
  toComponentDefinitions,
} from '../../context/form-definition/formDefinitionUtils';
import { collectPageValidationFields } from './collectPageValidationFields';

const firstName: Component = {
  key: 'fornavn',
  label: 'Fornavn',
  type: 'firstName',
  input: true,
  prefillKey: 'sokerFornavn',
  validate: { required: true },
};

const form: Form = enrichFormWithBaseSubmissionPath({
  title: 'Prefill',
  path: 'prefill',
  skjemanummer: 'prefill',
  properties: {
    skjemanummer: 'prefill',
    tema: 'BIL',
    submissionTypes: ['PAPER', 'DIGITAL'],
    subsequentSubmissionTypes: [],
  },
  components: [{ key: 'page', label: 'Page', type: 'panel', components: [firstName] }],
});

const collect = (submissionMethod: SubmissionMethod) =>
  collectPageValidationFields({
    components: toComponentDefinitions(form.components[0].components),
    form,
    submission: { data: {} },
    submissionMethod,
    currentLanguage: 'nb',
  });

describe('collectPageValidationFields', () => {
  it('collects no fields for a field locked by prefill, even when prefill left it empty', () => {
    expect(collect('digital')).toEqual([]);
  });

  it('validates a field with a prefillKey when prefill does not lock it', () => {
    expect(collect('paper')).toMatchObject([{ statePath: 'fornavn', rules: { required: true } }]);
  });
});
