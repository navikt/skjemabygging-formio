import { FileObject, VStack } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode, useState } from 'react';
import Alert from '../../../components/alert/Alert';
import FileUploadButton from '../../../components/file-upload/FileUploadButton';
import { getAttachmentsAtPath } from '../../../context/attachment/attachmentData';
import { useLanguage } from '../../../context/language/LanguageContext';
import { useSubmissionState } from '../../../context/state/SubmissionStateContext';
import { useOptionalValidationScope } from '../../../context/validation/ValidationScopeContext';
import { inputId } from '../../../utils/inputId';
import { useAttachmentUpload } from '../context/AttachmentUploadContext';
import { FILE_ACCEPT, MAX_SIZE_ATTACHMENT_FILE_BYTES } from '../context/fileUploadConfig';
import useAttachmentValidation from './useAttachmentValidation';

interface Props {
  attachmentId: string;
  statePath: string;
  submissionPath?: string;
  multipleAttachments?: boolean;
  variant: 'primary' | 'secondary';
  allowUpload?: boolean;
  readMore?: ReactNode;
  translationParams?: Record<string, string>;
  accept?: string;
  maxFileSizeInBytes?: number;
  onSuccess?: () => void;
}

const UploadButton = ({
  attachmentId,
  statePath,
  submissionPath,
  multipleAttachments = false,
  variant,
  allowUpload,
  readMore,
  translationParams,
  accept = FILE_ACCEPT,
  maxFileSizeInBytes = MAX_SIZE_ATTACHMENT_FILE_BYTES,
  onSuccess,
}: Props) => {
  const { translate } = useLanguage();
  const { submission } = useSubmissionState();
  const { handleUploadFile, addError } = useAttachmentUpload();
  const submissionAttachments = submissionPath
    ? getAttachmentsAtPath(submission, submissionPath)
    : (submission?.attachments ?? []);
  const scope = useOptionalValidationScope();
  const { getAttachmentError } = useAttachmentValidation(submissionPath, submissionAttachments);
  const [loading, setLoading] = useState(false);
  const uploadErrorMessage = getAttachmentError(attachmentId, 'files');

  const onSelect = async (files: FileObject[]) => {
    setLoading(true);
    const file = files[0];
    if (!file) {
      setLoading(false);
      return;
    }
    const response = await handleUploadFile(attachmentId, file, submissionPath, multipleAttachments, scope?.pageKey);
    if (response.status === 'ok') {
      onSuccess?.();
    }
    setLoading(false);
  };

  const label = translate(
    variant === 'primary' ? TEXTS.statiske.uploadFile.selectFile : TEXTS.statiske.uploadFile.uploadMoreFiles,
  );

  return (
    <VStack gap="space-8">
      <FileUploadButton
        id={inputId(statePath)}
        label={label}
        loading={loading}
        variant={variant}
        accept={accept}
        maxSizeInBytes={maxFileSizeInBytes}
        onSelect={onSelect}
        onBlockedClick={
          allowUpload
            ? undefined
            : () =>
                addError(
                  attachmentId,
                  translate('required', { field: translate(TEXTS.statiske.attachment.attachmentTitle) }),
                  'TITLE',
                  scope?.pageKey,
                  submissionPath,
                )
        }
      />
      {uploadErrorMessage && (
        <Alert variant="error" inline>
          {translate(uploadErrorMessage, translationParams)}
        </Alert>
      )}
      {readMore}
    </VStack>
  );
};

export default UploadButton;
