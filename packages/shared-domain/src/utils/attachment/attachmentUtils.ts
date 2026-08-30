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
import { submissionUtils } from '../submission/submissionUtils';

const enableAttachmentUpload = (submissionMethod?: string) =>
  submissionMethod === 'digital' || submissionMethod === 'digitalnologin';

const enableAttachmentDownload = (submissionMethod?: SubmissionMethod): boolean => submissionMethod === 'digital';

const shouldEnableUpload = (value: string) => value === 'leggerVedNaa';

const isKnownAttachmentSettingKey = (key: string): key is (typeof attachmentSettingKeys)[number] =>
  attachmentSettingKeys.includes(key as (typeof attachmentSettingKeys)[number]);

const getEnabledAttachmentKeys = (
  attachmentValues: AttachmentSettingValues | ComponentValue[] | undefined,
): (typeof attachmentSettingKeys)[number][] => {
  if (!attachmentValues) {
    return [];
  }

  if (Array.isArray(attachmentValues)) {
    return attachmentValues.map((option) => option.value).filter((value) => isKnownAttachmentSettingKey(value));
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

const getAttachmentLabel = (key: keyof AttachmentSettingValues, submissionMethod?: SubmissionMethod) =>
  TEXTS.statiske.attachment[resolveAttachmentLabelKey(key, submissionMethod)];

const isSubmissionAttachment = (value: unknown): value is SubmissionAttachment =>
  typeof value === 'object' && value !== null && 'attachmentId' in value && typeof value.attachmentId === 'string';

const toSubmissionAttachments = (value: unknown, component: Component): SubmissionAttachment[] => {
  if (Array.isArray(value)) {
    return value.filter(isSubmissionAttachment);
  }
  if (isSubmissionAttachment(value)) {
    return [value];
  }

  const attachmentValue =
    typeof value === 'string'
      ? value
      : value && typeof value === 'object' && 'key' in value && typeof value.key === 'string'
        ? value.key
        : value && typeof value === 'object' && 'value' in value && typeof value.value === 'string'
          ? value.value
          : undefined;
  const navId = navFormUtils.getNavId(component) ?? component.key;
  if (!attachmentValue || !navId || !isKnownAttachmentSettingKey(attachmentValue)) {
    return [];
  }

  const additionalDocumentation =
    value &&
    typeof value === 'object' &&
    'additionalDocumentation' in value &&
    typeof value.additionalDocumentation === 'string'
      ? value.additionalDocumentation
      : undefined;

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
  value: SubmissionAttachmentValue;
  component: Component;
  form: NavFormType;
  submissionMethod?: SubmissionMethod;
}): AttachmentValue => {
  const additionalDocumentationLabel = component.attachmentValues?.[value.key]?.additionalDocumentation?.label;
  const shouldShowDeadline =
    !!component.attachmentValues?.[value.key]?.showDeadline && form.properties?.ettersendelsesfrist;

  return {
    description: translate(getAttachmentLabel(value.key, submissionMethod)),
    ...(additionalDocumentationLabel && { additionalDocumentationLabel: translate(additionalDocumentationLabel) }),
    ...(value.additionalDocumentation && { additionalDocumentation: translate(value.additionalDocumentation) }),
    ...(shouldShowDeadline && {
      deadlineWarning: translate(TEXTS.statiske.attachment.deadline, {
        deadline: form.properties?.ettersendelsesfrist,
      }),
    }),
  };
};

/**
 * Collects attachment answers stored in submission data, regardless of where the attachment
 * component sits in the form: directly in submission data, nested inside containers, or inside
 * data grid rows.
 */
const collectAttachmentsFromSubmissionData = (
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
      return toSubmissionAttachments(submissionUtils.getSubmissionValue(submissionPath, submission), component);
    }

    if (!component.components?.length) {
      return [];
    }

    if (component.type === 'datagrid') {
      const rows = submissionUtils.getSubmissionValue(submissionPath, submission);
      return Array.isArray(rows)
        ? rows.flatMap((_row, index) =>
            collectAttachmentsFromSubmissionData(component.components ?? [], submission, `${submissionPath}[${index}]`),
          )
        : [];
    }

    return collectAttachmentsFromSubmissionData(component.components, submission, submissionPath);
  });

const getAttachmentsForCoverPage = (submission: Submission, form: NavFormType): Component[] => {
  const attachments = [
    ...(submission.attachments ?? []),
    ...collectAttachmentsFromSubmissionData(form.components as Component[], submission),
  ];

  return navFormUtils
    .flattenComponents(form.components)
    .filter((component) => component.properties && !!component.properties.vedleggskode)
    .filter((component) => {
      const attachmentId = navFormUtils.getNavId(component) ?? component.key;

      return attachments.some((attachment) => attachment.navId === attachmentId && attachment.value === 'leggerVedNaa');
    });
};

const attachmentUtils = {
  enableAttachmentDownload,
  enableAttachmentUpload,
  getAttachmentsForCoverPage,
  getImplicitValueKey,
  getAttachmentLabel,
  isSingleUploadOnlyOption,
  mapToAttachmentSummary,
  mapKeysToOptions,
  resolveAttachmentLabelKey,
  toSubmissionAttachments,
};

export { attachmentSettingKeys, attachmentUtils, enableAttachmentDownload, getAttachmentsForCoverPage };
