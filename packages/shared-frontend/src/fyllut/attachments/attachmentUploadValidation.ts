import { SubmissionAttachment } from '@navikt/skjemadigitalisering-shared-domain';
import { toFieldValidation, toValidationFields } from '../../components/shared/fieldValidation';
import { attachmentValidationPath } from '../../context/validation/attachmentValidationPath';
import { ValidationField } from '../../context/validation/validationTypes';
import { ValidationRules } from '../../validation/validators';

interface AttachmentUploadValidationInput {
  attachmentId: string;
  /** Name of the attachment, used in validation messages. */
  label: string;
  required?: boolean;
  attachment?: SubmissionAttachment;
}

/** The choice the user made for an attachment. */
const attachmentValueRules = (required = false): ValidationRules => ({ required });

/** Choosing to attach the documentation now is only fulfilled once a file has been uploaded. */
const requiresUploadedFiles = (attachment?: SubmissionAttachment) => attachment?.value === 'leggerVedNaa';

const attachmentFilesRules: ValidationRules = { requiredFiles: true };

/**
 * Upload controls are not bound to the submission by state path, so the attachment is validated on
 * the shared attachment validation path instead. The rendered controls declare these fields with
 * `ValidationRegistration`, and the headless page rebuild derives them here from the same rules.
 */
const toAttachmentValueValidationFields = ({
  attachmentId,
  label,
  required,
  attachment,
}: AttachmentUploadValidationInput): ValidationField[] => {
  const statePath = attachmentValidationPath(attachmentId, 'value');

  return toValidationFields(
    statePath,
    attachment?.value,
    toFieldValidation({ statePath, label, validation: attachmentValueRules(required) }),
  );
};

const toAttachmentFilesValidationFields = ({
  attachmentId,
  label,
  attachment,
}: AttachmentUploadValidationInput): ValidationField[] => {
  const statePath = attachmentValidationPath(attachmentId, 'files');

  return requiresUploadedFiles(attachment)
    ? toValidationFields(
        statePath,
        attachment?.files ?? [],
        toFieldValidation({ statePath, label, validation: attachmentFilesRules }),
      )
    : [];
};

export {
  attachmentFilesRules,
  attachmentValueRules,
  requiresUploadedFiles,
  toAttachmentFilesValidationFields,
  toAttachmentValueValidationFields,
};
export type { AttachmentUploadValidationInput };
