import { UploadIcon } from '@navikt/aksel-icons';
import { Button, FileObject, FileUpload, HStack, InlineMessage, TextField, VStack } from '@navikt/ds-react';
import {
  AttachmentSettingValues,
  SubmissionAttachment,
  TEXTS,
  enableAttachmentDownload,
} from '@navikt/skjemadigitalisering-shared-domain';
import { ChangeEvent, useState } from 'react';
import { useAppConfig } from '../../context/app-config/AppConfigContext';
import { useLanguage } from '../../context/language/LanguageContext';
import type { FormRendererAttachmentAdapter } from '../types';
import { useAttachmentUpload } from './AttachmentUploadContext';
import FileUploadReadMore from './FileUploadReadMore';
import FilesPreview from './FilesPreview';
import { attachmentValidator } from './attachmentValidation';
import { AttachmentRefs, setRef } from './types';

const FILE_ACCEPT = '.pdf,.jpeg,.jpg,.docx,.doc,.odt,.rtf,.txt,.png,.tiff,.tif,.bmp,.gif';
const MAX_SIZE_ATTACHMENT_FILE_BYTES = 150 * 1024 * 1024;
const fileUploadErrorParams = { maxFileSize: '150 MB', maxAttachmentSize: '150 MB' };

const FileUploader = ({
  attachment,
  attachmentValue,
  requireAttachmentTitle,
  showDeleteAttachmentButton,
  onDeleteAttachment,
  multiple,
  refs,
  adapter,
}: {
  attachment: SubmissionAttachment;
  attachmentValue?: keyof AttachmentSettingValues;
  requireAttachmentTitle?: boolean;
  showDeleteAttachmentButton?: boolean;
  onDeleteAttachment?: (attachmentId: string) => Promise<void>;
  multiple?: boolean;
  refs?: AttachmentRefs;
  adapter?: FormRendererAttachmentAdapter;
}) => {
  const { translate } = useLanguage();
  const { submissionMethod } = useAppConfig();
  const {
    changeAttachmentValue,
    handleDeleteFile,
    handleDownloadFile,
    submissionAttachments,
    errors,
    uploadsInProgress,
    handleUploadFile,
    addError,
  } = useAttachmentUpload();
  const storedAttachment = submissionAttachments.find((entry) => entry.attachmentId === attachment.attachmentId);
  const uploadedFiles = storedAttachment?.files ?? [];
  const inProgress = Object.values(uploadsInProgress[attachment.attachmentId] ?? {});
  const initialUpload = uploadedFiles.length === 0;
  const showButton = multiple || initialUpload;
  const titleError = errors[attachment.attachmentId]?.find((error) => error.type === 'TITLE')?.message;
  const fileError = errors[attachment.attachmentId]?.find((error) => error.type === 'FILE')?.message;
  const [loading, setLoading] = useState(false);
  const validator = attachmentValidator(translate, ['otherDocumentationTitle']);

  const selectFile = async (files: FileObject[]) => {
    const file = files[0];
    if (!file) {
      return;
    }
    setLoading(true);
    const result = await handleUploadFile(attachment.attachmentId, file);
    if (result.status === 'ok') {
      adapter?.onFileUploaded?.(attachment.attachmentId, attachment.navId);
    }
    setLoading(false);
  };

  return (
    <VStack gap="space-24" data-cy={`upload-button-${attachment.attachmentId}`}>
      {(!showButton || uploadedFiles.length > 0 || inProgress.length > 0) && (
        <FilesPreview
          label={
            !showButton
              ? requireAttachmentTitle
                ? translate(storedAttachment?.title)
                : translate(TEXTS.statiske.uploadFile.singleFileUploadedLabel)
              : undefined
          }
          uploaded={uploadedFiles}
          inProgress={inProgress}
          onDelete={(fileId, file) =>
            attachment.type === 'other' && onDeleteAttachment
              ? void onDeleteAttachment(attachment.attachmentId)
              : void handleDeleteFile(attachment.attachmentId, fileId, file)
          }
          onDownload={
            enableAttachmentDownload(submissionMethod)
              ? (fileId, fileName) => void handleDownloadFile(attachment.attachmentId, fileId, fileName)
              : undefined
          }
        />
      )}
      {showButton && (
        <VStack gap="space-16">
          {requireAttachmentTitle && (
            <TextField
              label={translate(TEXTS.statiske.attachment.attachmentTitle)}
              maxLength={50}
              defaultValue={storedAttachment?.title}
              error={titleError}
              ref={(ref) => setRef(refs, `${attachment.attachmentId}-TITLE`, ref)}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                changeAttachmentValue(attachment, { value: attachmentValue, title: event.target.value }, validator)
              }
            />
          )}
          <HStack gap="space-16">
            {!requireAttachmentTitle || storedAttachment?.title?.trim() ? (
              <FileUpload.Trigger
                onSelect={selectFile}
                accept={FILE_ACCEPT}
                maxSizeInBytes={MAX_SIZE_ATTACHMENT_FILE_BYTES}
                multiple={false}
              >
                <Button
                  variant={initialUpload ? 'primary' : 'secondary'}
                  loading={loading}
                  icon={<UploadIcon aria-hidden fontSize="1.5rem" />}
                  ref={(ref) => setRef(refs, `${attachment.attachmentId}-FILE`, ref)}
                >
                  {translate(
                    initialUpload ? TEXTS.statiske.uploadFile.selectFile : TEXTS.statiske.uploadFile.uploadMoreFiles,
                  )}
                </Button>
              </FileUpload.Trigger>
            ) : (
              <Button
                variant={initialUpload ? 'primary' : 'secondary'}
                icon={<UploadIcon aria-hidden fontSize="1.5rem" />}
                ref={(ref) => setRef(refs, `${attachment.attachmentId}-FILE`, ref)}
                onClick={() =>
                  addError(
                    attachment.attachmentId,
                    translate('required', { field: translate(TEXTS.statiske.attachment.attachmentTitle) }),
                    'TITLE',
                  )
                }
              >
                {translate(TEXTS.statiske.uploadFile.selectFile)}
              </Button>
            )}
            {showDeleteAttachmentButton && onDeleteAttachment && (
              <Button variant="tertiary" onClick={() => void onDeleteAttachment(attachment.attachmentId)}>
                {translate(TEXTS.statiske.attachment.deleteAttachment)}
              </Button>
            )}
          </HStack>
          {fileError && <InlineMessage status="error">{translate(fileError, fileUploadErrorParams)}</InlineMessage>}
          <FileUploadReadMore />
        </VStack>
      )}
    </VStack>
  );
};

export default FileUploader;
