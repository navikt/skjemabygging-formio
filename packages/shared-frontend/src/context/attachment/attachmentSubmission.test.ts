import { FileObject } from '@navikt/ds-react';
import {
  Submission,
  SubmissionAttachment,
  submissionUtils,
  UploadedFile,
} from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import { parseSubmissionPath, setDeepValue } from '../state/stateHelpers';
import { collectStoredAttachments } from './attachmentData';
import { createAttachmentSubmissionActions, standaloneAttachmentsPath } from './attachmentSubmission';
import { MAX_TOTAL_SIZE_ATTACHMENT_FILES_BYTES } from './fileUploadConfig';

const attachment: SubmissionAttachment = {
  attachmentId: 'documentation',
  navId: 'documentation',
  type: 'default',
  value: 'leggerVedNaa',
  files: [],
};

const createActions = (initialSubmission: Submission) => {
  let submission = initialSubmission;
  return {
    actions: createAttachmentSubmissionActions(
      {
        getValue: (path) =>
          path === standaloneAttachmentsPath
            ? submission.attachments
            : submissionUtils.getSubmissionValue(path, submission),
        setValue: (path, value) => {
          submission =
            path === standaloneAttachmentsPath
              ? { ...submission, attachments: value as SubmissionAttachment[] }
              : { ...submission, data: setDeepValue(submission.data, parseSubmissionPath(path), value) };
          return submission;
        },
      },
      () => collectStoredAttachments(submission),
    ),
    getSubmission: () => submission,
  };
};

describe('attachmentSubmission', () => {
  const uploadedFile: UploadedFile = {
    attachmentId: 'documentation',
    fileId: 'file-1',
    fileName: 'document.pdf',
    innsendingId: 'draft',
    size: 123,
  };

  it('ignores an upload completion after the document was removed', () => {
    const { actions, getSubmission } = createActions({ data: { documentation: attachment } });
    actions.removeAttachmentFromSubmission('documentation', 'documentation');
    actions.addFileToSubmission(uploadedFile, 'documentation');
    expect(getSubmission().data.documentation).toBeUndefined();
  });

  it('preserves titles, concurrent uploaded files and updated choice metadata', () => {
    const { actions, getSubmission } = createActions({
      data: { documentation: { ...attachment, title: 'Existing title', additionalDocumentation: 'Explanation' } },
    });
    actions.addFileToSubmission(uploadedFile, 'documentation');
    actions.changeAttachmentValue(attachment, { title: 'Edited title' }, 'documentation');
    actions.addFileToSubmission({ ...uploadedFile, fileId: 'file-2' }, 'documentation');
    actions.removeFileFromSubmission('documentation', 'file-1', 'documentation');
    expect(getSubmission().data.documentation).toEqual({
      ...attachment,
      title: 'Edited title',
      additionalDocumentation: 'Explanation',
      files: [{ ...uploadedFile, fileId: 'file-2' }],
    });
  });

  it('only removes the captured file IDs when other files were uploaded concurrently', () => {
    const { actions, getSubmission } = createActions({
      data: { documentation: { ...attachment, files: [uploadedFile] } },
    });
    actions.addFileToSubmission({ ...uploadedFile, fileId: 'file-2' }, 'documentation');
    actions.removeFilesFromSubmission('documentation', 'documentation', false, ['file-1']);
    expect((getSubmission().data.documentation as SubmissionAttachment).files).toEqual([
      { ...uploadedFile, fileId: 'file-2' },
    ]);
  });

  it('counts all files for the document, including legacy and pending files, without double-counting', () => {
    const file = { file: { size: 10 } } as FileObject;
    const { actions } = createActions({
      data: {
        nested: {
          documentation: {
            ...attachment,
            files: [{ ...uploadedFile, size: MAX_TOTAL_SIZE_ATTACHMENT_FILES_BYTES - 20 }],
          },
        },
      },
      attachments: [
        { ...attachment, files: [{ ...uploadedFile, fileId: 'legacy-file', size: 10 }] },
        { ...attachment, attachmentId: 'personal-id', files: [{ ...uploadedFile, fileId: 'id-file', size: 10 }] },
      ],
    });
    expect(actions.validateTotalAttachmentSize('documentation', file, 'nested.documentation')).toBeUndefined();
    expect(
      actions.validateTotalAttachmentSize('documentation', file, 'nested.documentation', [{ size: 1 } as File]),
    ).toBeDefined();
  });
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
