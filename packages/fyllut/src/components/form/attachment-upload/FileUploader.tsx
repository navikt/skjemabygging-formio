import { Button, FileItem, HStack, TextField, VStack } from '@navikt/ds-react';
import { useAppConfig, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import {
  AttachmentSettingValues,
  enableAttachmentDownload,
  navFormUtils,
  SubmissionAttachment,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import { useFormDefinition } from '@navikt/skjemadigitalisering-shared-frontend';
import { ChangeEvent, MutableRefObject, ReactNode, useCallback } from 'react';
import { useAttachmentUpload } from './AttachmentUploadContext';
import { attachmentValidator } from './attachmentValidation';
import FilesPreview from './FilesPreview';
import { fileUploadErrorParams } from './fileUploadConfig';
import UploadButton from './UploadButton';

const setFileUploaderRef = (
  refs: Props['refs'],
  key: string,
  value: HTMLInputElement | HTMLFieldSetElement | HTMLButtonElement | null,
) => {
  if (refs?.current) {
    Reflect.set(refs.current, key, value);
  }
};

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
}: Props) => {
  const { translate } = useLanguages();
  const { logEvent, submissionMethod } = useAppConfig();
  const { form } = useFormDefinition();
  const {
    changeAttachmentValue,
    handleDeleteFile,
    handleDownloadFile,
    submissionAttachments,
    errors,
    uploadsInProgress,
  } = useAttachmentUpload();
  const { attachmentId } = initialAttachment;
  const attachment = submissionAttachments.find((currentAttachment) => currentAttachment.attachmentId === attachmentId);

  const logUploadEvent = useCallback(() => {
    const formAttachment = navFormUtils
      .flattenComponents(form.components)
      .find(
        (component) => component.type === 'attachment' && navFormUtils.getNavId(component) === initialAttachment.navId,
      );
    logEvent?.({
      name: 'last opp',
      data: {
        type: 'vedlegg',
        skjemaId: form.properties.skjemanummer,
        tema: form.properties.tema,
        tittel: translate(formAttachment?.label) ?? '',
        attachmentId,
        submissionMethod,
      },
    });
  }, [attachmentId, form, initialAttachment.navId, logEvent, submissionMethod, translate]);

  const label = requireAttachmentTitle
    ? translate(attachment?.title)
    : translate(TEXTS.statiske.uploadFile.singleFileUploadedLabel);

  const uploadedFiles = attachment?.files ?? [];
  const initialUpload = uploadedFiles.length === 0;
  const showButton = multiple || initialUpload;
  const inProgress = Object.values(uploadsInProgress[attachmentId] ?? {});
  const fileItems = [...uploadedFiles, ...inProgress];

  const attachmentTitleErrorMessage = errors[attachmentId]?.find((error) => error.type === 'TITLE')?.message;
  const attachmentTitleValidator = attachmentValidator(translate, ['otherDocumentationTitle']);

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    changeAttachmentValue(
      initialAttachment,
      {
        value: attachmentValue,
        title: event.target.value,
      },
      attachmentTitleValidator,
    );
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
              label={translate(TEXTS.statiske.attachment.attachmentTitle)}
              maxLength={50}
              defaultValue={attachment?.title}
              error={attachmentTitleErrorMessage}
              ref={(ref) => setFileUploaderRef(refs, `${attachmentId}-TITLE`, ref)}
              onChange={handleTitleChange}
            />
          )}
          <HStack gap="space-16">
            <UploadButton
              attachmentId={attachmentId}
              variant={initialUpload ? 'primary' : 'secondary'}
              allowUpload={!requireAttachmentTitle || !!attachment?.title?.trim()}
              refs={refs}
              translationParams={fileUploadErrorParams}
              accept={accept}
              readMore={readMore}
              maxFileSizeInBytes={maxFileSizeInBytes}
              onSuccess={logUploadEvent}
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
