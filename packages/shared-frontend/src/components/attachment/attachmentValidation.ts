import { SubmissionAttachment, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { ValidationField } from '../../context/validation/validationTypes';
import { ValidationRules } from '../../validation/validators';
import { toFieldValidation, toValidationFields } from '../shared/fieldValidation';
import { ChoiceValidation } from '../types';
import { attachmentFieldPath } from './attachmentFieldPath';

interface AttachmentUploadValidationInput {
  submissionPath?: string;
  attachmentId: string;
  label: string;
  required?: boolean;
  attachment?: SubmissionAttachment;
  validation?: ChoiceValidation;
  uploadSelected?: boolean;
}

const attachmentValueRules = (required = false): ValidationRules => ({ required });

/** Choosing to attach the documentation now is only fulfilled once a file has been uploaded. */
const requiresUploadedFiles = (attachment?: SubmissionAttachment) =>
  attachment?.value === 'leggerVedNaa' || (attachment?.type === 'personal-id' && !!attachment.value);

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
  validation,
}: AttachmentUploadValidationInput): ValidationField[] => {
  const statePath = attachmentFieldPath(submissionPath, attachmentId, 'value');

  return toValidationFields(
    statePath,
    attachment?.value,
    toFieldValidation({ statePath, label, required, validation }, attachmentValueRules(required)),
  );
};

const toAttachmentFilesValidationFields = ({
  submissionPath,
  attachmentId,
  label,
  attachment,
  uploadSelected = requiresUploadedFiles(attachment),
}: AttachmentUploadValidationInput): ValidationField[] => {
  const statePath = attachmentFieldPath(submissionPath, attachmentId, 'files');

  return uploadSelected
    ? [
        ...toValidationFields(
          statePath,
          attachment?.files ?? [],
          toFieldValidation({ statePath, label, validation: attachmentFilesRules }),
        ),
        ...(attachment?.type === 'other' && !attachment.files?.length
          ? toValidationFields(
              attachmentFieldPath(submissionPath, attachmentId, 'title'),
              attachment.title,
              toFieldValidation({
                statePath: attachmentFieldPath(submissionPath, attachmentId, 'title'),
                label: TEXTS.statiske.attachment.attachmentTitle,
                required: true,
                validation: { maxLength: 50 },
              }),
            )
          : []),
      ]
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
