import { UploadIcon } from '@navikt/aksel-icons';
import { Button, FileObject, FileUpload } from '@navikt/ds-react';
import { useState } from 'react';
import { ConfirmationModal } from '../../../../index';
import { useStaticPdf } from '../../StaticPdfContext';

interface Props {
  language: string;
  languageCode: string;
  replace: boolean;
}

const UploadStaticPdfButton = ({ language, languageCode, replace }: Props) => {
  const { uploadFile } = useStaticPdf();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File>();
  const [loading, setLoading] = useState<boolean>(false);

  const handleSelect = (files: FileObject[]) => {
    const fileObject = files?.[0];
    if (!fileObject || !languageCode) {
      return;
    }

    setFile(fileObject.file);
    setOpen(true);
  };

  const handleUpload = async () => {
    if (!file) {
      return;
    }

    setLoading(true);
    try {
      await uploadFile(languageCode, file);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FileUpload.Trigger multiple={false} onSelect={handleSelect}>
        <Button
          data-color="neutral"
          icon={<UploadIcon aria-hidden />}
          size="small"
          variant="tertiary"
          loading={loading}
          data-testid={`upload-static-pdf-${languageCode}-button`}
        />
      </FileUpload.Trigger>
      <ConfirmationModal
        open={open}
        onConfirm={handleUpload}
        onClose={() => setOpen(false)}
        confirmType="danger"
        texts={
          replace
            ? {
                title: `Erstatt ${language.toLowerCase()} versjon?`,
                body: `Hvis du laster opp denne filen vil den umiddelbart erstatte den publiserte ${language.toLowerCase()}-versjonen på nav.no.`,
                confirm: 'Ja, last opp fil',
                cancel: 'Nei',
              }
            : {
                title: `Last opp ${language.toLowerCase()} versjon?`,
                body: `Hvis du laster opp denne filen vil den umiddelbart bli publisert på nav.no.`,
                confirm: 'Ja, last opp fil',
                cancel: 'Nei',
              }
        }
      />
    </>
  );
};

export default UploadStaticPdfButton;
