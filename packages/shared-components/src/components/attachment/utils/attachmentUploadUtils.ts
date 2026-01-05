import { AttachmentSettingValues, SubmissionAttachment } from '@navikt/skjemadigitalisering-shared-domain';

const findAttachmentByComponentId = (submissionAttachments: SubmissionAttachment[], componentId: string) =>
  submissionAttachments.find((attachment) => attachment.attachmentId.startsWith(componentId));

const findAttachmentByAttachmentId = (submissionAttachments: SubmissionAttachment[], attachmentId: string) =>
  submissionAttachments.find((attachment) => attachment.attachmentId === attachmentId);

const filterAttachmentsByComponentId = (submissionAttachments: SubmissionAttachment[], componentId: string) =>
  submissionAttachments.filter((attachment) => attachment.attachmentId.startsWith(componentId));

const getLargestAttachmentIdCounter = (attachments: SubmissionAttachment[]): number =>
  Math.max(0, ...attachments.map((attachment) => parseInt(attachment.attachmentId.split('-')[1] ?? 0)));

const getDefaultOtherAttachment = (
  componentId: string,
  value?: keyof AttachmentSettingValues,
): SubmissionAttachment => ({
  attachmentId: componentId,
  navId: componentId,
  type: 'other',
  ...(value ? { value } : {}),
});

export {
  filterAttachmentsByComponentId,
  findAttachmentByAttachmentId,
  findAttachmentByComponentId,
  getDefaultOtherAttachment,
  getLargestAttachmentIdCounter,
};
