import { Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import { ComponentDefinition } from '../../form-components/component-types';
import { inputId } from '../../utils/inputId';
import { createAttachmentId } from '../attachment/attachmentData';
import { attachmentValidationPath } from './attachmentValidationPath';
import { createPageErrorCalculator } from './validationErrors';

const translate = (text: string) => text;

const createCalculator = (externalAttachmentErrors = {}) =>
  createPageErrorCalculator({
    allowTestTypes: true,
    currentLanguage: 'nb',
    externalAttachmentErrors,
    submissionMethod: 'digital',
    translate: translate as never,
  });

const attachmentComponent = {
  key: 'dokumentasjon',
  navId: 'vedleggNavId',
  label: 'Dokumentasjon',
  input: true,
  type: 'attachment',
  attachmentType: 'other',
  validate: { required: true },
} as unknown as ComponentDefinition;

const dataGridWithAttachment = {
  key: 'reiser',
  label: 'Reiser',
  type: 'datagrid',
  input: true,
  tree: true,
  navId: 'grid',
  components: [attachmentComponent],
} as unknown as ComponentDefinition;

describe('attachment validation paths', () => {
  it('uses the same path for the attachment choice error and the choice control', () => {
    const submission: Submission = { data: {} };

    const errors = createCalculator()('attachments', [attachmentComponent], submission);

    expect(errors.map(({ submissionPath }) => submissionPath)).toEqual([
      attachmentValidationPath('vedleggNavId', 'value'),
    ]);
    expect(inputId(errors[0].submissionPath)).toBe('input-attachments-vedleggNavId-value');
  });

  it('uses the row unique attachment id for attachments inside a data grid', () => {
    const submission: Submission = { data: { reiser: [{}, {}] } };
    const expectedRowAttachmentId = createAttachmentId('vedleggNavId', 'reiser[1].dokumentasjon');

    const errors = createCalculator()('attachments', [dataGridWithAttachment], submission);

    expect(errors.map(({ submissionPath }) => submissionPath)).toEqual([
      attachmentValidationPath(createAttachmentId('vedleggNavId', 'reiser[0].dokumentasjon'), 'value'),
      attachmentValidationPath(expectedRowAttachmentId, 'value'),
    ]);
    expect(errors[1].submissionPath).not.toBe(errors[0].submissionPath);
  });

  it('reports a missing file on the path used by the upload control', () => {
    const attachmentId = createAttachmentId('vedleggNavId', 'dokumentasjon');
    const submission: Submission = {
      data: {
        dokumentasjon: [{ attachmentId, navId: 'vedleggNavId', type: 'other', value: 'leggerVedNaa', files: [] }],
      },
    };

    const errors = createCalculator()('attachments', [attachmentComponent], submission);

    expect(errors.map(({ submissionPath }) => submissionPath)).toEqual([
      attachmentValidationPath(attachmentId, 'files'),
    ]);
  });

  it('keeps external upload errors on the title path of the same attachment id', () => {
    const attachmentId = createAttachmentId('vedleggNavId', 'reiser[0].dokumentasjon');
    const submission: Submission = { data: { reiser: [{}] } };

    const errors = createCalculator({
      [attachmentValidationPath(attachmentId, 'title')]: {
        attachmentId,
        field: 'title' as const,
        message: 'Du må fylle ut: Tittel',
      },
    })('attachments', [dataGridWithAttachment], submission);

    expect(errors.map(({ submissionPath }) => submissionPath)).toContain(
      attachmentValidationPath(attachmentId, 'title'),
    );
  });
});
