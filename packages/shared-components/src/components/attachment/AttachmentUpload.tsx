import { Alert, BodyLong, Button, FileObject, FileUpload, Label, Radio, RadioGroup, VStack } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { useLanguages } from '../../context/languages';
import makeStyles from '../../util/styles/jss/jss';
import { useAttachmentUpload } from './AttachmentUploadContext';

type AttachmentOption = {
  label: string;
  value: string;
  upload?: boolean;
};

interface Props {
  label: string;
  options: AttachmentOption[];
  attachmentId: string;
}

const useStyles = makeStyles({
  button: {
    maxWidth: '18.75rem',
  },
});

const AttachmentUpload = ({ label, options, attachmentId }: Props) => {
  const [selectedOption, setSelectedOption] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const styles = useStyles();
  const { translate } = useLanguages();
  const { handleUploadFile, handleDeleteFile, uploadedFiles, errors } = useAttachmentUpload();

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

  return (
    <VStack gap="8" className="mb">
      {uploadedAttachmentFiles.length === 0 && (
        <RadioGroup legend={label} defaultValue={selectedOption} onChange={(value) => setSelectedOption(value)}>
          {options.map((option) => (
            <Radio key={option.value} value={option.value}>
              {option.label}
            </Radio>
          ))}
        </RadioGroup>
      )}
      <VStack gap="4">
        {uploadSelected && (
          <>
            <Label>Last opp bilde eller skannet kopi av ID-en din</Label>
            {uploadedAttachmentFiles.length === 0 && (
              <FileUpload.Trigger onSelect={handleUpload}>
                <Button className={styles.button} loading={loading}>
                  {translate(TEXTS.statiske.uploadId.selectFile)}
                </Button>
              </FileUpload.Trigger>
            )}
          </>
        )}
        {uploadedAttachmentFiles.map(({ fileId, fileName, size }) => (
          <FileUpload.Item
            key={fileId}
            file={{ name: fileName, size: size }}
            button={{
              action: 'delete',
              onClick: () => handleDelete(fileId),
            }}
          />
        ))}
      </VStack>
      {error && (
        <Alert variant="error">
          <BodyLong>{error}</BodyLong>
        </Alert>
      )}
    </VStack>
  );
};

export default AttachmentUpload;
