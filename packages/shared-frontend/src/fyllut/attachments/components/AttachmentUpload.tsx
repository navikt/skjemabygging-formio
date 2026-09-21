import {
  AttachmentSettingValues,
  AttachmentType,
  ComponentValue,
  SubmissionAttachment,
  SubmissionAttachmentValue,
} from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode } from 'react';
import { createAttachmentId, getAttachmentsAtPath } from '../../../context/attachment/attachmentData';
import { useSubmissionState } from '../../../context/state/SubmissionStateContext';
import { useValidationExternalError, useValidationFieldError } from '../../../context/validation/ValidationContext';
import ValidationRegistration from '../../../context/validation/ValidationRegistration';
import { useOptionalValidationScope } from '../../../context/validation/ValidationScopeContext';
import { attachmentFieldPath } from '../attachmentFieldPath';
import { attachmentValueRules } from '../attachmentUploadValidation';
import { useAttachmentUpload } from '../context/AttachmentUploadContext';
import AttachmentUploadField from './AttachmentUploadField';

interface AttachmentUploadProps {
  label: string;
  required: boolean;
  attachmentValues?: AttachmentSettingValues | ComponentValue[];
  attachmentNavId: string;
  submissionPath: string;
  description?: ReactNode;
  type?: AttachmentType;
  onUpload?: (attachment: SubmissionAttachment) => void;
}

const AttachmentUpload = ({
  label,
  required,
  attachmentValues,
  attachmentNavId,
  submissionPath,
  description,
  type = 'default',
  onUpload,
}: AttachmentUploadProps) => {
  const { submission } = useSubmissionState();
  const { changeAttachmentValue } = useAttachmentUpload();
  const submissionAttachments = getAttachmentsAtPath(submission, submissionPath);
  const submissionAttachment = submissionAttachments.find((attachment) => attachment.navId === attachmentNavId);
  const attachmentId = createAttachmentId(attachmentNavId, submissionPath);
  const attachmentValuePath = attachmentFieldPath(submissionPath, attachmentId, 'value');
  const pageKey = useOptionalValidationScope()?.pageKey;
  const validationError = useValidationFieldError(attachmentValuePath, pageKey);
  const externalError = useValidationExternalError(attachmentValuePath);
  const attachmentError = validationError ?? externalError;

  const handleValueChange = (value: Partial<SubmissionAttachmentValue> | undefined) => {
    changeAttachmentValue(
      submissionAttachment ?? { attachmentId, navId: attachmentNavId, type },
      value ? { value: value.key, additionalDocumentation: value.additionalDocumentation } : {},
      submissionPath,
    );
  };

  return (
    <>
      <ValidationRegistration
        label={label}
        statePath={attachmentValuePath}
        value={submissionAttachment?.value}
        rules={attachmentValueRules(required)}
      />
      <AttachmentUploadField
        label={label}
        required={required}
        description={description}
        attachmentValues={attachmentValues}
        attachmentNavId={attachmentNavId}
        attachmentId={attachmentId}
        submissionPath={submissionPath}
        type={type as Exclude<AttachmentType, 'other'>}
        submissionAttachment={submissionAttachment}
        onValueChange={handleValueChange}
        error={attachmentError}
        onUpload={onUpload}
      />
    </>
  );
};

export default AttachmentUpload;
export type { AttachmentUploadProps };
