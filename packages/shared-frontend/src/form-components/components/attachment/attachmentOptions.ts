import { attachmentUtils, Component, SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';
import { AttachmentChoiceOption } from '../../../components/attachment/attachmentOptions';

const getAttachmentOptions = (
  component: Component,
  submissionMethod?: SubmissionMethod,
  translate: (text: string) => string = (text) => text,
): AttachmentChoiceOption[] =>
  attachmentUtils
    .mapKeysToOptions(component.attachmentValues ?? component.values, translate, submissionMethod)
    .map((option) => {
      const setting = component.attachmentValues?.[option.value];
      return {
        ...option,
        upload: option.upload ?? option.value === 'leggerVedNaa',
        showDeadline: setting?.showDeadline,
        additionalDocumentation: setting?.additionalDocumentation?.enabled
          ? setting.additionalDocumentation
          : (option as AttachmentChoiceOption).additionalDocumentation,
      };
    });

export { getAttachmentOptions };
