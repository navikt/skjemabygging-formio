import {
  attachmentUtils,
  Component,
  Form,
  Submission,
  SubmissionAttachment,
  submissionUtils,
} from '@navikt/skjemadigitalisering-shared-domain';

interface CollectedDataAttachments {
  attachments: SubmissionAttachment[];
  source: 'structured' | 'choice-only';
}

const isSubmissionAttachment = (value: unknown): value is SubmissionAttachment =>
  typeof value === 'object' && value !== null && 'attachmentId' in value && typeof value.attachmentId === 'string';

const isStructuredAttachmentValue = (value: unknown): boolean =>
  isSubmissionAttachment(value) || (Array.isArray(value) && value.some(isSubmissionAttachment));

const collectDataAttachments = (
  components: Component[],
  submission: Submission,
  parentSubmissionPath = '',
): CollectedDataAttachments[] =>
  components.flatMap((component) => {
    const submissionPath =
      component.type === 'attachment'
        ? [parentSubmissionPath, component.key].filter(Boolean).join('.')
        : submissionUtils.getComponentSubmissionPath(component, parentSubmissionPath);

    if (component.type === 'attachment') {
      const value = submissionUtils.getSubmissionValue(submissionPath, submission);
      const attachments = attachmentUtils.toSubmissionAttachments(value, component);
      const source = isStructuredAttachmentValue(value) ? 'structured' : 'choice-only';
      return attachments.length > 0 ? [{ attachments, source }] : [];
    }

    if (!component.components?.length) {
      return [];
    }

    if (component.type === 'datagrid') {
      const rows = submissionUtils.getSubmissionValue(submissionPath, submission);
      return Array.isArray(rows)
        ? rows.flatMap((_, index) =>
            collectDataAttachments(component.components ?? [], submission, `${submissionPath}[${index}]`),
          )
        : [];
    }

    return collectDataAttachments(component.components, submission, submissionPath);
  });

const collectAttachmentsFromData = (
  components: Component[],
  submission: Submission,
  parentSubmissionPath = '',
): SubmissionAttachment[] =>
  collectDataAttachments(components, submission, parentSubmissionPath).flatMap(({ attachments }) => attachments);

const resolveSubmissionAttachments = (form: Form, submission: Submission): SubmissionAttachment[] => {
  const dataAttachments = collectDataAttachments(form.components, submission);
  const topLevelAttachments = submission.attachments ?? [];
  const topLevelAttachmentNavIds = new Set(topLevelAttachments.map((attachment) => attachment.navId));
  const structuredAttachments = dataAttachments
    .filter(({ source }) => source === 'structured')
    .flatMap(({ attachments }) => attachments);
  const structuredAttachmentNavIds = new Set(structuredAttachments.map((attachment) => attachment.navId));

  const choiceOnlyAttachmentsWithoutTopLevelMatch = dataAttachments
    .filter(({ source }) => source === 'choice-only')
    .flatMap(({ attachments }) => attachments.filter((attachment) => !topLevelAttachmentNavIds.has(attachment.navId)));

  return [
    ...topLevelAttachments.filter((attachment) => attachment.type === 'personal-id'),
    ...structuredAttachments,
    ...choiceOnlyAttachmentsWithoutTopLevelMatch,
    // Compatibility for drafts created while complete attachments were stored at the top level.
    // A canonical answer takes precedence over legacy files not shown by the editor or summary.
    // Remove non-personal-ID fallback after those drafts can no longer be resumed or submitted.
    ...topLevelAttachments.filter(
      (attachment) => attachment.type !== 'personal-id' && !structuredAttachmentNavIds.has(attachment.navId),
    ),
  ];
};

const withResolvedSubmissionAttachments = (form: Form, submission: Submission): Submission => ({
  ...submission,
  attachments: resolveSubmissionAttachments(form, submission),
});

export { collectAttachmentsFromData, resolveSubmissionAttachments, withResolvedSubmissionAttachments };
