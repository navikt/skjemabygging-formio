import {
  attachmentUtils,
  Form,
  getNavId,
  Submission,
  SubmissionAttachment,
  submissionUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import {
  allocateAttachmentIds,
  collectStoredAttachments,
  createAttachmentId,
  isSubmissionAttachment,
} from '../../../context/attachment/attachmentData';
import { parseSubmissionPath, setDeepValue } from '../../../context/state/stateHelpers';

const PERSONAL_ID_ATTACHMENT_ID = 'personal-id';

const getAttachmentsAtPath = (submission: Submission | undefined, submissionPath: string): SubmissionAttachment[] => {
  const value = submissionUtils.getSubmissionValue(submissionPath, submission);
  const values = Array.isArray(value) ? value : [value];
  return values.filter(isSubmissionAttachment);
};

const setAttachmentsAtPath = (
  submission: Submission | undefined,
  submissionPath: string,
  attachments: SubmissionAttachment[],
  multiple: boolean,
): Submission => ({
  ...(submission ?? { data: {} }),
  data: setDeepValue(
    submission?.data ?? {},
    parseSubmissionPath(submissionPath),
    multiple ? attachments : attachments[0],
  ),
});

const hydrateLegacyAttachments = (form: Form, submission: Submission | undefined): Submission | undefined => {
  if (!submission) {
    return submission;
  }

  let hydratedSubmission = submission;
  const hydratedNavIds = new Set<string>();
  const consumedAttachmentIds = new Set<string>();

  const hydrateComponents = (components = form.components, parentSubmissionPath = '') => {
    components.forEach((component) => {
      const submissionPath =
        component.type === 'attachment'
          ? [parentSubmissionPath, component.key].filter(Boolean).join('.')
          : submissionUtils.getComponentSubmissionPath(component, parentSubmissionPath);

      if (component.type === 'attachment') {
        const navId = getNavId(component) ?? component.key;
        if (!submissionPath || !navId) {
          return;
        }
        const currentAttachments = getAttachmentsAtPath(hydratedSubmission, submissionPath);
        const legacyAttachments = hydratedNavIds.has(navId)
          ? []
          : (submission.attachments?.filter((attachment) => attachment.navId === navId) ?? []);
        const multiple = component.attachmentType === 'other' || component.otherDocumentation === true;
        if (currentAttachments.length > 0) {
          const currentValue = submissionUtils.getSubmissionValue(submissionPath, hydratedSubmission);
          if (multiple !== Array.isArray(currentValue)) {
            hydratedSubmission = setAttachmentsAtPath(hydratedSubmission, submissionPath, currentAttachments, multiple);
          }
          const currentAttachmentIds = new Set(currentAttachments.map((attachment) => attachment.attachmentId));
          legacyAttachments
            .filter((attachment) => currentAttachmentIds.has(attachment.attachmentId))
            .forEach((attachment) => consumedAttachmentIds.add(attachment.attachmentId));
          hydratedNavIds.add(navId);
          return;
        }

        const rawValue = submissionUtils.getSubmissionValue(submissionPath, hydratedSubmission);
        const normalized = attachmentUtils.toSubmissionAttachments(rawValue, component).map((attachment) => ({
          ...attachment,
          attachmentId: createAttachmentId(navId, submissionPath),
        }));
        const attachmentsToHydrate = legacyAttachments.length
          ? multiple
            ? legacyAttachments
            : legacyAttachments.slice(0, 1)
          : allocateAttachmentIds(normalized, collectStoredAttachments(hydratedSubmission));
        if (attachmentsToHydrate.length > 0) {
          hydratedSubmission = setAttachmentsAtPath(hydratedSubmission, submissionPath, attachmentsToHydrate, multiple);
          if (legacyAttachments.length) {
            attachmentsToHydrate.forEach((attachment) => consumedAttachmentIds.add(attachment.attachmentId));
          }
          hydratedNavIds.add(navId);
        }
        return;
      }

      if (!component.components?.length) {
        return;
      }

      if (component.type === 'datagrid') {
        const rows = submissionUtils.getSubmissionValue(submissionPath, hydratedSubmission);
        const rowCount = Array.isArray(rows) && rows.length > 0 ? rows.length : 1;
        for (let index = 0; index < rowCount; index += 1) {
          hydrateComponents(component.components, `${submissionPath}[${index}]`);
        }
        return;
      }

      hydrateComponents(component.components, submissionPath);
    });
  };

  hydrateComponents();

  if (consumedAttachmentIds.size === 0) return hydratedSubmission;
  return {
    ...hydratedSubmission,
    attachments: hydratedSubmission.attachments?.filter(
      (attachment) =>
        attachment.type === PERSONAL_ID_ATTACHMENT_ID || !consumedAttachmentIds.has(attachment.attachmentId),
    ),
  };
};

export {
  createAttachmentId,
  getAttachmentsAtPath,
  hydrateLegacyAttachments,
  isSubmissionAttachment,
  PERSONAL_ID_ATTACHMENT_ID,
  setAttachmentsAtPath,
};
