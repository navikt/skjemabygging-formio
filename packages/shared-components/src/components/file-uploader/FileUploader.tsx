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
import { useLocation } from 'react-router-dom';
import {
  FILE_ACCEPT,
  MAX_SIZE_ATTACHMENT_FILE_BYTES,
  MAX_SIZE_ATTACHMENT_FILE_TEXT,
  MAX_TOTAL_SIZE_ATTACHMENT_FILES_TEXT,
} from '../../constants/fileUpload';
import { useAppConfig } from '../../context/config/configContext';
import { useForm } from '../../context/form/FormContext';
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
  refs?: MutableRefObject<Record<string, HTMLInputElement | HTMLFieldSetElement | HTMLButtonElement | null>>;
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
  const config = useAppConfig();
  const form = useForm();
  const { search } = useLocation();
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
  const label = requireAttachmentTitle
    ? translate(attachment?.title)
    : translate(TEXTS.statiske.uploadFile.singleFileUploadedLabel);
  const [loading, setLoading] = useState(false);

  const uploadedFiles = attachment?.files ?? [];
  const initialUpload = uploadedFiles.length === 0;
  const showButton = multiple || initialUpload;
  const inProgress = Object.values(uploadsInProgress[attachmentId] ?? {});

  const uploadErrorMessage = errors[attachmentId]?.find((error) => error.type === 'FILE')?.message;
  const attachmentTitleErrorMessage = errors[attachmentId]?.find((error) => error.type === 'TITLE')?.message;

  const translationErrorParams = {
    href: `${config.baseUrl}/${form.form.path}/legitimasjon${search}`,
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
      {!showButton && <Label>{label}</Label>}
      {[...uploadedFiles, ...inProgress].length > 0 && (
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
      )}
      {showButton && (
        <>
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
              onChange={(e) => {
                changeAttachmentValue(initialAttachment, {
                  value: attachmentValue,
                  title: e.target.value,
                });
              }}
            />
          )}
          {!requireAttachmentTitle || !!attachment?.title?.trim() ? (
            <FileUpload.Trigger onSelect={onSelect} accept={accept} maxSizeInBytes={maxFileSizeInBytes}>
              <Button
                variant={initialUpload ? 'primary' : 'secondary'}
                className={styles.button}
                loading={loading}
                icon={<UploadIcon aria-hidden fontSize="1.5rem" />}
                ref={(ref) => {
                  if (refs?.current) {
                    refs.current[`${attachmentId}-FILE`] = ref;
                  }
                }}
              >
                {translate(
                  initialUpload ? TEXTS.statiske.uploadFile.selectFile : TEXTS.statiske.uploadFile.uploadMoreFiles,
                )}
              </Button>
            </FileUpload.Trigger>
          ) : (
            <Button
              variant={initialUpload ? 'primary' : 'secondary'}
              className={styles.button}
              icon={<UploadIcon aria-hidden fontSize="1.5rem" />}
              ref={(ref) => {
                if (refs?.current) {
                  refs.current[`${attachmentId}-FILE`] = ref;
                }
              }}
              onClick={() =>
                addError(
                  attachmentId,
                  translate('required', { field: translate(TEXTS.statiske.attachment.attachmentTitle) }),
                  'TITLE',
                )
              }
            >
              {translate(
                initialUpload ? TEXTS.statiske.uploadFile.selectFile : TEXTS.statiske.uploadFile.uploadMoreFiles,
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
