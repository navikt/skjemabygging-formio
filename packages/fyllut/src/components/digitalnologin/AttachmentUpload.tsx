import { Button, FileObject, FileUpload, Label, Radio, RadioGroup, VStack } from '@navikt/ds-react';
import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { useState } from 'react';

type AttachmentOption = {
  label: string;
  value: string;
  upload?: boolean;
};

interface Props {
  label: string;
  options: AttachmentOption[];
  innsendingsId?: string;
  vedleggId: string;
  onUpload: (innsendingsId: string) => void;
  multiple?: boolean;
}

type Response = {
  filId: string;
  filnavn: string;
  storrelse: number;
  innsendingId: string;
  vedleggId: string;
};

const useStyles = makeStyles({
  button: {
    maxWidth: '18.75rem',
  },
});

const AttachmentUpload = ({ label, options, innsendingsId, vedleggId, onUpload, multiple = false }: Props) => {
  const [selectedOption, setSelectedOption] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [filesUploaded, setFilesUploaded] = useState<Response[]>([]);

  const styles = useStyles();

  const url = '/fyllut/api/nologin-file';
  const searchParams = `?vedleggId=${vedleggId}${innsendingsId ? `&innsendingsId=${innsendingsId}` : ''}`;

  const handleUpload = async (files: FileObject[] | null) => {
    if (!files || files.length === 0) {
      return;
    }
    setLoading(true);
    try {
      const responses: Response[] = await Promise.all(
        files.map(async ({ file }) => {
          const formData = new FormData();
          formData.append('filinnhold', file);
          const response: any = await fetch(`${url}${searchParams}`, { method: 'POST', body: formData });

          if (response.ok) {
            const responseData = await response.json();
            console.log('responseData', responseData);
            setFilesUploaded((current) => [...current, responseData]);
            return responseData;
          }
          throw new Error(`Failed to upload file: ${response.statusText}`);
        }),
      );
      onUpload(responses[0].innsendingId);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (filId: string) => {
    console.log('Deleting file with ID:', filId);
    setFilesUploaded((files) => files.filter((file) => file.filId !== filId));
  };

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
          {filesUploaded.length === 0 && (
            <FileUpload.Trigger multiple={!!innsendingsId && multiple} onSelect={handleUpload}>
              <Button className={styles.button} loading={loading}>
                Velg fil
              </Button>
            </FileUpload.Trigger>
          )}
          {filesUploaded.map(({ filId, filnavn, storrelse }) => (
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
    </VStack>
  );
};

export default AttachmentUpload;
