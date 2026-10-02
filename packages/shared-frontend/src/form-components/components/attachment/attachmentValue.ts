import { attachmentUtils, Component, SubmissionAttachment } from '@navikt/skjemadigitalisering-shared-domain';
import { createAttachmentId, isSubmissionAttachment } from '../../../context/attachment/attachmentData';

const normalizeAttachmentValue = (
  component: Component,
  statePath: string,
  value: unknown,
): SubmissionAttachment | SubmissionAttachment[] | undefined => {
  if (value === undefined) return undefined;
  const attachments = attachmentUtils.toSubmissionAttachments(value, component).map((attachment) =>
    isSubmissionAttachment(value) || Array.isArray(value)
      ? attachment
      : {
          ...attachment,
          attachmentId: createAttachmentId(attachment.navId, statePath),
        },
  );
  return component.attachmentType === 'other' || component.otherDocumentation ? attachments : attachments[0];
};

export { normalizeAttachmentValue };
