import { SubmissionAttachment } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import { Attachment } from '../../attachment/attachmentsUtil';
import { validateAttachment } from './attachmentValidation';

describe('validateAttachment', () => {
  it('returns an error when a later repeated attachment is invalid', () => {
    const formAttachments = [{ label: 'Other attachments', navId: 'other' }] as Attachment[];
    const submissionAttachments: SubmissionAttachment[] = [
      {
        attachmentId: 'other',
        navId: 'other',
        type: 'other',
        value: 'leggerVedNaa',
        files: [
          {
            fileId: 'file-1',
            attachmentId: 'other',
            innsendingId: 'submission-1',
            fileName: 'first.txt',
            size: 1,
          },
        ],
      },
      {
        attachmentId: 'other-1',
        navId: 'other',
        type: 'other',
        value: 'leggerVedNaa',
        files: [],
      },
    ];
    const validator = {
      validate: (_label: string, attachment?: SubmissionAttachment) =>
        attachment?.value === 'leggerVedNaa' && attachment.files?.length === 0 ? 'File missing' : undefined,
    };

    expect(validateAttachment(formAttachments, submissionAttachments, validator)).toEqual({
      other: 'File missing',
    });
  });
});
