import { SubmissionAttachment } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import prepareSubmissionForTransport from './prepareSubmissionForTransport';

describe('prepareSubmissionForTransport', () => {
  it('removes renderer state and empty structures while preserving submission content', () => {
    expect(
      prepareSubmissionForTransport({
        data: {
          emptyArray: [],
          emptyObject: {},
          nullValue: null as unknown as object,
          value: 'text',
        },
        attachments: [],
        fyllutState: { mellomlagring: { isActive: true } },
      }),
    ).toEqual({
      data: {
        nullValue: null,
        value: 'text',
      },
      attachments: [],
    });
  });

  it('preserves attachments when form data is empty', () => {
    const attachments: SubmissionAttachment[] = [
      {
        attachmentId: 'attachment-1',
        navId: 'attachment-1',
        type: 'other',
        value: 'leggerVedNaa',
        title: 'Documentation',
        files: [
          {
            attachmentId: 'attachment-1',
            innsendingId: 'draft-1',
            fileId: 'file-1',
            fileName: 'small-file.txt',
            size: 10,
          },
        ],
      },
    ];

    expect(
      prepareSubmissionForTransport({
        data: {},
        attachments,
        fyllutState: { mellomlagring: { isActive: true } },
      }),
    ).toEqual({ data: {}, attachments });
  });
});
