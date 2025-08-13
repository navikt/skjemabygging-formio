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
  Radio,
  RadioGroup,
  ReadMore,
  Textarea,
  TextField,
  VStack,
} from '@navikt/ds-react';
import { AttachmentOption, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import clsx from 'clsx';
import { useState } from 'react';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import { useSendInn } from '../../context/sendInn/sendInnContext';
import makeStyles from '../../util/styles/jss/jss';
import { useAttachmentUpload } from './AttachmentUploadContext';

interface Props {
  label: string;
  options: AttachmentOption[];
  attachmentId: string;
  multiple?: boolean;
  description?: string;
  isIdUpload?: boolean;
  className?: string;
  otherAttachment?: boolean;
}

const useStyles = makeStyles({
  button: {
    maxWidth: '18.75rem',
    borderRadius: 'var(--a-border-radius-large)',
  },
  deleteAllButton: {
    display: 'flex',
    alignSelf: 'flex-end',
  },
  addAnotherAttachmentButton: {},
});

const AttachmentUpload = ({
  label,
  options,
  attachmentId,
  multiple = false,
  className,
  description,
  isIdUpload,
  otherAttachment,
}: Props) => {
  const [selectedOption, setSelectedOption] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const styles = useStyles();
  const { translate } = useLanguages();
  const { innsendingsId } = useSendInn();
  const { handleUploadFiles, handleDeleteFile, handleDeleteAttachment, uploadedFiles, errors } = useAttachmentUpload();
  const { form } = useForm();

  const uploadedAttachmentFiles = uploadedFiles.filter((file) => file.attachmentId === attachmentId);
  const error = errors[attachmentId];

  const selectedAdditionalDocumentation = options.find(
    (option) => option.value === selectedOption,
  )?.additionalDocumentation;

  const handleUpload = async (files: FileObject[] | null) => {
    if (!files || files.length === 0) {
      return;
    }
    setLoading(true);
    await handleUploadFiles(attachmentId, files);
    setLoading(false);
  };

  const handleDelete = async (fileId: string) => {
    await handleDeleteFile(attachmentId, fileId);
  };

  //TODO: store this in context
  const uploadSelected = !!options.find((option) => option.value === selectedOption)?.upload;

  const uploadButtonText = isIdUpload ? TEXTS.statiske.uploadId.selectFile : TEXTS.statiske.uploadId.uploadFiles;
  const deadline = form.properties?.ettersendelsesfrist;
  const showDeadline = selectedOption === 'ettersender' || selectedOption === 'andre';

  const handleDeleteAllAttachments = async (attachmentId: string) => {
    await handleDeleteAttachment(attachmentId);
  };

  const handleUploadAnotherAttachment = () => null;

  return (
    <VStack gap="8" className={clsx('mb', className)}>
      <RadioGroup
        legend={label}
        onChange={(value) => setSelectedOption(value)}
        description={description}
        value={selectedOption}
      >
        {!uploadedAttachmentFiles.length &&
          options.map((option) => (
            <Radio key={option.value} value={option.value}>
              {option.label}
            </Radio>
          ))}
      </RadioGroup>
      {uploadSelected && (
        <VStack gap="4">
          {isIdUpload && <Label>Last opp bilde eller skannet kopi av ID-en din</Label>}

          {otherAttachment && selectedOption === 'leggerVedNaa' && (
            <TextField label={TEXTS.statiske.attachment.descriptionLabel} size="small" maxLength={50} />
          )}
          {uploadedAttachmentFiles.length === 0 && (
            <FileUpload.Trigger multiple={!!innsendingsId && multiple} onSelect={handleUpload}>
              {
                <Button
                  className={styles.button}
                  loading={loading}
                  icon={<UploadIcon title="a11y-title" fontSize="1.5rem" />}
                >
                  {translate(uploadButtonText)}
                </Button>
              }
            </FileUpload.Trigger>
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
          {uploadedAttachmentFiles.length > 0 && (
            <FileUpload.Trigger multiple={!!innsendingsId && multiple} onSelect={handleUpload}>
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

      {error && (
        <Alert variant="error">
          <BodyLong>{error}</BodyLong>
        </Alert>
      )}

      {showDeadline && deadline && (
        <Alert variant="warning" inline>
          {translate(TEXTS.statiske.attachment.deadline, { deadline })}
        </Alert>
      )}

      {selectedAdditionalDocumentation && (
        <Textarea
          label={translate(selectedAdditionalDocumentation.label)}
          description={translate(selectedAdditionalDocumentation.description)}
          maxLength={200}
        />
      )}
    </VStack>
  );
};

export default AttachmentUpload;
