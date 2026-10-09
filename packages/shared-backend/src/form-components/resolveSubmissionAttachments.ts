import { attachmentUtils, Form, Submission } from '@navikt/skjemadigitalisering-shared-domain';

const { collectAttachmentsFromData, resolveSubmissionAttachments } = attachmentUtils;

const withResolvedSubmissionAttachments = (form: Form, submission: Submission): Submission => ({
  ...submission,
  attachments: resolveSubmissionAttachments(form, submission),
});

export { collectAttachmentsFromData, resolveSubmissionAttachments, withResolvedSubmissionAttachments };
