import { Form, Submission, SubmissionAttachment } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import { assembleSubmitApplicationRequest } from './applicationUtils';

const attachmentComponent = {
  id: 'legacy-attachment-id',
  key: 'documentation',
  label: 'Documentation',
  type: 'attachment',
  input: true,
  attachmentType: 'default',
  properties: {
    vedleggskode: 'V1',
    vedleggstittel: 'Documentation title',
  },
};

const form = {
  title: 'Application',
  path: 'application',
  revision: 1,
  properties: {
    skjemanummer: 'NAV 00-00.00',
    tema: 'GEN',
  },
  components: [
    {
      key: 'application',
      label: 'Application',
      type: 'panel',
      components: [attachmentComponent],
    },
  ],
} as Form;

const createSubmission = (attachment: SubmissionAttachment): Submission => ({
  data: {
    documentation: 'ettersender',
    fornavnAvsender: 'Ola',
    etternavnAvsender: 'Nordmann',
  },
  attachments: [attachment],
});

describe('assembleSubmitApplicationRequest', () => {
  it('preserves the existing external status fallback for arbitrary legacy attachment choices', () => {
    const legacyAttachment: SubmissionAttachment = {
      attachmentId: 'legacy-attachment-id',
      navId: 'legacy-attachment-id',
      type: 'default',
      value: 'neiJegHarIngenEkstraDokumentasjonJegVilLeggeVed',
      files: [],
    };
    const submission = createSubmission(legacyAttachment);
    submission.data.documentation = legacyAttachment;
    submission.attachments = [];
    expect(
      assembleSubmitApplicationRequest('submission-1', form, submission, 'nb', [1], (text) => text).attachments[0]
        .uploadStatus,
    ).toBe('IkkeValgt');
  });
  it('preserves legacy attachment files, title and value when data contains a primitive value', () => {
    const legacyAttachment: SubmissionAttachment = {
      attachmentId: 'legacy-attachment-id',
      navId: 'legacy-attachment-id',
      type: 'default',
      value: 'leggerVedNaa',
      title: 'Uploaded documentation',
      files: [
        {
          fileId: 'file-1',
          attachmentId: 'legacy-attachment-id',
          innsendingId: 'submission-1',
          fileName: 'documentation.pdf',
          size: 123,
        },
      ],
    };

    const request = assembleSubmitApplicationRequest(
      'submission-1',
      form,
      createSubmission(legacyAttachment),
      'nb',
      [1, 2, 3],
      (text) => text,
    );

    expect(request.attachments).toEqual([
      {
        attachmentCode: 'V1',
        label: 'Uploaded documentation',
        title: 'Documentation title',
        uploadStatus: 'LastetOpp',
        fileIds: ['file-1'],
        description: null,
        formNumberPath: undefined,
      },
    ]);
  });

  it('preserves every legacy other attachment sharing the same navId', () => {
    const otherForm = {
      ...form,
      components: [
        {
          key: 'application',
          label: 'Application',
          type: 'panel',
          components: [{ ...attachmentComponent, attachmentType: 'other' }],
        },
      ],
    } as Form;
    const attachments: SubmissionAttachment[] = [
      {
        attachmentId: 'legacy-attachment-id',
        navId: 'legacy-attachment-id',
        type: 'other',
        value: 'leggerVedNaa',
        title: 'First upload',
        files: [],
      },
      {
        attachmentId: 'legacy-attachment-id-1',
        navId: 'legacy-attachment-id',
        type: 'other',
        value: 'leggerVedNaa',
        title: 'Second upload',
        files: [],
      },
    ];

    const request = assembleSubmitApplicationRequest(
      'submission-1',
      otherForm,
      {
        ...createSubmission(attachments[0]),
        attachments,
      },
      'nb',
      [1, 2, 3],
      (text) => text,
    );

    expect(request.attachments.map(({ label }) => label)).toEqual(['First upload', 'Second upload']);
  });
});
