import { Alert, Heading, List } from '@navikt/ds-react';
import { CoverPageType, dateUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import DownloadPdfButton from '../../components/button/DownloadPdfButton';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import FormBox from './components/shared/FormBox';
import { useStaticPdf } from './StaticPdfContext';

interface DownloadState {
  message: string;
  variant: 'info' | 'error';
}

const StaticPdfDownloadPage = () => {
  const { translate } = useLanguages();
  const { submission, form } = useForm();
  const { downloadCoverPageAndFile } = useStaticPdf();
  const [status, setStatus] = useState<DownloadState | undefined>();

  const coverPageData = submission?.data.coverPage as unknown as CoverPageType;
  const fileName = `${form.path}s-${dateUtils.toLocaleDate().replace(/\./g, '')}.pdf`;

  console.log(coverPageData);

  const handleError = () => {
    setStatus({
      message: translate(TEXTS.statiske.prepareLetterPage.downloadError),
      variant: 'error',
    });
  };

  const handleSuccess = () => {
    setStatus({
      message: translate(TEXTS.statiske.prepareLetterPage.downloadSuccess, { fileName }),
      variant: 'info',
    });
  };

  return (
    <>
      <FormBox bottom="space-32">
        <DownloadPdfButton
          fileName={fileName}
          pdfContent={() => downloadCoverPageAndFile('nb', coverPageData)}
          onError={handleError}
          onSuccess={handleSuccess}
        >
          {translate(TEXTS.grensesnitt.downloadApplication)}
        </DownloadPdfButton>
      </FormBox>
      {status && (
        <FormBox bottom="space-32">
          <Alert variant={status.variant}>{status.message}</Alert>
        </FormBox>
      )}
      <Heading size="medium" level="2" spacing>
        {translate(TEXTS.statiske.staticPdf.instructions.title)}
      </Heading>
      <FormBox bottom="space-32">
        <List as="ol">
          <List.Item>{translate(TEXTS.statiske.staticPdf.instructions.step1)}</List.Item>
          <List.Item>{translate(TEXTS.statiske.staticPdf.instructions.step2)}</List.Item>
          {coverPageData?.attachments && coverPageData?.attachments.length > 1 && (
            <List.Item>{translate(TEXTS.statiske.staticPdf.instructions.step3)}</List.Item>
          )}
          <List.Item>{translate(TEXTS.statiske.staticPdf.instructions.step4)}</List.Item>
        </List>
      </FormBox>
    </>
  );
};

export default StaticPdfDownloadPage;
