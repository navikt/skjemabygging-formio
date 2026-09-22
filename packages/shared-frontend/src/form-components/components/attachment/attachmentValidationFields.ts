import { attachmentUtils, getNavId } from '@navikt/skjemadigitalisering-shared-domain';
import { getImplicitAttachmentValue } from '../../../components/attachment/attachmentOptions';
import {
  toAttachmentFilesValidationFields,
  toAttachmentValueValidationFields,
} from '../../../components/attachment/attachmentValidation';
import { createAttachmentId } from '../../../context/attachment/attachmentData';
import { AttachmentDefinition } from '../../component-types';
import { ValidationFieldsBuilder } from '../../page-validation/validationFieldsTypes';
import { toFieldValidationInput } from '../../page-validation/validationFieldUtils';
import { getAttachmentOptions } from './attachmentOptions';
import { normalizeAttachmentValue } from './attachmentValue';

const attachmentUploadValidationFields: ValidationFieldsBuilder<AttachmentDefinition> = (context) => {
  const { component, submissionPath, submissionMethod } = context;

  const label = component.label ?? component.key;
  const required = component.validate?.required ?? false;
  const attachmentNavId = getNavId(component) ?? component.key;
  const baseAttachmentId = createAttachmentId(attachmentNavId, submissionPath);
  const attachments = attachmentUtils
    .toSubmissionAttachments(normalizeAttachmentValue(component, submissionPath, context.value), component)
    .filter((attachment) => attachment.navId === attachmentNavId);
  const options = getAttachmentOptions(component, submissionMethod);
  const implicitValue = getImplicitAttachmentValue(options, attachmentUtils.enableAttachmentUpload(submissionMethod));
  const baseAttachment = attachments[0] ?? {
    attachmentId: baseAttachmentId,
    navId: attachmentNavId,
    type:
      component.attachmentType === 'other' || component.otherDocumentation
        ? ('other' as const)
        : (component.attachmentType ?? 'default'),
    value: implicitValue,
  };

  const fileFields = !attachmentUtils.enableAttachmentUpload(submissionMethod)
    ? []
    : (attachments.length ? attachments : [baseAttachment]).flatMap((attachment) =>
        toAttachmentFilesValidationFields({
          submissionPath,
          attachmentId: attachment.attachmentId,
          label,
          attachment,
          uploadSelected: !!options.find((option) => option.value === attachment.value)?.upload,
        }),
      );

  return [
    ...toAttachmentValueValidationFields({
      submissionPath,
      attachmentId: baseAttachmentId,
      label,
      required,
      attachment: baseAttachment,
      validation: toFieldValidationInput(context).validation,
    }),
    ...fileFields,
  ];
};

export { attachmentUploadValidationFields };
