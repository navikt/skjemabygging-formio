import { FilePdfIcon } from '@navikt/aksel-icons';
import { DownloadPdfButton } from '@navikt/skjemadigitalisering-shared-components';
import { dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useStaticPdf } from '../StaticPdfContext';

interface Props {
  languageCode: string;
}

const DownloadStaticPdfButton = ({ languageCode }: Props) => {
  const { formPath, downloadFile } = useStaticPdf();

  const getPdfContent = async () => {
    return await downloadFile(languageCode);
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
