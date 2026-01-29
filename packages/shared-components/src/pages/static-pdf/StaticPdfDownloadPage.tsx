import { Alert, Heading, List } from '@navikt/ds-react';
import { dateUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import DownloadPdfButton from '../../components/button/DownloadPdfButton';
import { useForm } from '../../context/form/FormContext';
import { http, useAppConfig, useLanguages } from '../../index';
import FormBox from './components/shared/FormBox';

interface StaticPdfSubmissionData {
  identityType: string;
  nationalIdentityNumber: string;
  firstName: string;
  surname: string;
  address: {
    streetAddress: string;
    postalCode: string;
    postalName: string;
    countryCode: string;
  };
  attachments?: string[];
}

const StaticPdfDownloadPage = () => {
  const appConfig = useAppConfig();
  const { fyllutBaseURL } = appConfig;
  const { translate } = useLanguages();
  const { submission, form } = useForm();
  const [status, setStatus] = useState<
    | {
        message: string;
        variant: 'info' | 'error';
      }
    | undefined
  >();

  const data: StaticPdfSubmissionData = submission?.data as unknown as StaticPdfSubmissionData;
  const fileName = `${form.path}s-${dateUtils.toLocaleDate().replace(/\./g, '')}.pdf`;

  const getPdfContent = async () => {
    try {
      const content = await http.post<Blob>(
        `${fyllutBaseURL}/api/documents/application`,
        {
          form: JSON.stringify(form),
          submission: JSON.stringify(submission),
        },
        {
          Accept: http.MimeType.PDF,
        },
      );
      setStatus({
        message: translate(TEXTS.statiske.prepareLetterPage.downloadSuccess, { fileName }),
        variant: 'info',
      });

      return content;
    } catch (_) {
      setStatus({
        message: translate(TEXTS.statiske.prepareLetterPage.downloadError),
        variant: 'error',
      });
    }
  };

  return (
    <>
      <FormBox bottom="space-32">
        <DownloadPdfButton fileName={fileName} pdfContent={getPdfContent}>
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
          {data?.attachments && data?.attachments.length > 1 && (
            <List.Item>{translate(TEXTS.statiske.staticPdf.instructions.step3)}</List.Item>
          )}
          <List.Item>{translate(TEXTS.statiske.staticPdf.instructions.step4)}</List.Item>
        </List>
      </FormBox>
    </>
  );
};

export default StaticPdfDownloadPage;
