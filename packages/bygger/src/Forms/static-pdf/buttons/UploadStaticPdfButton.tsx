import { UploadIcon } from '@navikt/aksel-icons';
import { Button, FileObject, FileUpload } from '@navikt/ds-react';
import { ConfirmationModal, useStaticPdf } from '@navikt/skjemadigitalisering-shared-components';
import { useState } from 'react';
import { useFeedbackEmit } from '../../../context/notifications/FeedbackContext';

interface Props {
  language: string;
  languageCode: string;
  replace: boolean;
}

const UploadStaticPdfButton = ({ language, languageCode, replace }: Props) => {
  const feedbackEmit = useFeedbackEmit();
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
    } catch (_e) {
      feedbackEmit.error('Feil ved opplasting av pdf');
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
