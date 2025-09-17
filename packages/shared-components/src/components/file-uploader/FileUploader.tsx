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
} from '@navikt/ds-react';
import { AttachmentSettingValues, SubmissionAttachment, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
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
  requireDescription?: boolean;
  multiple?: boolean;
  accept?: string;
  maxFileSizeInBytes?: number;
  maxFileSizeText?: string;
}

const FileUploader = ({
  initialAttachment,
  attachmentValue,
  requireDescription,
  multiple,
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
    uploadsInProgress,
  } = useAttachmentUpload();
  const { attachmentId } = initialAttachment;
  const attachment = submissionAttachments.find((attachment) => attachment.attachmentId === attachmentId);
  const [description, setDescription] = useState(attachment?.description ?? '');
  const [loading, setLoading] = useState(false);

  const uploadedFiles = attachment?.files ?? [];
  const initialUpload = uploadedFiles.length === 0;
  const showButton = multiple || initialUpload;
  const inProgress = Object.values(uploadsInProgress[attachmentId] ?? {});

  const error = errors[attachmentId]?.type === 'FILE' ? errors[attachmentId]?.message : undefined;
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
      {!showButton && <Label>{description}</Label>}
      {uploadedFiles.map(({ fileId, fileName, size }) => (
        <FileUpload.Item
          key={fileId}
          file={{ name: fileName, size }}
          button={{
            action: 'delete',
            onClick: () => handleDeleteFile(attachmentId, fileId, { name: fileName, size }),
          }}
          error={errors[fileId]?.message ? translate(errors[fileId].message) : undefined}
        ></FileUpload.Item>
      ))}
      {inProgress.map((file) => (
        <FileUpload.Item
          key={`${file.file.name}-${file.file.lastModified}`}
          file={file.file}
          status={file.error ? 'idle' : 'uploading'}
          error={translate(getFileValidationError(file), translationErrorParams)}
        ></FileUpload.Item>
      ))}
      {showButton && (
        <>
          {requireDescription && (
            <TextField
              label={translate(TEXTS.statiske.attachment.descriptionLabel)}
              maxLength={50}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                changeAttachmentValue(initialAttachment, attachmentValue, e.target.value);
              }}
            />
          )}
          {(!requireDescription || !!description.trim()) && (
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
          )}
          {error && (
            <Alert inline variant="error">
              {htmlUtils.isHtmlString(error) ? (
                <InnerHtml content={translate(error, translationErrorParams)}></InnerHtml>
              ) : (
                <BodyLong>{translate(error, translationErrorParams)}</BodyLong>
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
