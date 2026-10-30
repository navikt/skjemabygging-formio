import { convertToSendinnPaperForm, Form, Submission, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { toNavUnitValidation } from '../../components/nav-unit-select/navUnitValidation';
import {
  enrichFormWithBaseSubmissionPath,
  getActivePanels,
  toComponentDefinitions,
} from '../../context/form-definition/formDefinitionUtils';
import { applyInitialValuesToSubmission } from '../../context/form-definition/initialSubmissionValues';
import { collectPageValidationFields } from '../../form-components/page-validation/collectPageValidationFields';
import { validateValue } from '../../validation/validators';
import { collectSendinnAttachmentValidationFields } from './sendinnAttachmentValidation';

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
    panel.key === 'sendinnAttachments'
      ? collectSendinnAttachmentValidationFields({ form, submission, currentLanguage: 'nb' })
      : collectPageValidationFields({
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
const invalidCollectionPaths = (form: Form, data: Submission['data']) =>
  invalidPaths(form, {
    data: {
      ...data,
      sendinnAttachment1: {
        other: [{ attachmentId: 'other', navId: 'other', type: 'other', value: 'leggerVedNaa', title: 'Extra' }],
      },
    },
  });

describe('Sendinn generated journey validation', () => {
  it('rebuilds the same required Nav unit field as the visible control on an unvisited page', () => {
    const form = createForm({ enhetMaVelgesVedPapirInnsending: true });
    const field = fields(form, { data: {} })[0];
    expect(field).toMatchObject({
      statePath: 'navUnit',
      field: toNavUnitValidation({ statePath: 'navUnit', label: field.field, required: true }).field,
      rules: toNavUnitValidation({ statePath: 'navUnit', label: field.field, required: true }).rules,
    });
    expect(invalidCollectionPaths(form, {})).toEqual(['navUnit']);
    expect(invalidCollectionPaths(form, { navUnit: '0101' })).toEqual([]);
  });

  it('validates only the active collection branch, including conditional Nav contact', () => {
    const form = createForm();
    expect(invalidCollectionPaths(form, {})).toEqual(['collectionType']);
    expect(invalidCollectionPaths(form, { collectionType: 'multiple-people' })).toEqual(['navUnit']);
    expect(invalidCollectionPaths(form, { collectionType: 'identified-person' })).toEqual([
      'yourInformation.identitet.identitetsnummer',
    ]);
    expect(invalidCollectionPaths(form, { collectionType: 'unidentified-person', hasNavContact: 'ja' })).toEqual(
      expect.arrayContaining(['yourInformation.fornavn', 'yourInformation.etternavn', 'navContactUnit']),
    );
    expect(invalidCollectionPaths(form, { collectionType: 'unidentified-person', hasNavContact: 'nei' })).not.toContain(
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

  it('requires a selection on an unvisited page and retains other-document title validation without duplicate paths', () => {
    const form = createForm({ hideUserTypes: true });
    expect(invalidPaths(form, { data: {} })).toEqual(['sendinnAttachment1.other.value']);
    const empty = fields(form, { data: {} })[0];
    expect(validateValue(empty.value, empty.field, empty.rules)).toMatchObject({
      textKey: TEXTS.statiske.sendinn.selectAttachment,
    });
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
    const selectedFields = fields(form, selected);
    expect(new Set(selectedFields.map(({ statePath }) => statePath)).size).toBe(selectedFields.length);
    Object.assign(selected.data.sendinnAttachment1, {
      other: [{ attachmentId: 'other', navId: 'other', type: 'other', value: 'leggerVedNaa', title: 'a'.repeat(51) }],
    });
    expect(invalidPaths(form, selected)).toEqual(['sendinnAttachment1.other.other.title']);
  });

  it('anchors to the first available choice after filtering and ignores stale selections from the former definition', () => {
    const form = enrichFormWithBaseSubmissionPath(
      convertToSendinnPaperForm(
        {
          ...source,
          properties: { ...source.properties, hideUserTypes: true },
          components: [
            { type: 'attachment', key: 'first', label: 'First', properties: { vedleggskode: 'N1' } },
            { type: 'attachment', key: 'second', label: 'Second', properties: { vedleggskode: 'N2' } },
            { type: 'attachment', key: 'third', label: 'Third', properties: { vedleggskode: 'N3' } },
          ],
        },
        { attachmentFilter: ['N2', 'N3'] },
      ),
    );
    const submission: Submission = {
      data: { sendinnAttachment1: { first: { attachmentId: 'first', navId: 'first', value: 'leggerVedNaa' } } },
    };
    expect(invalidPaths(form, submission)).toEqual(['sendinnAttachment2.second.value']);
    submission.data.sendinnAttachment3 = {
      third: { attachmentId: 'third', navId: 'third', value: 'leggerVedNaa' },
    };
    expect(invalidPaths(form, submission)).toEqual([]);
    expect(submission.data).not.toHaveProperty('sendinnAttachment2');
    const emptyForm = { ...form, components: [] };
    expect(collectSendinnAttachmentValidationFields({ form: emptyForm, submission, currentLanguage: 'nb' })).toEqual(
      [],
    );
  });
});
