import { SubmissionAttachment, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { ValidationField } from '../../context/validation/validationTypes';
import { ValidationRules } from '../../validation/validators';
import { toFieldValidation, toValidationFields } from '../shared/fieldValidation';
import { toTextFieldValidation } from '../text-field/textFieldValidation';
import { ChoiceValidation } from '../types';
import { attachmentFieldPath } from './attachmentFieldPath';
import { AttachmentChoiceOption, getImplicitAttachmentValue } from './attachmentOptions';

interface AttachmentUploadValidationInput {
  submissionPath?: string;
  attachmentId: string;
  label: string;
  required?: boolean;
  attachment?: SubmissionAttachment;
  validation?: ChoiceValidation;
  uploadEnabled?: boolean;
  uploadSelected?: boolean;
  requiredFilesMessage?: string;
}

const attachmentValueRules = (required = false): ValidationRules => ({ required });

/** Choosing to attach the documentation now is only fulfilled once a file has been uploaded. */
const requiresUploadedFiles = (attachment?: SubmissionAttachment) =>
  attachment?.value === 'leggerVedNaa' || (attachment?.type === 'personal-id' && !!attachment.value);

const requiresAttachmentTitleWithoutUpload = (
  attachment: Pick<SubmissionAttachment, 'type' | 'value'> | undefined,
  uploadEnabled: boolean,
) => !uploadEnabled && attachment?.type === 'other' && attachment.value === 'leggerVedNaa';

const attachmentFilesRules: ValidationRules = { requiredFiles: true };

interface AttachmentAdditionalDocumentationInput extends Pick<
  AttachmentUploadValidationInput,
  'submissionPath' | 'attachmentId' | 'attachment' | 'uploadEnabled'
> {
  values: AttachmentChoiceOption[];
}

const toAttachmentAdditionalDocumentationValidationFields = ({
  submissionPath,
  attachmentId,
  attachment,
  values,
  uploadEnabled = false,
}: AttachmentAdditionalDocumentationInput): ValidationField[] => {
  const selectedValue = attachment?.value ?? getImplicitAttachmentValue(values, uploadEnabled);
  const documentation = values.find((option) => option.value === selectedValue)?.additionalDocumentation;
  const value = attachment?.additionalDocumentation ?? '';

  if (!documentation?.label) {
    return [];
  }

  const statePath = attachmentFieldPath(submissionPath, attachmentId, 'additionalDocumentation');
  return toValidationFields(
    statePath,
    value,
    toTextFieldValidation({
      statePath,
      label: documentation.label,
      required: false,
    }),
  );
};

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
  uploadEnabled = true,
  uploadSelected = uploadEnabled && requiresUploadedFiles(attachment),
  requiredFilesMessage,
}: AttachmentUploadValidationInput): ValidationField[] => {
  const statePath = attachmentFieldPath(submissionPath, attachmentId, 'files');

  return [
    ...(uploadSelected
      ? toValidationFields(
          statePath,
          attachment?.files ?? [],
          toFieldValidation({
            statePath,
            label,
            validation: {
              ...attachmentFilesRules,
              ...(requiredFilesMessage ? { requiredFilesMessage } : {}),
            },
          }),
        )
      : []),
    ...(requiresAttachmentTitleWithoutUpload(attachment, uploadEnabled) ||
    (uploadSelected && attachment?.type === 'other')
      ? toValidationFields(
          attachmentFieldPath(submissionPath, attachmentId, 'title'),
          attachment?.title,
          toTextFieldValidation({
            statePath: attachmentFieldPath(submissionPath, attachmentId, 'title'),
            label: TEXTS.statiske.attachment.attachmentTitle,
            required: true,
            validation: { maxLength: 50 },
          }),
        )
      : []),
  ];
};

export {
  attachmentFilesRules,
  attachmentValueRules,
  requiresAttachmentTitleWithoutUpload,
  requiresUploadedFiles,
  toAttachmentAdditionalDocumentationValidationFields,
  toAttachmentFilesValidationFields,
  toAttachmentValueValidationFields,
};
export type { AttachmentUploadValidationInput };
