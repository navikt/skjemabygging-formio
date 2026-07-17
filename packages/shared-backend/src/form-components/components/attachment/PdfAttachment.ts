import {
  attachmentSettingKeys,
  attachmentUtils,
  submissionUtils as formComponentUtils,
  PdfData,
} from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps } from '../../types';

const isKnownAttachmentSettingKey = (key: string): key is (typeof attachmentSettingKeys)[number] =>
  attachmentSettingKeys.includes(key as (typeof attachmentSettingKeys)[number]);

const getAttachmentKey = (value: unknown): (typeof attachmentSettingKeys)[number] | undefined => {
  if (typeof value === 'string') {
    return isKnownAttachmentSettingKey(value) ? value : undefined;
  }

  if (value && typeof value === 'object') {
    if ('key' in value && typeof value.key === 'string') {
      return isKnownAttachmentSettingKey(value.key) ? value.key : undefined;
    }

    if ('value' in value && typeof value.value === 'string') {
      return isKnownAttachmentSettingKey(value.value) ? value.value : undefined;
    }
  }

  return undefined;
};

const PdfAttachment = (props: PdfComponentProps): PdfData[] | null => {
  const { component, submissionPath, submission, translate, submissionMethod } = props;
  const { label, attachmentValues } = component;
  const value =
    formComponentUtils.getSubmissionValue(submissionPath, submission) ??
    (component.key ? formComponentUtils.getSubmissionValue(component.key, submission) : undefined);
  const attachmentKey = getAttachmentKey(value);

  if (value === undefined || !attachmentKey) {
    return null;
  }

  const valueConfig = attachmentValues?.[attachmentKey];
  const comment = valueConfig?.additionalDocumentation?.enabled
    ? {
        label: translate(valueConfig.additionalDocumentation.label),
        verdiliste: [
          {
            label:
              value && typeof value === 'object' && 'additionalDocumentation' in value
                ? `${value.additionalDocumentation ?? ''}`
                : '',
          },
        ],
        visningsVariant: 'PUNKTLISTE',
      }
    : null;

  return [
    {
      label: translate(label),
      verdi: translate(attachmentUtils.getAttachmentLabel(attachmentKey, submissionMethod)),
    },
    ...(comment ? [comment] : []),
  ];
};

export default PdfAttachment;
