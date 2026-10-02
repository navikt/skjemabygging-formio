import { TFunction } from 'i18next';
import {
  attachmentSettingKeys,
  AttachmentSettingValues,
  AttachmentValue,
  Component,
  ComponentValue,
  NavFormType,
  Submission,
  SubmissionAttachment,
  SubmissionAttachmentValue,
  SubmissionMethod,
} from '../../models';
import { TEXTS } from '../../texts';
import { navFormUtils } from '../form';
import {
  collectAttachmentsFromData,
  getAdditionalDocumentation,
  getAttachmentValue,
  resolveAttachmentsAtPath,
  resolveSubmissionAttachments,
  toSubmissionAttachments,
} from './attachmentResolution';

const enableAttachmentUpload = (submissionMethod?: string) =>
  submissionMethod === 'digital' || submissionMethod === 'digitalnologin';

const enableAttachmentDownload = (submissionMethod?: SubmissionMethod): boolean => submissionMethod === 'digital';

const shouldEnableUpload = (value: string) => value === 'leggerVedNaa';

const isKnownAttachmentSettingKey = (key: string): key is (typeof attachmentSettingKeys)[number] =>
  attachmentSettingKeys.includes(key as (typeof attachmentSettingKeys)[number]);

const getEnabledAttachmentKeys = (
  attachmentValues: AttachmentSettingValues | ComponentValue[] | undefined,
): string[] => {
  if (!attachmentValues) {
    return [];
  }

  if (Array.isArray(attachmentValues)) {
    return attachmentValues.map((option) => option.value);
  }

  return attachmentSettingKeys.filter((key) => attachmentValues[key]?.enabled);
};

const digitalAttachmentLabelKeyMap: Record<
  (typeof attachmentSettingKeys)[number],
  keyof typeof TEXTS.statiske.attachment
> = {
  leggerVedNaa: 'uploadNow',
  ettersender: 'uploadLater',
  nei: 'noAdditionalAttachments',
  levertTidligere: 'alreadySent',
  harIkke: 'dontHave',
  andre: 'other',
  nav: 'navWillFetch',
};

const resolveAttachmentLabelKey = (
  key: keyof AttachmentSettingValues,
  submissionMethod?: SubmissionMethod,
): keyof typeof TEXTS.statiske.attachment => {
  if (submissionMethod === 'digital' || submissionMethod === 'digitalnologin') {
    return digitalAttachmentLabelKeyMap[key];
  }

  return key;
};

const getAttachmentLabel = (key: string, submissionMethod?: SubmissionMethod, values?: ComponentValue[]) =>
  isKnownAttachmentSettingKey(key)
    ? TEXTS.statiske.attachment[resolveAttachmentLabelKey(key, submissionMethod)]
    : (values?.find((option) => option.value === key)?.label ?? key);

const isSingleUploadOnlyOption = (
  attachmentValues: AttachmentSettingValues | ComponentValue[] | undefined,
  submissionMethod?: SubmissionMethod,
): boolean => {
  if (!enableAttachmentUpload(submissionMethod)) {
    return false;
  }

  const enabledKeys = getEnabledAttachmentKeys(attachmentValues);
  return enabledKeys.length === 1 && enabledKeys[0] === 'leggerVedNaa';
};

const getImplicitValueKey = (
  attachmentValues: AttachmentSettingValues | ComponentValue[] | undefined,
  submissionMethod?: SubmissionMethod,
): keyof AttachmentSettingValues | undefined =>
  isSingleUploadOnlyOption(attachmentValues, submissionMethod) ? 'leggerVedNaa' : undefined;

const mapKeysToOptions = (
  attachmentValues: AttachmentSettingValues | ComponentValue[] | undefined,
  translate: (text: string, params?: any) => string,
  submissionMethod?: SubmissionMethod,
): ComponentValue[] => {
  if (attachmentValues) {
    if (Array.isArray(attachmentValues)) {
      return attachmentValues.map((option) => ({
        ...option,
        label: translate(option.label),
        ...(option.description ? { description: translate(option.description) } : {}),
      }));
    } else if (typeof attachmentValues === 'object') {
      // map over attachmentSettingKeys to ensure a fixed order
      return attachmentSettingKeys
        .map((key) => {
          const values = attachmentValues[key];
          if (!values?.enabled) {
            return undefined;
          } else {
            return {
              value: key,
              label: translate(getAttachmentLabel(key, submissionMethod)),
              upload: shouldEnableUpload(key),
            };
          }
        })
        .filter((values) => !!values) as ComponentValue[];
    }
  }
  return [];
};

const mapToAttachmentSummary = ({
  translate,
  value,
  component,
  form,
  submissionMethod,
}: {
  translate: TFunction;
  value: SubmissionAttachmentValue | SubmissionAttachment | SubmissionAttachment[] | string;
  component: Component;
  form: NavFormType;
  submissionMethod?: SubmissionMethod;
}): AttachmentValue => {
  const answer = Array.isArray(value) ? value[0] : value;
  const key = getAttachmentValue(answer) ?? '';
  const additionalDocumentation = getAdditionalDocumentation(answer);
  const additionalDocumentationLabel = component.attachmentValues?.[key]?.additionalDocumentation?.label;
  const shouldShowDeadline = !!component.attachmentValues?.[key]?.showDeadline && form.properties?.ettersendelsesfrist;

  return {
    description: translate(getAttachmentLabel(key, submissionMethod, component.values)),
    ...(additionalDocumentationLabel && { additionalDocumentationLabel: translate(additionalDocumentationLabel) }),
    ...(additionalDocumentation && { additionalDocumentation: translate(additionalDocumentation) }),
    ...(shouldShowDeadline && {
      deadlineWarning: translate(TEXTS.statiske.attachment.deadline, {
        deadline: form.properties?.ettersendelsesfrist,
      }),
    }),
  };
};

const getAttachmentsForCoverPage = (submission: Submission, form: Pick<NavFormType, 'components'>): Component[] => {
  const attachments = resolveSubmissionAttachments(form, submission);

  return navFormUtils
    .flattenComponents(form.components)
    .filter((component) => component.properties && !!component.properties.vedleggskode)
    .filter((component) => {
      const attachmentId = navFormUtils.getNavId(component) ?? component.key;

      return attachments.some((attachment) => attachment.navId === attachmentId && attachment.value === 'leggerVedNaa');
    });
};

const attachmentUtils = {
  collectAttachmentsFromData,
  enableAttachmentDownload,
  enableAttachmentUpload,
  getAttachmentsForCoverPage,
  getImplicitValueKey,
  getAttachmentLabel,
  isSingleUploadOnlyOption,
  mapToAttachmentSummary,
  mapKeysToOptions,
  resolveAttachmentLabelKey,
  resolveAttachmentsAtPath,
  resolveSubmissionAttachments,
  toSubmissionAttachments,
};

export { attachmentSettingKeys, attachmentUtils, enableAttachmentDownload, getAttachmentsForCoverPage };
