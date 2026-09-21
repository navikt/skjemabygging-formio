import { Button, FileItem, HStack, VStack } from '@navikt/ds-react';
import {
  AttachmentSettingValues,
  enableAttachmentDownload,
  SubmissionAttachment,
  TEXTS,
  UploadedFile,
} from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode } from 'react';
import FileList from '../../../components/file-upload/FileList';
import TextField from '../../../components/text-field/TextField';
import { getAttachmentsAtPath } from '../../../context/attachment/attachmentData';
import { useFormDefinitionSubmissionMethod } from '../../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../../context/language/LanguageContext';
import { useSubmissionState } from '../../../context/state/SubmissionStateContext';
import { useValidationExternalError, useValidationFieldError } from '../../../context/validation/ValidationContext';
import ValidationRegistration from '../../../context/validation/ValidationRegistration';
import { UnvalidatedFields, useOptionalValidationScope } from '../../../context/validation/ValidationScopeContext';
import { attachmentFieldPath } from '../attachmentFieldPath';
import { attachmentFilesRules, requiresUploadedFiles } from '../attachmentUploadValidation';
import {
  getFileValidationError,
  useAttachmentUpload,
  useAttachmentUploadsInProgress,
} from '../context/AttachmentUploadContext';
import { fileUploadErrorParams } from '../context/fileUploadConfig';
import UploadButton from './UploadButton';

const noFiles: UploadedFile[] = [];

interface Props {
  initialAttachment: SubmissionAttachment;
  attachmentLabel?: string;
  submissionPath?: string;
  multipleAttachments?: boolean;
  attachmentValue?: keyof AttachmentSettingValues;
  requireAttachmentTitle?: boolean;
  showDeleteAttachmentButton?: boolean;
  onDeleteAttachment?: (attachmentId: string) => Promise<void>;
  multiple?: boolean;
  readMore?: ReactNode;
  accept?: string;
  maxFileSizeInBytes?: number;
  onUpload?: (attachment: SubmissionAttachment) => void;
}

const FileUploader = ({
  initialAttachment,
  attachmentLabel,
  submissionPath,
  multipleAttachments = false,
  attachmentValue,
  requireAttachmentTitle,
  showDeleteAttachmentButton,
  onDeleteAttachment,
  multiple,
  readMore,
  accept,
  maxFileSizeInBytes,
  onUpload,
}: Props) => {
  const submissionMethod = useFormDefinitionSubmissionMethod();
  const { translate } = useLanguage();
  const { submission } = useSubmissionState();
  const { changeAttachmentValue, handleDeleteFile, handleDownloadFile } = useAttachmentUpload();
  const { attachmentId } = initialAttachment;
  const uploadsInProgress = useAttachmentUploadsInProgress(attachmentId);
  const submissionAttachments = submissionPath
    ? getAttachmentsAtPath(submission, submissionPath)
    : (submission?.attachments ?? []);
  const attachment = submissionAttachments.find((currentAttachment) => currentAttachment.attachmentId === attachmentId);
  const pageKey = useOptionalValidationScope()?.pageKey;

  const label = requireAttachmentTitle
    ? translate(attachment?.title)
    : translate(TEXTS.statiske.uploadFile.singleFileUploadedLabel);

  const uploadedFiles = attachment?.files ?? noFiles;
  const initialUpload = uploadedFiles.length === 0;
  const showButton = multiple || initialUpload;
  const inProgress = Object.values(uploadsInProgress);
  const fileItems = [...uploadedFiles, ...inProgress];

  const attachmentTitlePath = attachmentFieldPath(submissionPath, attachmentId, 'title');
  const titleValidationError = useValidationFieldError(attachmentTitlePath, pageKey);
  const titleExternalError = useValidationExternalError(attachmentTitlePath);
  const attachmentTitleErrorMessage = titleValidationError ?? titleExternalError;
  const handleTitleChange = (title: string) => {
    changeAttachmentValue(
      initialAttachment,
      {
        value: attachmentValue,
        title,
      },
      submissionPath,
      multipleAttachments,
    );
  };

  const handleDeleteFileItem = (fileId: string, file: FileItem) => {
    if (attachment?.type === 'other' && onDeleteAttachment) {
      return onDeleteAttachment(attachmentId);
    }
    return handleDeleteFile(attachmentId, fileId, file, submissionPath, multipleAttachments);
  };

  const handleDownloadFileItem = (fileId: string, fileName: string) => {
    return handleDownloadFile(attachmentId, fileId, fileName, submissionPath);
  };

  return (
    <VStack gap="space-24" data-cy={`upload-button-${attachmentId}`}>
      {/* The uploaded files have no input of their own, so the uploader declares them. */}
      {requiresUploadedFiles(attachment) && (
        <ValidationRegistration
          label={attachmentLabel ?? label}
          statePath={attachmentFieldPath(submissionPath, attachmentId, 'files')}
          value={attachment?.files ?? []}
          rules={attachmentFilesRules}
        />
      )}
      {(!showButton || fileItems.length > 0) && (
        <FileList
          label={!showButton ? label : undefined}
          uploaded={uploadedFiles}
          inProgress={inProgress}
          uploadingText={translate(TEXTS.statiske.uploadFile.uploading)}
          getFileError={(file) => translate(getFileValidationError(file), fileUploadErrorParams)}
          onDeleteFile={handleDeleteFileItem}
          onDownloadFile={enableAttachmentDownload(submissionMethod) ? handleDownloadFileItem : undefined}
        />
      )}
      {showButton && (
        <VStack gap="space-32">
          {requireAttachmentTitle && (
            // The title lives on the attachment rather than in the submission state, and the error
            // it shows comes from the upload itself.
            <UnvalidatedFields>
              <TextField
                statePath={attachmentTitlePath}
                label={translate(TEXTS.statiske.attachment.attachmentTitle)}
                maxLength={50}
                value={attachment?.title ?? ''}
                error={attachmentTitleErrorMessage}
                onChange={handleTitleChange}
              />
            </UnvalidatedFields>
          )}
          <HStack gap="space-16">
            <UploadButton
              attachmentId={attachmentId}
              statePath={attachmentFieldPath(submissionPath, attachmentId, 'files')}
              submissionPath={submissionPath}
              multipleAttachments={multipleAttachments}
              variant={initialUpload ? 'primary' : 'secondary'}
              allowUpload={!requireAttachmentTitle || !!attachment?.title?.trim()}
              translationParams={fileUploadErrorParams}
              accept={accept}
              readMore={readMore}
              maxFileSizeInBytes={maxFileSizeInBytes}
              onSuccess={() => onUpload?.(initialAttachment)}
            />
            {showDeleteAttachmentButton && onDeleteAttachment && (
              <Button variant="tertiary" onClick={() => onDeleteAttachment(attachmentId)}>
                {translate(TEXTS.statiske.attachment.deleteAttachment)}
              </Button>
            )}
          </HStack>
        </VStack>
      )}
    </VStack>
  );
};

export default FileUploader;
