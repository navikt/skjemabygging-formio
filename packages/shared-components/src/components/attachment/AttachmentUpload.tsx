import { UploadIcon } from '@navikt/aksel-icons';
import {
  Alert,
  BodyLong,
  Button,
  FileObject,
  FileUpload,
  Label,
  Radio,
  RadioGroup,
  TextField,
  VStack,
} from '@navikt/ds-react';
import { AttachmentOption, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import clsx from 'clsx';
import { useMemo, useState } from 'react';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import AttachmentPanel from './AttachmentPanel';
import { useAttachmentUpload } from './AttachmentUploadContext';
import { useAttachmentStyles } from './styles';

interface Props {
  label: string;
  options: AttachmentOption[];
  attachmentId: string;
  description?: string;
  className?: string;
  otherAttachment?: boolean;
}

const AttachmentUpload = ({ label, options, attachmentId, className, description, otherAttachment }: Props) => {
  const [selectedOption, setSelectedOption] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const styles = useAttachmentStyles();
  const { translate } = useLanguages();
  const { handleUploadFile, handleDeleteFile, handleDeleteAttachment, uploadedFiles, errors } = useAttachmentUpload();
  const { form } = useForm();
  const isIdUpload = attachmentId === 'personal-id';
  const uploadButtonText = isIdUpload ? TEXTS.statiske.uploadId.selectFile : TEXTS.statiske.uploadId.uploadFiles;
  const { ettersendelsesfrist: deadline } = form.properties;
  const selectedAdditionalDocumentation = useMemo(
    () => options.find((option) => option.value === selectedOption)?.additionalDocumentation,
    [options, selectedOption],
  );
  const showDeadline = selectedOption === 'ettersender' || selectedOption === 'andre';
  const uploadedAttachmentFiles = uploadedFiles.filter((file) => file.attachmentId === attachmentId);
  const error = errors[attachmentId];

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

  const uploadSelected = !!options.find((option) => option.value === selectedOption)?.upload;

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
            <FileUpload.Trigger onSelect={handleUpload}>
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

          {!isIdUpload && (
            <AttachmentPanel
              translate={translate}
              uploadedAttachmentFiles={uploadedAttachmentFiles}
              otherAttachment={otherAttachment}
              selectedOption={'nav'}
              handleUpload={handleUpload}
              handleUploadFile={handleUploadFile}
              handleUploadAnotherAttachment={handleUploadAnotherAttachment}
              deadline={deadline}
              loading={loading}
              showDeadline={showDeadline}
              selectedAdditionalDocumentation={selectedAdditionalDocumentation}
            />
          )}
        </VStack>
      )}

      {error && (
        <Alert variant="error">
          <BodyLong>{error}</BodyLong>
        </Alert>
      )}
    </VStack>
  );
};

export default AttachmentUpload;
