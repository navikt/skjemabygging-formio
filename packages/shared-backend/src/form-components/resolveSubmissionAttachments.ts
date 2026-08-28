import {
  attachmentUtils,
  Component,
  Form,
  Submission,
  SubmissionAttachment,
  submissionUtils,
} from '@navikt/skjemadigitalisering-shared-domain';

const collectAttachmentsFromData = (
  components: Component[],
  submission: Submission,
  parentSubmissionPath = '',
): SubmissionAttachment[] =>
  components.flatMap((component) => {
    const submissionPath =
      component.type === 'attachment'
        ? [parentSubmissionPath, component.key].filter(Boolean).join('.')
        : submissionUtils.getComponentSubmissionPath(component, parentSubmissionPath);

    if (component.type === 'attachment') {
      return attachmentUtils.toSubmissionAttachments(
        submissionUtils.getSubmissionValue(submissionPath, submission),
        component,
      );
    }

    if (!component.components?.length) {
      return [];
    }

    if (component.type === 'datagrid') {
      const rows = submissionUtils.getSubmissionValue(submissionPath, submission);
      return Array.isArray(rows)
        ? rows.flatMap((_, index) =>
            collectAttachmentsFromData(component.components ?? [], submission, `${submissionPath}[${index}]`),
          )
        : [];
    }

    return collectAttachmentsFromData(component.components, submission, submissionPath);
  });

const resolveSubmissionAttachments = (form: Form, submission: Submission): SubmissionAttachment[] => {
  const dataAttachments = collectAttachmentsFromData(form.components, submission);
  const dataAttachmentNavIds = new Set(dataAttachments.map((attachment) => attachment.navId));
  const legacyAttachments = submission.attachments ?? [];

  return [
    ...legacyAttachments.filter((attachment) => attachment.type === 'personal-id'),
    ...dataAttachments,
    ...legacyAttachments.filter(
      (attachment) => attachment.type !== 'personal-id' && !dataAttachmentNavIds.has(attachment.navId),
    ),
  ];
};

const withResolvedSubmissionAttachments = (form: Form, submission: Submission): Submission => ({
  ...submission,
  attachments: resolveSubmissionAttachments(form, submission),
});

export { collectAttachmentsFromData, resolveSubmissionAttachments, withResolvedSubmissionAttachments };
