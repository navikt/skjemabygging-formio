import { Button, FileItem, HStack, VStack } from '@navikt/ds-react';
import {
  AttachmentSettingValues,
  enableAttachmentDownload,
  SubmissionAttachment,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import { MutableRefObject, ReactNode } from 'react';
import TextField from '../../../components/text-field/TextField';
import { useLanguage } from '../../../context/language/LanguageContext';
import { useSubmissionMethod } from '../../../context/submission-method/SubmissionMethodContext';
import { useAttachmentUpload } from '../context/AttachmentUploadContext';
import { fileUploadErrorParams } from '../context/fileUploadConfig';
import FilesPreview from './FilesPreview';
import UploadButton from './UploadButton';
import useAttachmentValidation from './useAttachmentValidation';

interface Props {
  initialAttachment: SubmissionAttachment;
  attachmentValue?: keyof AttachmentSettingValues;
  requireAttachmentTitle?: boolean;
  showDeleteAttachmentButton?: boolean;
  onDeleteAttachment?: (attachmentId: string) => Promise<void>;
  multiple?: boolean;
  refs?: MutableRefObject<Record<string, HTMLInputElement | HTMLFieldSetElement | HTMLButtonElement | null>>;
  readMore?: ReactNode;
  accept?: string;
  maxFileSizeInBytes?: number;
  onUpload?: (attachment: SubmissionAttachment) => void;
}

const FileUploader = ({
  initialAttachment,
  attachmentValue,
  requireAttachmentTitle,
  showDeleteAttachmentButton,
  onDeleteAttachment,
  multiple,
  refs,
  readMore,
  accept,
  maxFileSizeInBytes,
  onUpload,
}: Props) => {
  const { submissionMethod } = useSubmissionMethod();
  const { translate } = useLanguage();
  const { changeAttachmentValue, handleDeleteFile, handleDownloadFile, submissionAttachments, uploadsInProgress } =
    useAttachmentUpload();
  const { attachmentId } = initialAttachment;
  const { getAttachmentError, getAttachmentExternalError } = useAttachmentValidation(submissionAttachments);
  const attachment = submissionAttachments.find((currentAttachment) => currentAttachment.attachmentId === attachmentId);

  const label = requireAttachmentTitle
    ? translate(attachment?.title)
    : translate(TEXTS.statiske.uploadFile.singleFileUploadedLabel);

  const uploadedFiles = attachment?.files ?? [];
  const initialUpload = uploadedFiles.length === 0;
  const showButton = multiple || initialUpload;
  const inProgress = Object.values(uploadsInProgress[attachmentId] ?? {});
  const fileItems = [...uploadedFiles, ...inProgress];

  const attachmentTitleErrorMessage =
    getAttachmentError(attachmentId, 'title') ?? getAttachmentExternalError(attachmentId, 'title');
  const handleTitleChange = (title: string) => {
    changeAttachmentValue(initialAttachment, {
      value: attachmentValue,
      title,
    });
  };

  const handleDeleteFileItem = (fileId: string, file: FileItem) => {
    if (attachment?.type === 'other' && onDeleteAttachment) {
      return onDeleteAttachment(attachmentId);
    }
    return handleDeleteFile(attachmentId, fileId, file);
  };

  const handleDownloadFileItem = (fileId: string, fileName: string) => {
    return handleDownloadFile(attachmentId, fileId, fileName);
  };

  return (
    <VStack gap="space-24" data-cy={`upload-button-${attachmentId}`}>
      {(!showButton || fileItems.length > 0) && (
        <FilesPreview
          label={!showButton ? label : undefined}
          uploaded={uploadedFiles}
          inProgress={inProgress}
          onDeleteFileItem={handleDeleteFileItem}
          onDownloadFileItem={enableAttachmentDownload(submissionMethod) ? handleDownloadFileItem : undefined}
          translationParams={fileUploadErrorParams}
        />
      )}
      {showButton && (
        <VStack gap="space-32">
          {requireAttachmentTitle && (
            <TextField
              statePath={`attachments.${attachmentId}.title`}
              label={translate(TEXTS.statiske.attachment.attachmentTitle)}
              maxLength={50}
              value={attachment?.title ?? ''}
              error={attachmentTitleErrorMessage}
              onChange={handleTitleChange}
            />
          )}
          <HStack gap="space-16">
            <UploadButton
              attachmentId={attachmentId}
              statePath={`attachments.${attachmentId}.files`}
              variant={initialUpload ? 'primary' : 'secondary'}
              allowUpload={!requireAttachmentTitle || !!attachment?.title?.trim()}
              refs={refs}
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
