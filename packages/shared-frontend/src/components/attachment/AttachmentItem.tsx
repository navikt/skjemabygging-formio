import { Button, FileItem, HStack, VStack } from '@navikt/ds-react';
import { SubmissionAttachment, TEXTS, UploadedFile } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode } from 'react';
import { readAttachments, standaloneAttachmentsPath } from '../../context/attachment/attachmentSubmission';
import {
  getFileValidationError,
  useAttachmentUpload,
  useAttachmentUploadsInProgress,
} from '../../context/attachment/AttachmentUploadContext';
import { fileUploadErrorParams } from '../../context/attachment/fileUploadConfig';
import { useLanguage } from '../../context/language/LanguageContext';
import { useFieldBinding } from '../../context/state/useFieldBinding';
import { useValidationExternalError, useValidationFieldError } from '../../context/validation/ValidationContext';
import ValidationRegistration from '../../context/validation/ValidationRegistration';
import { UnvalidatedFields, useOptionalValidationScope } from '../../context/validation/ValidationScopeContext';
import { inputId } from '../../utils/inputId';
import Alert from '../alert/Alert';
import FileList from '../file-upload/FileList';
import UploadButton from '../file-upload/UploadButton';
import TextField from '../text-field/TextField';
import { attachmentFieldPath } from './attachmentFieldPath';
import { toAttachmentFilesValidationFields } from './attachmentValidation';

const noFiles: UploadedFile[] = [];

interface Props {
  initialAttachment: SubmissionAttachment;
  attachmentLabel?: string;
  submissionPath?: string;
  multipleAttachments?: boolean;
  attachmentValue?: SubmissionAttachment['value'];
  requireAttachmentTitle?: boolean;
  showDeleteAttachmentButton?: boolean;
  onDeleteAttachment?: (attachmentId: string) => Promise<void>;
  multiple?: boolean;
  readMore?: ReactNode;
  accept?: string;
  maxFileSizeInBytes?: number;
  onUpload?: (attachment: SubmissionAttachment) => void;
  downloadEnabled?: boolean;
  readOnly?: boolean;
  uploadSelected?: boolean;
}

const AttachmentItem = ({
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
  downloadEnabled,
  readOnly,
  uploadSelected,
}: Props) => {
  const { translate } = useLanguage();
  const { stateValue } = useFieldBinding({ statePath: submissionPath ?? standaloneAttachmentsPath });
  const { changeAttachmentValue, handleDeleteFile, handleDownloadFile } = useAttachmentUpload();
  const { attachmentId } = initialAttachment;
  const uploadsInProgress = useAttachmentUploadsInProgress(attachmentId);
  const submissionAttachments = readAttachments(stateValue);
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
  const filesPath = attachmentFieldPath(submissionPath, attachmentId, 'files');
  const filesExternalError = useValidationExternalError(filesPath);
  const filesValidationError = useValidationFieldError(filesPath, pageKey);
  const filesError = filesValidationError ?? filesExternalError;
  const fields = toAttachmentFilesValidationFields({
    submissionPath,
    attachmentId,
    label: attachmentLabel ?? label,
    attachment,
    uploadSelected,
  });
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
      {fields.map((field) => (
        <ValidationRegistration
          key={field.statePath}
          label={field.field}
          statePath={field.statePath}
          value={field.value}
          rules={field.rules}
        />
      ))}
      {(!showButton || fileItems.length > 0) && (
        <FileList
          label={!showButton ? label : undefined}
          uploaded={uploadedFiles}
          inProgress={inProgress}
          uploadingText={translate(TEXTS.statiske.uploadFile.uploading)}
          getFileError={(file) => translate(getFileValidationError(file), fileUploadErrorParams)}
          onDeleteFile={readOnly ? undefined : handleDeleteFileItem}
          onDownloadFile={downloadEnabled ? handleDownloadFileItem : undefined}
        />
      )}
      {(!showButton || readOnly) && filesError && (
        <div id={inputId(filesPath)} tabIndex={-1}>
          <Alert variant="error" inline>
            {filesError}
          </Alert>
        </div>
      )}
      {showButton && (
        <VStack gap="space-32">
          {requireAttachmentTitle && (
            <UnvalidatedFields>
              <TextField
                statePath={attachmentTitlePath}
                label={translate(TEXTS.statiske.attachment.attachmentTitle)}
                maxLength={50}
                value={attachment?.title ?? ''}
                error={attachmentTitleErrorMessage}
                onChange={handleTitleChange}
                readOnly={readOnly}
              />
            </UnvalidatedFields>
          )}
          {!readOnly && (
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
          )}
        </VStack>
      )}
    </VStack>
  );
};

export default AttachmentItem;
