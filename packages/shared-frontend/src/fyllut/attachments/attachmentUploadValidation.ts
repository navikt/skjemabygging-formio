import { SubmissionAttachment } from '@navikt/skjemadigitalisering-shared-domain';
import { toFieldValidation, toValidationFields } from '../../components/shared/fieldValidation';
import { ValidationField } from '../../context/validation/validationTypes';
import { ValidationRules } from '../../validation/validators';
import { attachmentFieldPath } from './attachmentFieldPath';

interface AttachmentUploadValidationInput {
  submissionPath: string;
  attachmentId: string;
  label: string;
  required?: boolean;
  attachment?: SubmissionAttachment;
}

const attachmentValueRules = (required = false): ValidationRules => ({ required });

/** Choosing to attach the documentation now is only fulfilled once a file has been uploaded. */
const requiresUploadedFiles = (attachment?: SubmissionAttachment) => attachment?.value === 'leggerVedNaa';

const attachmentFilesRules: ValidationRules = { requiredFiles: true };

/**
 * Upload controls validate the attachment value at its submission path and use stable child paths
 * for fields such as files. The rendered controls declare these fields with
 * `ValidationRegistration`, and the headless page rebuild derives them here from the same rules.
 */
const toAttachmentValueValidationFields = ({
  submissionPath,
  attachmentId,
  label,
  required,
  attachment,
}: AttachmentUploadValidationInput): ValidationField[] => {
  const statePath = attachmentFieldPath(submissionPath, attachmentId, 'value');

  return toValidationFields(
    statePath,
    attachment?.value,
    toFieldValidation({ statePath, label, required, validation: attachmentValueRules(required) }),
  );
};

const toAttachmentFilesValidationFields = ({
  submissionPath,
  attachmentId,
  label,
  attachment,
}: AttachmentUploadValidationInput): ValidationField[] => {
  const statePath = attachmentFieldPath(submissionPath, attachmentId, 'files');

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
