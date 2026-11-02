import { convertToSendinnPaperForm, Form, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { toNavUnitValidation } from '../../components/nav-unit-select/navUnitValidation';
import {
  enrichFormWithBaseSubmissionPath,
  getActivePanels,
  toComponentDefinitions,
} from '../../context/form-definition/formDefinitionUtils';
import { applyInitialValuesToSubmission } from '../../context/form-definition/initialSubmissionValues';
import { collectPageValidationFields } from '../../form-components/page-validation/collectPageValidationFields';
import { validateValue } from '../../validation/validators';

const source: Form = {
  title: 'Journey validation',
  path: 'journeyvalidation',
  skjemanummer: 'NAV test',
  properties: {
    skjemanummer: 'NAV test',
    tema: 'HJE',
    submissionTypes: ['DIGITAL'],
    subsequentSubmissionTypes: ['PAPER'],
  },
  components: [
    {
      type: 'panel',
      key: 'source',
      label: 'Documents',
      components: [
        {
          type: 'attachment',
          key: 'other',
          label: 'Other document',
          input: true,
          attachmentType: 'other',
        },
      ],
    },
  ],
};

const createForm = (properties: Partial<Form['properties']> = {}) =>
  enrichFormWithBaseSubmissionPath(
    convertToSendinnPaperForm(
      { ...source, properties: { ...source.properties, ...properties } },
      { attachmentFilter: [] },
    ),
  );
const fields = (form: Form, submission: Submission) =>
  getActivePanels(form, submission, { submissionMethod: 'paper' }).flatMap((panel) =>
    collectPageValidationFields({
      components: toComponentDefinitions(panel.components),
      form,
      submission,
      submissionMethod: 'paper',
      currentLanguage: 'nb',
    }),
  );
const invalidPaths = (form: Form, submission: Submission) =>
  fields(form, submission)
    .filter((field) => validateValue(field.value, field.field, field.rules, 'nb'))
    .map((field) => field.statePath);

describe('Sendinn generated journey validation', () => {
  it('rebuilds the same required Nav unit field as the visible control on an unvisited page', () => {
    const form = createForm({ enhetMaVelgesVedPapirInnsending: true });
    const field = fields(form, { data: {} })[0];
    expect(field).toMatchObject({
      statePath: 'navUnit',
      field: toNavUnitValidation({ statePath: 'navUnit', label: field.field, required: true }).field,
      rules: toNavUnitValidation({ statePath: 'navUnit', label: field.field, required: true }).rules,
    });
    expect(invalidPaths(form, { data: {} })).toEqual(['navUnit']);
    expect(invalidPaths(form, { data: { navUnit: '0101' } })).toEqual([]);
  });

  it('validates only the active collection branch, including conditional Nav contact', () => {
    const form = createForm();
    expect(invalidPaths(form, { data: {} })).toEqual(['collectionType']);
    expect(invalidPaths(form, { data: { collectionType: 'multiple-people' } })).toEqual(['navUnit']);
    expect(invalidPaths(form, { data: { collectionType: 'identified-person' } })).toEqual([
      'yourInformation.identitet.identitetsnummer',
    ]);
    expect(invalidPaths(form, { data: { collectionType: 'unidentified-person', hasNavContact: 'ja' } })).toEqual(
      expect.arrayContaining(['yourInformation.fornavn', 'yourInformation.etternavn', 'navContactUnit']),
    );
    expect(invalidPaths(form, { data: { collectionType: 'unidentified-person', hasNavContact: 'nei' } })).not.toContain(
      'navContactUnit',
    );
  });

  it('uses shared hidden-value cleanup when a branch changes', () => {
    const form = createForm();
    const result = applyInitialValuesToSubmission(
      form,
      {
        data: {
          collectionType: 'multiple-people',
          yourInformation: { identitet: { identitetsnummer: '03876399856' }, fornavn: 'Test' },
          hasNavContact: 'ja',
          navContactUnit: '0202',
          navUnit: '0101',
        },
      },
      'nb',
      { submissionMethod: 'paper' },
    );
    expect(result?.data).toMatchObject({ collectionType: 'multiple-people', navUnit: '0101' });
    expect(result?.data).not.toHaveProperty('yourInformation');
    expect(result?.data).not.toHaveProperty('hasNavContact');
    expect(result?.data).not.toHaveProperty('navContactUnit');
  });

  it('allows zero selected documents but validates an other-document title after selection', () => {
    const form = createForm({ hideUserTypes: true });
    expect(invalidPaths(form, { data: {} })).toEqual([]);
    const selected: Submission = {
      data: {
        sendinnAttachment1: {
          other: [
            {
              attachmentId: 'other',
              navId: 'other',
              type: 'other',
              value: 'leggerVedNaa',
            },
          ],
        },
      },
    };
    expect(invalidPaths(form, selected)).toEqual(['sendinnAttachment1.other.other.title']);
  });
});
