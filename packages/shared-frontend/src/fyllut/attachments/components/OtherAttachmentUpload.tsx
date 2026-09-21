import {
  AttachmentSettingValues,
  ComponentValue,
  SubmissionAttachment,
  SubmissionAttachmentValue,
} from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode } from 'react';
import { createAttachmentId, getAttachmentsAtPath } from '../../../context/attachment/attachmentData';
import { useSubmissionState } from '../../../context/state/SubmissionStateContext';
import ValidationRegistration from '../../../context/validation/ValidationRegistration';
import { attachmentFieldPath } from '../attachmentFieldPath';
import { attachmentValueRules } from '../attachmentUploadValidation';
import { useAttachmentUpload } from '../context/AttachmentUploadContext';
import { filterAttachmentsByNavId } from '../context/attachmentUploadUtils';
import OtherAttachmentUploadField from './OtherAttachmentUploadField';
import useAttachmentValidation from './useAttachmentValidation';

interface OtherAttachmentUploadProps {
  label: string;
  required: boolean;
  attachmentValues?: AttachmentSettingValues | ComponentValue[];
  attachmentNavId: string;
  submissionPath: string;
  description?: ReactNode;
  onUpload?: (attachment: SubmissionAttachment) => void;
}

const OtherAttachmentUpload = ({
  label,
  required,
  attachmentValues,
  attachmentNavId,
  submissionPath,
  description,
  onUpload,
}: OtherAttachmentUploadProps) => {
  const { submission } = useSubmissionState();
  const { changeAttachmentValue } = useAttachmentUpload();
  const submissionAttachments = getAttachmentsAtPath(submission, submissionPath);
  const { getAttachmentError } = useAttachmentValidation(submissionPath, submissionAttachments);
  const submissionAttachment = submissionAttachments.find((attachment) => attachment.navId === attachmentNavId);
  const attachmentId = createAttachmentId(attachmentNavId, submissionPath);
  const attachmentError = getAttachmentError(attachmentId, 'value');

  const handleValueChange = (value: Partial<SubmissionAttachmentValue> | undefined) => {
    const storedAttachments = filterAttachmentsByNavId(submissionAttachments, attachmentNavId);
    const attachmentsToUpdate =
      storedAttachments.length > 0
        ? storedAttachments
        : [{ attachmentId, navId: attachmentNavId, type: 'other' as const }];
    attachmentsToUpdate.forEach((attachment) =>
      changeAttachmentValue(
        attachment,
        value ? { value: value.key, additionalDocumentation: value.additionalDocumentation } : {},
        submissionPath,
        true,
      ),
    );
  };

  return (
    <>
      <ValidationRegistration
        label={label}
        statePath={attachmentFieldPath(submissionPath, attachmentId, 'value')}
        value={submissionAttachment?.value}
        rules={attachmentValueRules(required)}
      />
      <OtherAttachmentUploadField
        label={label}
        required={required}
        description={description}
        attachmentValues={attachmentValues}
        attachmentNavId={attachmentNavId}
        submissionPath={submissionPath}
        submissionAttachment={submissionAttachment}
        onValueChange={handleValueChange}
        error={attachmentError}
        onUpload={onUpload}
      />
    </>
  );
};

export default OtherAttachmentUpload;
export type { OtherAttachmentUploadProps };
