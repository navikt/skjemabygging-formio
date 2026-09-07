import { attachmentUtils, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { createAttachmentId, getAttachmentsAtPath } from '../../context/attachment/attachmentData';
import { ValidationField } from '../../context/validation/validationTypes';
import { AttachmentDefinition } from '../../form-components/component-types';
import { validationFieldsRegistry } from '../../form-components/page-validation/validationFieldsRegistry';
import {
  ValidationFieldsBuilder,
  ValidationFieldsRegistry,
} from '../../form-components/page-validation/validationFieldsTypes';
import { toAttachmentFilesValidationFields, toAttachmentValueValidationFields } from './attachmentUploadValidation';

/**
 * The fields the fyllut upload controls validate for an attachment: the choice the user made, and
 * - once they chose to attach the documentation now - at least one uploaded file per attachment.
 * Mirrors `FyllutInputAttachment`, which falls back to the plain attachment component when the
 * submission method has no upload.
 */
const attachmentUploadValidationFields: ValidationFieldsBuilder<AttachmentDefinition> = (context) => {
  const { component, submissionPath, submission, submissionMethod } = context;

  if (!attachmentUtils.enableAttachmentUpload(submissionMethod)) {
    return validationFieldsRegistry.attachment(context);
  }

  const label = component.label ?? component.key;
  const required = component.validate?.required ?? false;
  const attachmentNavId = navFormUtils.getNavId(component) ?? component.key;
  const baseAttachmentId = createAttachmentId(attachmentNavId, submissionPath);
  const attachments = getAttachmentsAtPath(submission, submissionPath).filter(
    (attachment) => attachment.navId === attachmentNavId,
  );
  const [baseAttachment] = attachments;

  const fileFields: ValidationField[] = attachments.flatMap((attachment) =>
    toAttachmentFilesValidationFields({ attachmentId: attachment.attachmentId, label, attachment }),
  );

  return [
    // The choice is always registered on the id derived from the component, the way both upload
    // controls do; the files are registered per stored attachment, since "other" documentation can
    // hold several.
    ...toAttachmentValueValidationFields({
      attachmentId: baseAttachmentId,
      label,
      required,
      attachment: baseAttachment,
    }),
    ...fileFields,
  ];
};

/** The validation-fields registry used by the fyllut form flow. */
const fyllutValidationFieldsRegistry: ValidationFieldsRegistry = {
  ...validationFieldsRegistry,
  attachment: attachmentUploadValidationFields,
};

export { attachmentUploadValidationFields, fyllutValidationFieldsRegistry };
