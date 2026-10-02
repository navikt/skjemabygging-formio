import { Component, NavFormType, Submission, SubmissionAttachment } from '../../models';
import { navFormUtils } from '../form';
import { submissionUtils } from '../submission/submissionUtils';

const isSubmissionAttachment = (value: unknown): value is SubmissionAttachment =>
  typeof value === 'object' && value !== null && 'attachmentId' in value && typeof value.attachmentId === 'string';

const isStructuredAttachmentValue = (value: unknown): boolean =>
  isSubmissionAttachment(value) || (Array.isArray(value) && value.some(isSubmissionAttachment));

const getAttachmentValue = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    return value;
  }
  if (!value || typeof value !== 'object') {
    return undefined;
  }
  if ('key' in value && typeof value.key === 'string') {
    return value.key;
  }
  return 'value' in value && typeof value.value === 'string' ? value.value : undefined;
};

const getAdditionalDocumentation = (value: unknown): string | undefined =>
  value &&
  typeof value === 'object' &&
  'additionalDocumentation' in value &&
  typeof value.additionalDocumentation === 'string'
    ? value.additionalDocumentation
    : undefined;

const toSubmissionAttachments = (value: unknown, component: Component): SubmissionAttachment[] => {
  if (Array.isArray(value)) {
    return value.filter(isSubmissionAttachment);
  }
  if (isSubmissionAttachment(value)) {
    return [value];
  }

  const attachmentValue = getAttachmentValue(value);
  const navId = navFormUtils.getNavId(component) ?? component.key;
  if (!attachmentValue || !navId) {
    return [];
  }

  const additionalDocumentation = getAdditionalDocumentation(value);
  return [
    {
      attachmentId: navId,
      navId,
      type: component.attachmentType || (component.otherDocumentation ? 'other' : 'default'),
      value: attachmentValue,
      ...(additionalDocumentation ? { additionalDocumentation } : {}),
      files: [],
    },
  ];
};

const getTopLevelAttachmentsAtPath = (
  component: Component,
  submissionPath: string,
  attachments: SubmissionAttachment[],
): SubmissionAttachment[] => {
  const navId = navFormUtils.getNavId(component) ?? component.key;
  const rowAttachmentId = `${navId}-${submissionPath.replace(/[^a-zA-Z0-9_-]+/g, '-')}`;
  return attachments.filter((attachment) => {
    if (attachment.navId !== navId) {
      return false;
    }
    // A shared navId cannot identify a datagrid row. Never borrow another row's answer.
    return (
      !submissionPath.includes('[') ||
      attachment.attachmentId === rowAttachmentId ||
      (attachment.attachmentId.startsWith(`${rowAttachmentId}-`) &&
        /^\d+$/.test(attachment.attachmentId.slice(rowAttachmentId.length + 1)))
    );
  });
};

const resolveAttachmentsAtPath = (
  component: Component,
  submissionPath: string,
  submission: Submission | undefined,
): { attachments: SubmissionAttachment[]; source: 'data' | 'top-level' } => {
  const value = submissionUtils.getSubmissionValue(submissionPath, submission);
  const dataAttachments = toSubmissionAttachments(value, component);
  const topLevelAttachments = getTopLevelAttachmentsAtPath(component, submissionPath, submission?.attachments ?? []);

  // Canonical records win even without a choice. For primitive answers, the presence
  // of a legacy record is authoritative; an empty choice must not revive stale data.
  if (!isStructuredAttachmentValue(value) && topLevelAttachments.length > 0) {
    return { attachments: topLevelAttachments, source: 'top-level' };
  }
  return { attachments: dataAttachments, source: 'data' };
};

interface CollectedDataAttachments {
  component: Component;
  submissionPath: string;
  attachments: SubmissionAttachment[];
  structured: boolean;
}

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
      const attachments = toSubmissionAttachments(value, component);
      return attachments.length > 0
        ? [{ component, submissionPath, attachments, structured: isStructuredAttachmentValue(value) }]
        : [];
    }
    if (!component.components?.length) {
      return [];
    }
    if (component.type === 'datagrid') {
      const rows = submissionUtils.getSubmissionValue(submissionPath, submission);
      return Array.isArray(rows)
        ? rows.flatMap((_row, index) =>
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

const resolveSubmissionAttachments = (
  form: Pick<NavFormType, 'components'>,
  submission: Submission,
): SubmissionAttachment[] => {
  const dataAttachments = collectDataAttachments(form.components as Component[], submission);
  const topLevelAttachments = submission.attachments ?? [];
  const structuredAttachments = dataAttachments
    .filter(({ structured }) => structured)
    .flatMap(({ attachments }) => attachments);
  const structuredNavIds = new Set(structuredAttachments.map((attachment) => attachment.navId));
  // Preserve normalization's canonical-data priority: obsolete top-level records for
  // this component must not reintroduce files removed by the new editor.
  const legacyAttachments = topLevelAttachments.filter(
    (attachment) => attachment.type !== 'personal-id' && !structuredNavIds.has(attachment.navId),
  );
  const choiceOnlyAttachments = dataAttachments
    .filter(
      ({ structured, component, submissionPath }) =>
        !structured && getTopLevelAttachmentsAtPath(component, submissionPath, legacyAttachments).length === 0,
    )
    .flatMap(({ attachments }) => attachments);

  return [
    ...topLevelAttachments.filter((attachment) => attachment.type === 'personal-id'),
    ...structuredAttachments,
    ...choiceOnlyAttachments,
    ...legacyAttachments,
  ];
};

export {
  collectAttachmentsFromData,
  getAdditionalDocumentation,
  getAttachmentValue,
  resolveAttachmentsAtPath,
  resolveSubmissionAttachments,
  toSubmissionAttachments,
};
