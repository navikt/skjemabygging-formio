import { TextField, VStack } from '@navikt/ds-react';
import { AttachmentSettingValues, SubmissionAttachment, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { ChangeEvent, MutableRefObject, ReactNode } from 'react';
import { useLocation } from 'react-router';
import { MAX_SIZE_ATTACHMENT_FILE_TEXT, MAX_TOTAL_SIZE_ATTACHMENT_FILES_TEXT } from '../../constants/fileUpload';
import { useAppConfig } from '../../context/config/configContext';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import { useAttachmentUpload } from '../attachment/AttachmentUploadContext';
import { attachmentValidator } from '../attachment/attachmentValidator';
import FilesPreview from './FilesPreview';
import UploadButton from './UploadButton';

interface Props {
  initialAttachment: SubmissionAttachment;
  attachmentValue?: keyof AttachmentSettingValues;
  requireAttachmentTitle?: boolean;
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
  multiple,
  refs,
  readMore,
  accept,
  maxFileSizeInBytes,
}: Props) => {
  const { translate } = useLanguages();
  const config = useAppConfig();
  const form = useForm();
  const { search } = useLocation();
  const { changeAttachmentValue, submissionAttachments, errors, uploadsInProgress } = useAttachmentUpload();
  const { attachmentId } = initialAttachment;
  const attachment = submissionAttachments.find((attachment) => attachment.attachmentId === attachmentId);
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

  const translationErrorParams = {
    href: `${config.baseUrl}/${form.form.path}/legitimasjon${search}`,
    maxFileSize: MAX_SIZE_ATTACHMENT_FILE_TEXT,
    maxAttachmentSize: MAX_TOTAL_SIZE_ATTACHMENT_FILES_TEXT,
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    changeAttachmentValue(
      initialAttachment,
      {
        value: attachmentValue,
        title: e.target.value,
      },
      attachmentTitleValidator,
    );
  };

  return (
    <VStack gap="6" data-cy={`upload-button-${attachmentId}`}>
      {(!showButton || fileItems.length > 0) && (
        <FilesPreview
          attachmentId={attachmentId}
          label={!showButton ? label : undefined}
          uploaded={uploadedFiles}
          inProgress={inProgress}
          translationParams={translationErrorParams}
        />
      )}
      {showButton && (
        <VStack gap="8">
          {requireAttachmentTitle && (
            <TextField
              label={translate(TEXTS.statiske.attachment.attachmentTitle)}
              maxLength={50}
              defaultValue={attachment?.title}
              error={attachmentTitleErrorMessage}
              ref={(ref) => {
                if (refs?.current) {
                  refs.current[`${attachmentId}-TITLE`] = ref;
                }
              }}
              onChange={handleTitleChange}
            />
          )}
          <UploadButton
            attachmentId={attachmentId}
            variant={initialUpload ? 'primary' : 'secondary'}
            allowUpload={!requireAttachmentTitle || !!attachment?.title?.trim()}
            refs={refs}
            translationParams={translationErrorParams}
            accept={accept}
            readMore={readMore}
            maxFileSizeInBytes={maxFileSizeInBytes}
          />
        </VStack>
      )}
    </VStack>
  );
};

export default FileUploader;
