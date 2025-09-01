import { UploadIcon } from '@navikt/aksel-icons';
import {
  Alert,
  BodyLong,
  BodyShort,
  Button,
  FileObject,
  FileUpload,
  HStack,
  ReadMore,
  TextField,
} from '@navikt/ds-react';
import { AttachmentSettingValues, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { useLanguages } from '../../context/languages';
import { htmlUtils, makeStyles } from '../../index';
import { useAttachmentUpload } from '../attachment/AttachmentUploadContext';
import InnerHtml from '../inner-html/InnerHtml';

const useStyles = makeStyles({
  button: {
    maxWidth: '18.75rem',
    borderRadius: 'var(--a-border-radius-large)',
  },
});

interface Props {
  attachmentId: string;
  attachmentValue?: keyof AttachmentSettingValues;
  requireDescription?: boolean;
  multiple?: boolean;
}

const FileUploader = ({ attachmentId, attachmentValue, requireDescription, multiple }: Props) => {
  const { translate } = useLanguages();
  const styles = useStyles();
  const { handleUploadFile, changeAttachmentValue, handleDeleteFile, submissionAttachments, errors } =
    useAttachmentUpload();
  const attachment = submissionAttachments.find((attachment) => attachment.attachmentId === attachmentId);
  const [description, setDescription] = useState(attachment?.description ?? '');
  const [loading, setLoading] = useState(false);
  const uploadedFiles = attachment?.files ?? [];
  const error = errors[attachmentId]?.type === 'FILE' ? errors[attachmentId]?.message : undefined;

  const initialUpload = uploadedFiles.length === 0;
  const showButton = multiple || initialUpload;

  const onSelect = async (files: FileObject[]) => {
    setLoading(true);
    const file = files?.[0];
    if (!file) {
      return;
    }
    await handleUploadFile(attachmentId, file);
    setLoading(false);
  };

  return (
    <>
      {uploadedFiles.map(({ fileId, fileName, size }) => (
        <FileUpload.Item
          key={fileId}
          file={{ name: fileName, size: size }}
          button={{
            action: 'delete',
            onClick: () => handleDeleteFile(attachmentId, fileId),
          }}
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
                changeAttachmentValue(attachmentId, attachmentValue, e.target.value);
              }}
            />
          )}
          <FileUpload.Trigger onSelect={onSelect}>
            <Button
              variant={initialUpload ? 'primary' : 'secondary'}
              className={styles.button}
              loading={loading}
              icon={<UploadIcon title="a11y-title" fontSize="1.5rem" />}
            >
              {translate(
                initialUpload ? TEXTS.statiske.uploadId.selectFile : TEXTS.statiske.attachment.uploadMoreFiles,
              )}
            </Button>
          </FileUpload.Trigger>
          {error && (
            <Alert inline variant="error">
              {htmlUtils.isHtmlString(error) ? (
                <InnerHtml content={translate(error, { url: window.location.href })}></InnerHtml>
              ) : (
                <BodyLong>{translate(error)}</BodyLong>
              )}
            </Alert>
          )}
          <ReadMore header={translate(TEXTS.statiske.attachment.sizeAndFormatHeader)}>
            <HStack gap="2" align="start">
              <BodyShort weight="semibold">{translate(TEXTS.statiske.attachment.validFormatsLabel)}</BodyShort>
              <BodyLong>{translate(TEXTS.statiske.attachment.validFormatsDescrption)}</BodyLong>
              <BodyShort weight="semibold">{translate(TEXTS.statiske.attachment.maxFileSizeLabel)}</BodyShort>
              <BodyLong>{translate(TEXTS.statiske.attachment.maxFileSizeDescription)}</BodyLong>
            </HStack>
          </ReadMore>
        </>
      )}
    </>
  );
};

export default FileUploader;
