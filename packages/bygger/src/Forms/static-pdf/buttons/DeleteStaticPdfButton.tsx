import { TrashIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';
import { ConfirmationModal, useStaticPdf } from '@navikt/skjemadigitalisering-shared-components';
import { useState } from 'react';
import { useFeedbackEmit } from '../../../context/notifications/FeedbackContext';

interface Props {
  language: string;
  languageCode: string;
}

const DeleteStaticPdfButton = ({ language, languageCode }: Props) => {
  const feedbackEmit = useFeedbackEmit();
  const { deleteFile } = useStaticPdf();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteFile(languageCode);
    } catch (_e) {
      feedbackEmit.error('Feil ved sletting av pdf');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        data-color="neutral"
        icon={<TrashIcon aria-hidden />}
        size="small"
        variant="tertiary"
        loading={loading}
        onClick={() => setOpen(true)}
        data-testid={`delete-static-pdf-${languageCode}-button`}
      />
      <ConfirmationModal
        open={open}
        onConfirm={handleDelete}
        onClose={() => setOpen(false)}
        confirmType="danger"
        texts={{
          title: `Avpubliser ${language.toLowerCase()} versjon?`,
          body: 'Hvis du sletter denne filen vil den umiddelbart fjernes fra nav.no',
          confirm: 'Ja, avpubliser',
          cancel: 'Nei',
        }}
      />
    </>
  );
};

export default DeleteStaticPdfButton;
