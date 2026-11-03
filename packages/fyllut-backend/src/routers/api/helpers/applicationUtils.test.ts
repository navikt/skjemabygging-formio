import { errorHandler } from '@navikt/skjemadigitalisering-shared-backend';
import { Form, Submission, SubmissionAttachment } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it, vi } from 'vitest';
import legacyErrorToResponseError from '../../../middleware/legacyErrorToResponseError';
import { mockRequest, mockResponse } from '../../../test/testHelpers';
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
    fodselsnummerDNummerSoker: '12345678911',
    fornavnAvsender: 'Ola',
    etternavnAvsender: 'Nordmann',
  },
  attachments: [attachment],
});

describe('assembleSubmitApplicationRequest', () => {
  const createDigitalAccessForm = (grantUserDigitalAccess?: boolean): Form => ({
    ...form,
    components: [],
    properties: {
      ...form.properties,
      ...(grantUserDigitalAccess !== undefined && { grantUserDigitalAccess }),
    },
  });

  const submission = { data: { fodselsnummerDNummerSoker: '12345678911' } } as Submission;

  it.each(['digital', 'digitalnologin'] as const)(
    'preserves a specific missing-party diagnostic through error handling for %s without exposing submission values',
    (submissionMethod) => {
      const request = mockRequest({});
      const response = mockResponse();
      response.contentType.mockReturnThis();
      response.status.mockReturnThis();
      const next = vi.fn();
      let submissionError: unknown;

      try {
        assembleSubmitApplicationRequest(
          'submission-1',
          {
            ...form,
            components: [{ key: 'identitet', type: 'identity', input: true }],
          } as Form,
          {
            data: {
              firstName: 'private-first-name',
              lastName: 'private-last-name',
              identitet: { identitetsnummer: '12345678911' },
            },
          },
          'nb',
          [],
          (text) => text,
          submissionMethod,
        );
      } catch (error) {
        submissionError = error;
      }

      expect(submissionError).toBeInstanceOf(Error);
      legacyErrorToResponseError(submissionError, request, response, next);
      errorHandler(next.mock.calls[0][0], request, response, vi.fn());

      expect(response.send).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          message: 'Cannot submit application: no user or sender could be resolved (formPath=application)',
          errorCode: 'INTERNAL_SERVER_ERROR',
          userMessage: 'Det oppstod en feil',
        }),
      );
      expect(response.status).toHaveBeenCalledWith(500);
      const errorResponse = JSON.stringify(response.send.mock.calls);
      expect(errorResponse).not.toContain('private-first-name');
      expect(errorResponse).not.toContain('private-last-name');
      expect(errorResponse).not.toContain('12345678911');
    },
  );

  it('includes grantUserDigitalAccess only when the form property is true', () => {
    const request = assembleSubmitApplicationRequest(
      'id',
      createDigitalAccessForm(true),
      submission,
      'nb',
      [],
      (text) => text,
    );

    expect(request).toHaveProperty('grantUserDigitalAccess', true);
  });

  it.each([false, undefined])('omits grantUserDigitalAccess when the form property is %s', (grantUserDigitalAccess) => {
    const request = assembleSubmitApplicationRequest(
      'id',
      createDigitalAccessForm(grantUserDigitalAccess),
      submission,
      'nb',
      [],
      (text) => text,
    );

    expect(request).not.toHaveProperty('grantUserDigitalAccess');
  });

  it('includes language, form revision and submission in mainDocumentAlt', () => {
    const request = assembleSubmitApplicationRequest(
      'id',
      { ...createDigitalAccessForm(), revision: 38 },
      submission,
      'nb',
      [],
      (text) => text,
    );

    expect(JSON.parse(Buffer.from(request.mainDocumentAlt, 'base64').toString('utf-8'))).toEqual({
      language: 'nb',
      formRevision: 38,
      data: submission,
    });
  });

  it.each([
    ['leggerVedNaa', 'ettersender', 'SendSenere'],
    ['ettersender', 'leggerVedNaa', 'LastetOpp'],
    ['leggerVedNaa', '', 'IkkeValgt'],
    ['leggerVedNaa', undefined, 'IkkeValgt'],
  ])('uses the authoritative legacy choice %s -> %s in outgoing metadata', (dataValue, value, uploadStatus) => {
    const legacy: SubmissionAttachment = {
      attachmentId: 'legacy-attachment-id',
      navId: 'legacy-attachment-id',
      type: 'default',
      value,
      files: [],
    };
    for (const answer of [dataValue, { key: dataValue }]) {
      const submission = createSubmission(legacy);
      submission.data.documentation = answer;
      const request = assembleSubmitApplicationRequest('submission-1', form, submission, 'nb', [1], (text) => text);
      expect(request.attachments).toEqual([
        {
          attachmentCode: 'V1',
          label: 'Documentation',
          title: 'Documentation title',
          uploadStatus,
          fileIds: [],
          description: null,
          formNumberPath: undefined,
        },
      ]);
    }
  });

  it.each([
    ['nei', 'SendesIkke'],
    ['', 'IkkeValgt'],
    [undefined, 'IkkeValgt'],
  ])('does not send obsolete legacy files for canonical choice %s', (value, uploadStatus) => {
    const canonical: SubmissionAttachment = {
      attachmentId: 'canonical',
      navId: 'legacy-attachment-id',
      type: 'default',
      value,
      files: [],
    };
    const legacy: SubmissionAttachment = {
      ...canonical,
      attachmentId: 'legacy-attachment-id',
      value: 'leggerVedNaa',
      files: [
        {
          attachmentId: 'legacy-attachment-id',
          innsendingId: 'submission-1',
          fileId: 'obsolete-file',
          fileName: 'obsolete.pdf',
          size: 123,
        },
      ],
    };
    const submission = createSubmission(legacy);
    submission.data.documentation = canonical;
    const request = assembleSubmitApplicationRequest('submission-1', form, submission, 'nb', [1], (text) => text);
    expect(request.attachments).toHaveLength(1);
    expect(request.attachments[0]).toMatchObject({ uploadStatus, fileIds: [] });
  });

  it('retains a second row choice when only the first row has an authoritative legacy record', () => {
    const rowForm = {
      ...form,
      components: [
        {
          ...form.components[0],
          components: [{ key: 'rows', type: 'datagrid', input: true, components: [attachmentComponent] }],
        },
      ],
    } as Form;
    const legacy: SubmissionAttachment = {
      attachmentId: 'legacy-attachment-id-rows-0-documentation',
      navId: 'legacy-attachment-id',
      type: 'default',
      value: 'ettersender',
      files: [],
    };
    const submission: Submission = {
      data: {
        fodselsnummerDNummerSoker: '12345678911',
        fornavnAvsender: 'Ola',
        etternavnAvsender: 'Nordmann',
        rows: [{ documentation: 'leggerVedNaa' }, { documentation: 'leggerVedNaa' }, {}],
      },
      attachments: [legacy],
    };
    const request = assembleSubmitApplicationRequest('submission-1', rowForm, submission, 'nb', [1], (text) => text);
    expect(request.attachments.map(({ uploadStatus }) => uploadStatus)).toEqual(['LastetOpp', 'SendSenere']);
  });

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

  it('evaluates submission method conditionals with the given submission method', () => {
    const digitalOnlyForm = {
      ...form,
      properties: { ...form.properties, submissionTypes: ['PAPER', 'DIGITAL'] },
      components: [
        {
          key: 'application',
          label: 'Application',
          type: 'panel',
          components: [{ ...attachmentComponent, customConditional: 'show = instance.isSubmissionDigital();' }],
        },
      ],
    } as Form;
    const attachment: SubmissionAttachment = {
      attachmentId: 'legacy-attachment-id',
      navId: 'legacy-attachment-id',
      type: 'default',
      value: 'leggerVedNaa',
      files: [],
    };
    const assemble = (method?: 'digital' | 'paper') =>
      assembleSubmitApplicationRequest(
        'submission-1',
        digitalOnlyForm,
        createSubmission(attachment),
        'nb',
        [1],
        (text) => text,
        method,
      );

    expect(assemble('digital').attachments).toHaveLength(1);
    expect(assemble('paper').attachments).toHaveLength(0);
  });
});
