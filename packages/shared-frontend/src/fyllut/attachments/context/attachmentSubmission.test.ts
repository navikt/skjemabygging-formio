import { Submission, SubmissionAttachment } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import { createUpdatedSubmission } from '../../../context/state/SubmissionStateContext';
import { createAttachmentSubmissionActions } from './attachmentSubmission';

const attachment: SubmissionAttachment = {
  attachmentId: 'documentation',
  navId: 'documentation',
  type: 'default',
  value: 'leggerVedNaa',
  files: [],
};

const createActions = (initialSubmission: Submission) => {
  let submission = initialSubmission;
  const setSubmission = (nextSubmission: React.SetStateAction<Submission | undefined>) => {
    submission = (typeof nextSubmission === 'function' ? nextSubmission(submission) : nextSubmission) ?? {
      data: {},
    };
  };
  const updateSubmission = (submissionPath: string, value: unknown) => {
    submission = createUpdatedSubmission(submission, submissionPath, value);
  };

  return {
    actions: createAttachmentSubmissionActions(() => submission, setSubmission, updateSubmission),
    getSubmission: () => submission,
  };
};

describe('attachmentSubmission', () => {
  it('updates form attachments through their submission path', () => {
    const { actions, getSubmission } = createActions({ data: {} });

    actions.changeAttachmentValue(attachment, { value: 'leggerVedNaa' }, 'documentation');

    expect(getSubmission()).toEqual({
      data: { documentation: attachment },
    });
  });

  it('keeps personal ID attachments in the top-level compatibility array', () => {
    const personalId: SubmissionAttachment = {
      ...attachment,
      attachmentId: 'personal-id',
      navId: 'personal-id',
      type: 'personal-id',
    };
    const { actions, getSubmission } = createActions({ data: {} });

    actions.changeAttachmentValue(personalId, { value: 'leggerVedNaa' });

    expect(getSubmission()).toEqual({
      data: {},
      attachments: [{ ...personalId, value: 'leggerVedNaa' }],
    });
  });

  it('updates repeated attachments without replacing sibling attachments', () => {
    const secondAttachment: SubmissionAttachment = {
      ...attachment,
      attachmentId: 'documentation-1',
      type: 'other',
      title: 'Second document',
    };
    const uploadedFile = {
      attachmentId: secondAttachment.attachmentId,
      fileId: 'file-1',
      fileName: 'document.pdf',
      innsendingId: 'draft-1',
      size: 1234,
    };
    const { actions, getSubmission } = createActions({
      data: { documentation: [{ ...attachment, type: 'other' }, secondAttachment] },
    });

    actions.addFileToSubmission(uploadedFile, 'documentation', true);

    expect(getSubmission().data.documentation).toEqual([
      { ...attachment, type: 'other' },
      { ...secondAttachment, files: [uploadedFile] },
    ]);
  });
});
