import { AttachmentOption, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

const shouldEnableUpload = (value: string) => value === 'leggerVedNaa';

export function mapKeysToOptions(
  object: AttachmentOption[],
  translate: (text: string, params?: any) => string,
): AttachmentOption[] {
  return Object.keys(object)
    .filter((key) => object[key].enabled === true)
    .map((key) => ({
      value: key,
      label: translate(TEXTS.statiske.attachment[key]),
      upload: shouldEnableUpload(key),
      additionalDocumentation: object[key]?.additionalDocumentation?.enabled && {
        label: translate(object[key]?.additionalDocumentation?.label),
        description: translate(object[key]?.additionalDocumentation?.description),
      },
    }));
}
