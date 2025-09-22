import { UploadIcon } from '@navikt/aksel-icons';
import {
  Alert,
  BodyLong,
  BodyShort,
  Button,
  FileObject,
  FileUpload,
  HStack,
  Label,
  ReadMore,
  TextField,
  VStack,
} from '@navikt/ds-react';
import { AttachmentSettingValues, SubmissionAttachment, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { MutableRefObject, useState } from 'react';
import {
  FILE_ACCEPT,
  MAX_SIZE_ATTACHMENT_FILE_BYTES,
  MAX_SIZE_ATTACHMENT_FILE_TEXT,
  MAX_TOTAL_SIZE_ATTACHMENT_FILES_TEXT,
} from '../../constants/fileUpload';
import { useLanguages } from '../../context/languages';
import { getFileValidationError } from '../../util/form/attachment-validation/attachmentValidation';
import htmlUtils from '../../util/html/htmlUtils';
import makeStyles from '../../util/styles/jss/jss';
import { useAttachmentUpload } from '../attachment/AttachmentUploadContext';
import InnerHtml from '../inner-html/InnerHtml';

const useStyles = makeStyles({
  button: {
    maxWidth: '18.75rem',
    borderRadius: 'var(--a-border-radius-large)',
  },
});

interface Props {
  initialAttachment: SubmissionAttachment;
  attachmentValue?: keyof AttachmentSettingValues;
  requireAttachmentTitle?: boolean;
  multiple?: boolean;
  refs?: MutableRefObject<Record<string, HTMLInputElement | HTMLFieldSetElement | null>>;
  accept?: string;
  maxFileSizeInBytes?: number;
  maxFileSizeText?: string;
}

const FileUploader = ({
  initialAttachment,
  attachmentValue,
  requireAttachmentTitle,
  multiple,
  refs,
  accept = FILE_ACCEPT,
  maxFileSizeInBytes = MAX_SIZE_ATTACHMENT_FILE_BYTES,
  maxFileSizeText = MAX_SIZE_ATTACHMENT_FILE_TEXT,
}: Props) => {
  const { translate } = useLanguages();
  const styles = useStyles();
  const {
    handleUploadFile,
    changeAttachmentValue,
    handleDeleteFile,
    submissionAttachments,
    errors,
    addError,
    uploadsInProgress,
  } = useAttachmentUpload();
  const { attachmentId } = initialAttachment;
  const attachment = submissionAttachments.find((attachment) => attachment.attachmentId === attachmentId);
  const attachmentTitle = attachment?.additionalDocumentationTitle;
  const [loading, setLoading] = useState(false);

  const uploadedFiles = attachment?.files ?? [];
  const initialUpload = uploadedFiles.length === 0;
  const showButton = multiple || initialUpload;
  const inProgress = Object.values(uploadsInProgress[attachmentId] ?? {});

  const uploadErrorMessage = errors[attachmentId]?.find((error) => error.type === 'FILE')?.message;
  const descriptionErrorMessage = errors[attachmentId]?.find((error) => error.type === 'DESCRIPTION')?.message;
  const restartHref =
    window.location.pathname.replace(/\/[^/]+$/, '/legitimasjon') + window.location.search + window.location.hash;
  const translationErrorParams = {
    href: restartHref,
    maxFileSize: MAX_SIZE_ATTACHMENT_FILE_TEXT,
    maxAttachmentSize: MAX_TOTAL_SIZE_ATTACHMENT_FILES_TEXT,
  };

  const onSelect = async (files: FileObject[]) => {
    setLoading(true);
    const file = files?.[0];
    if (!file) {
      setLoading(false);
      return;
    }
    await handleUploadFile(attachmentId, file);
    setLoading(false);
  };

  return (
    <>
      {!showButton && <Label>{attachmentTitle}</Label>}
      <FileUpload translations={{ item: { uploading: translate(TEXTS.statiske.uploadFile.uploading) } }}>
        <VStack gap="4" as="ul">
          {uploadedFiles.map(({ fileId, fileName, size }) => (
            <FileUpload.Item
              as="li"
              key={fileId}
              file={{ name: fileName, size }}
              button={{
                action: 'delete',
                onClick: () => handleDeleteFile(attachmentId, fileId, { name: fileName, size }),
              }}
              error={errors[fileId]?.[0].message ? translate(errors[fileId][0].message) : undefined}
            ></FileUpload.Item>
          ))}
          {inProgress.map((file) => (
            <FileUpload.Item
              as="li"
              key={`${file.file.name}-${file.file.lastModified}`}
              file={file.file}
              status={file.error ? 'idle' : 'uploading'}
              error={translate(getFileValidationError(file), translationErrorParams)}
            ></FileUpload.Item>
          ))}
        </VStack>
      </FileUpload>
      {showButton && (
        <>
          {requireAttachmentTitle && (
            <TextField
              label={translate(TEXTS.statiske.attachment.descriptionLabel)}
              maxLength={50}
              value={attachmentTitle}
              error={descriptionErrorMessage}
              ref={(ref) => {
                if (refs?.current) {
                  refs.current[`${attachmentId}-DESCRIPTION`] = ref;
                }
              }}
              onChange={(e) => {
                changeAttachmentValue(initialAttachment, attachmentValue, {
                  additionalDocumentationTitle: e.target.value,
                });
              }}
            />
          )}
          {!requireAttachmentTitle || !!attachmentTitle?.trim() ? (
            <FileUpload.Trigger onSelect={onSelect} accept={accept} maxSizeInBytes={maxFileSizeInBytes}>
              <Button
                variant={initialUpload ? 'primary' : 'secondary'}
                className={styles.button}
                loading={loading}
                icon={<UploadIcon aria-hidden fontSize="1.5rem" />}
              >
                {translate(
                  initialUpload ? TEXTS.statiske.uploadId.selectFile : TEXTS.statiske.attachment.uploadMoreFiles,
                )}
              </Button>
            </FileUpload.Trigger>
          ) : (
            <Button
              variant={initialUpload ? 'primary' : 'secondary'}
              className={styles.button}
              icon={<UploadIcon aria-hidden fontSize="1.5rem" />}
              onClick={() =>
                addError(
                  attachmentId,
                  translate('required', { field: translate(TEXTS.statiske.attachment.descriptionLabel) }),
                  'DESCRIPTION',
                )
              }
            >
              {translate(
                initialUpload ? TEXTS.statiske.uploadId.selectFile : TEXTS.statiske.attachment.uploadMoreFiles,
              )}
            </Button>
          )}
          {uploadErrorMessage && (
            <Alert inline variant="error">
              {htmlUtils.isHtmlString(uploadErrorMessage) ? (
                <InnerHtml content={translate(uploadErrorMessage, translationErrorParams)}></InnerHtml>
              ) : (
                <BodyLong>{translate(uploadErrorMessage, translationErrorParams)}</BodyLong>
              )}
            </Alert>
          )}
          <ReadMore header={translate(TEXTS.statiske.attachment.sizeAndFormatHeader)}>
            <HStack gap="2" align="start">
              <BodyShort weight="semibold">{translate(TEXTS.statiske.attachment.validFormatsLabel)}</BodyShort>
              <BodyLong>{translate(TEXTS.statiske.attachment.validFormatsDescrption)}</BodyLong>
              <BodyShort weight="semibold">{translate(TEXTS.statiske.attachment.maxFileSizeLabel)}</BodyShort>
              <BodyLong>
                {translate(TEXTS.statiske.attachment.maxFileSizeDescription, { size: maxFileSizeText })}
              </BodyLong>
            </HStack>
          </ReadMore>
        </>
      )}
    </>
  );
};

export default FileUploader;
