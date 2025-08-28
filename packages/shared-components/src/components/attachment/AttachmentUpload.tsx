import { PlusIcon, UploadIcon } from '@navikt/aksel-icons';
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
import {
  AttachmentSettingValues,
  attachmentUtils,
  ComponentValue,
  SubmissionAttachmentValue,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import clsx from 'clsx';
import { useState } from 'react';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import { htmlUtils } from '../../index';
import InnerHtml from '../inner-html/InnerHtml';
import Attachment from './Attachment';
import { useAttachmentUpload } from './AttachmentUploadContext';
import { useAttachmentStyles } from './styles';

interface Props {
  label: string;
  attachmentValues?: AttachmentSettingValues | ComponentValue[];
  attachmentId: string;
  description?: string;
  className?: string;
  otherAttachment?: boolean;
}

const AttachmentUpload = ({
  label,
  attachmentValues,
  attachmentId,
  description,
  otherAttachment,
  className,
}: Props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const styles = useAttachmentStyles();
  const { translate } = useLanguages();
  const {
    changeAttachmentValue,
    handleUploadFile,
    handleDeleteAttachment,
    handleDeleteFile,
    submissionAttachments,
    errors,
  } = useAttachmentUpload();
  const { form } = useForm();
  const attachment = submissionAttachments.find((attachment) => attachment.attachmentId === attachmentId);
  const [value, setValue] = useState<keyof AttachmentSettingValues | undefined>(attachment?.value);
  const [descriptionText, setDescriptionText] = useState(attachment?.description);

  const isIdUpload = attachmentId === 'personal-id';
  const uploadedAttachmentFiles = attachment?.files ?? [];
  const options = attachmentUtils.mapKeysToOptions(attachmentValues, translate);
  const uploadSelected = !!options.find((option) => option.value === value)?.upload;
  const error = errors[attachmentId];

  const handleValueChange = (value: SubmissionAttachmentValue) => {
    setValue(value.key);
    setDescriptionText(value?.additionalDocumentation);
    if (isIdUpload) {
      changeAttachmentValue(attachmentId, undefined, options.find((option) => option.value === value.key)?.label);
    } else {
      changeAttachmentValue(attachmentId, value.key, value.additionalDocumentation);
    }
  };

  const handleUpload = async (fileList: FileObject[] | null) => {
    const file = fileList?.[0];
    if (!file) {
      return;
    }
    setLoading(true);
    await handleUploadFile(attachmentId, file);
    setLoading(false);
  };

  const handleDelete = async (fileId: string) => {
    await handleDeleteFile(attachmentId, fileId);
  };

  const handleDeleteAllAttachments = async (attachmentId: string) => {
    await handleDeleteAttachment(attachmentId);
  };

  const [otherAttachmentInputs, setOtherAttachmentInputs] = useState<
    {
      description: string;
      uploaded: boolean;
    }[]
  >([{ description: '', uploaded: false }]);

  const handleUploadAnotherAttachment = () => {
    setOtherAttachmentInputs([...otherAttachmentInputs, { description: '', uploaded: false }]);
  };
  return (
    <VStack gap="8" className={clsx('mb', className)}>
      <Attachment
        title={label}
        description={description}
        error={error?.type === 'INPUT' && error.message}
        value={value ? { key: value, additionalDocumentation: descriptionText } : undefined}
        hideOptions={uploadedAttachmentFiles.length > 0}
        attachmentValues={attachmentValues}
        onChange={handleValueChange}
        translate={translate}
        deadline={form.properties?.ettersendelsesfrist}
      />
      {uploadSelected && (
        <VStack gap="4">
          {isIdUpload && <Label>{translate(TEXTS.statiske.uploadId.selectFileLabel)}</Label>}

          {!otherAttachment && uploadedAttachmentFiles.length < 1 && (
            <FileUpload.Trigger onSelect={handleUpload}>
              <Button
                className={styles.button}
                loading={loading}
                icon={<UploadIcon title="a11y-title" fontSize="1.5rem" />}
              >
                {translate(TEXTS.statiske.uploadId.selectFile)}
              </Button>
            </FileUpload.Trigger>
          )}

          {otherAttachment &&
            attachment?.value === 'leggerVedNaa' &&
            otherAttachmentInputs.map(
              (input, idx) =>
                !input.uploaded && (
                  <VStack key={idx} gap="4">
                    <TextField
                      label={TEXTS.statiske.attachment.descriptionLabel}
                      size="small"
                      maxLength={50}
                      value={input.description}
                      onChange={(e) => {
                        const newInputs = [...otherAttachmentInputs];
                        newInputs[idx].description = e.target.value;
                        setOtherAttachmentInputs(newInputs);
                      }}
                    />
                    <FileUpload.Trigger
                      onSelect={async (fileList) => {
                        if (!input.description) return;
                        await handleUpload(fileList);
                        const newInputs = [...otherAttachmentInputs];
                        newInputs[idx].uploaded = true;
                        setOtherAttachmentInputs(newInputs);
                      }}
                    >
                      <Button
                        className={styles.button}
                        loading={loading}
                        icon={<UploadIcon title="a11y-title" fontSize="1.5rem" />}
                      >
                        {translate(TEXTS.statiske.uploadId.selectFile)}
                      </Button>
                    </FileUpload.Trigger>
                    {error?.type === 'FILE' && (
                      <Alert variant="error">
                        {htmlUtils.isHtmlString(error.message) ? (
                          <InnerHtml content={translate(error.message, { url: window.location.href })}></InnerHtml>
                        ) : (
                          <BodyLong>{translate(error.message)}</BodyLong>
                        )}
                      </Alert>
                    )}
                  </VStack>
                ),
            )}
          <div className={styles.uploadedFilesHeader}>
            {uploadedAttachmentFiles.length > 0 && (
              <Label>{translate(TEXTS.statiske.attachment.filesUploadedNotSent)}</Label>
            )}
            {uploadedAttachmentFiles.length > 1 && (
              <Button
                variant="tertiary"
                onClick={() => handleDeleteAllAttachments(attachmentId)}
                className={styles.deleteAllButton}
              >
                {translate(TEXTS.statiske.attachment.deleteAllFiles)}
              </Button>
            )}
          </div>
          {uploadedAttachmentFiles.map(({ fileId, fileName, size }) => (
            <FileUpload.Item
              key={fileId}
              file={{ name: fileName, size: size }}
              button={{
                action: 'delete',
                onClick: () => handleDelete(fileId),
              }}
            ></FileUpload.Item>
          ))}
          {!isIdUpload && !otherAttachment && uploadedAttachmentFiles.length > 0 && (
            <FileUpload.Trigger onSelect={handleUpload}>
              {
                <Button
                  variant="secondary"
                  className={styles.button}
                  loading={loading}
                  icon={<UploadIcon title="a11y-title" fontSize="1.5rem" />}
                >
                  {translate(TEXTS.statiske.attachment.uploadMoreFiles)}
                </Button>
              }
            </FileUpload.Trigger>
          )}
          {error?.type === 'FILE' && (
            <Alert variant="error">
              {htmlUtils.isHtmlString(error.message) ? (
                <InnerHtml content={translate(error.message, { url: window.location.href })}></InnerHtml>
              ) : (
                <BodyLong>{translate(error.message)}</BodyLong>
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

          {otherAttachment && (
            <Button
              variant="tertiary"
              onClick={() => handleUploadAnotherAttachment()}
              className={styles.addAnotherAttachmentButton}
              icon={<PlusIcon title="a11y-title" fontSize="1.5rem" />}
            >
              {translate(TEXTS.statiske.attachment.addNewAttachment)}
            </Button>
          )}
        </VStack>
      )}
    </VStack>
  );
};

export default AttachmentUpload;
