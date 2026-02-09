import { FilePdfIcon } from '@navikt/aksel-icons';
import { DownloadPdfButton, useStaticPdf } from '@navikt/skjemadigitalisering-shared-components';
import { dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useFeedbackEmit } from '../../../context/notifications/FeedbackContext';

interface Props {
  languageCode: string;
}

const DownloadStaticPdfButton = ({ languageCode }: Props) => {
  const feedbackEmit = useFeedbackEmit();
  const { formPath, downloadFile } = useStaticPdf();

  const getPdfContent = async () => {
    try {
      return await downloadFile(languageCode);
    } catch (_e) {
      feedbackEmit.error('Feil ved nedlasting av pdf');
    }
  };

  const fileName = `${formPath}-${languageCode}-${dateUtils.toLocaleDate().replace(/\./g, '')}.pdf`;

  return (
    <DownloadPdfButton
      icon={<FilePdfIcon aria-hidden />}
      fileName={fileName}
      size="small"
      pdfContent={getPdfContent}
      variant="tertiary-neutral"
      dataTestId={`download-static-pdf-${languageCode}-button`}
    />
  );
};

export default DownloadStaticPdfButton;
