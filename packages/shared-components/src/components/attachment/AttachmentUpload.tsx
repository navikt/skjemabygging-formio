import { Alert, BodyLong, Button, FileObject, FileUpload, Label, Radio, RadioGroup, VStack } from '@navikt/ds-react';
import { useState } from 'react';
import { useSendInn } from '../../context/sendInn/sendInnContext';
import { makeStyles } from '../../index';
import { useAttachmentUpload } from './AttachmentUploadContext';

type AttachmentOption = {
  label: string;
  value: string;
  upload?: boolean;
};

interface Props {
  label: string;
  options: AttachmentOption[];
  vedleggId: string;
  multiple?: boolean;
}

const useStyles = makeStyles({
  button: {
    maxWidth: '18.75rem',
  },
});

const AttachmentUpload = ({ label, options, vedleggId, multiple = false }: Props) => {
  const [selectedOption, setSelectedOption] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const styles = useStyles();
  const { innsendingsId } = useSendInn();
  const { handleUploadFiles, handleDeleteFile, uploadedFiles, errors } = useAttachmentUpload();

  const uploadedAttachmentFiles = uploadedFiles.filter((file) => file.vedleggId === vedleggId);
  const error = errors[vedleggId];

  const handleUpload = async (files: FileObject[] | null) => {
    if (!files || files.length === 0) {
      return;
    }
    setLoading(true);
    await handleUploadFiles(vedleggId, files);
    setLoading(false);
  };

  const handleDelete = async (filId: string) => {
    await handleDeleteFile(vedleggId, filId);
  };

  //TODO: store this in context
  const uploadSelected = !!options.find((option) => option.value === selectedOption)?.upload;

  return (
    <VStack gap="8" className="mb">
      <RadioGroup legend={label} onChange={(value) => setSelectedOption(value)}>
        {options.map((option) => (
          <Radio key={option.value} value={option.value}>
            {option.label}
          </Radio>
        ))}
      </RadioGroup>
      {uploadSelected && (
        <VStack gap="4">
          <Label>Last opp bilde eller skannet kopi av ID-en din</Label>
          {uploadedAttachmentFiles.length === 0 && (
            <FileUpload.Trigger multiple={!!innsendingsId && multiple} onSelect={handleUpload}>
              <Button className={styles.button} loading={loading}>
                Velg fil
              </Button>
            </FileUpload.Trigger>
          )}
          {uploadedAttachmentFiles.map(({ filId, filnavn, storrelse }) => (
            <FileUpload.Item
              key={filId}
              file={{ name: filnavn, size: storrelse }}
              button={{
                action: 'delete',
                onClick: () => handleDelete(filId),
              }}
            ></FileUpload.Item>
          ))}
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
