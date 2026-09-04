import {
  Form,
  navFormUtils,
  Submission,
  SubmissionAttachment,
  submissionUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { parseSubmissionPath, setDeepValue } from '../state/stateHelpers';

const PERSONAL_ID_ATTACHMENT_ID = 'personal-id';

const isSubmissionAttachment = (value: unknown): value is SubmissionAttachment =>
  typeof value === 'object' &&
  value !== null &&
  'attachmentId' in value &&
  typeof value.attachmentId === 'string' &&
  'navId' in value &&
  typeof value.navId === 'string' &&
  'type' in value &&
  typeof value.type === 'string';

const getAttachmentsAtPath = (submission: Submission | undefined, submissionPath: string): SubmissionAttachment[] => {
  const value = submissionUtils.getSubmissionValue(submissionPath, submission);
  if (Array.isArray(value)) {
    return value.filter(isSubmissionAttachment);
  }
  return isSubmissionAttachment(value) ? [value] : [];
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

const createAttachmentId = (navId: string, submissionPath: string) => {
  if (!submissionPath.includes('[')) {
    return navId;
  }
  return `${navId}-${submissionPath.replace(/[^a-zA-Z0-9_-]+/g, '-')}`;
};

const hydrateLegacyAttachments = (form: Form, submission: Submission | undefined): Submission | undefined => {
  if (!submission?.attachments?.some((attachment) => attachment.type !== PERSONAL_ID_ATTACHMENT_ID)) {
    return submission;
  }

  let hydratedSubmission = submission;
  const hydratedNavIds = new Set<string>();

  const hydrateComponents = (components = form.components, parentSubmissionPath = '') => {
    components.forEach((component) => {
      const submissionPath =
        component.type === 'attachment'
          ? [parentSubmissionPath, component.key].filter(Boolean).join('.')
          : submissionUtils.getComponentSubmissionPath(component, parentSubmissionPath);

      if (component.type === 'attachment') {
        const navId = navFormUtils.getNavId(component);
        if (!submissionPath || !navId || hydratedNavIds.has(navId)) {
          return;
        }
        if (getAttachmentsAtPath(hydratedSubmission, submissionPath).length > 0) {
          hydratedNavIds.add(navId);
          return;
        }

        const legacyAttachments = submission.attachments?.filter((attachment) => attachment.navId === navId) ?? [];
        if (legacyAttachments.length > 0) {
          hydratedSubmission = setAttachmentsAtPath(
            hydratedSubmission,
            submissionPath,
            legacyAttachments,
            component.attachmentType === 'other' || component.otherDocumentation === true,
          );
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

  return {
    ...hydratedSubmission,
    attachments: hydratedSubmission.attachments?.filter((attachment) => attachment.type === PERSONAL_ID_ATTACHMENT_ID),
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
