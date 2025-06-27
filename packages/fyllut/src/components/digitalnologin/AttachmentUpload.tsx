import { Button, FileObject, FileUpload, Label, Radio, RadioGroup, VStack } from '@navikt/ds-react';
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

const AttachmentUpload = ({ label, options, innsendingsId, vedleggId, onUpload, multiple = false }: Props) => {
  const [selectedOption, setSelectedOption] = useState<string>();

  const handleUpload = async (files: FileObject[] | null) => {
    if (!files || files.length === 0) {
      return;
    }
    const formData = new FormData();
    try {
      const file = files[0].file;
      formData.append('filinnhold', file);
      const response: any = await fetch(
        `/fyllut/api/nologin-file?vedleggId=${vedleggId}${innsendingsId ? `&innsendingsId=${innsendingsId}` : ''}`,
        { method: 'POST', body: formData },
      );

      if (response.ok) {
        const responseData = await response.json();
        return onUpload(responseData);
      }
      throw new Error(`Failed to upload file: ${response.statusText}`);
    } catch (e) {
      console.error(e);
    }
  };

  const uploadSelected = !!options.find((option) => option.value === selectedOption)?.upload;

  return (
    <VStack gap="4" className="mb">
      <RadioGroup legend={label} onChange={(value) => setSelectedOption(value)}>
        {options.map((option) => (
          <Radio key={option.value} value={option.value}>
            {option.label}
          </Radio>
        ))}
      </RadioGroup>
      {uploadSelected && (
        <VStack gap="2">
          <Label>Last opp bilde eller skannet kopi av ID-en din</Label>
          <FileUpload.Trigger multiple={multiple} onSelect={handleUpload}>
            <Button>Velg fil</Button>
          </FileUpload.Trigger>
        </VStack>
      )}
    </VStack>
  );
};

export default AttachmentUpload;
