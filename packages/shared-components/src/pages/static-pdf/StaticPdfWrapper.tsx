import { submissionTypesUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAppConfig } from '../../context/config/configContext';
import { useForm } from '../../context/form/FormContext';
import InputValidationProvider from '../../context/validator/InputValidationContext';
import { StaticPdfProvider, useStaticPdf } from './StaticPdfContext';
import StaticPdfDownloadPage from './StaticPdfDownloadPage';
import StaticPdfInputPage from './StaticPdfInputPage';
import StaticPdfNavigation from './components/StaticPdfNavigation';
import FormErrorSummary from './components/shared/form/FormErrorSummary';

type StaticPdfPage = 'input' | 'download';

interface StaticPdfPageContentProps {
  page: StaticPdfPage;
  setPage: (page: StaticPdfPage) => void;
}

const StaticPdfPageContent = ({ page, setPage }: StaticPdfPageContentProps) => {
  const { form } = useForm();
  const { logger } = useAppConfig();
  const navigate = useNavigate();
  const { filteredAttachments, isEttersending } = useStaticPdf();

  useEffect(() => {
    if (form && !submissionTypesUtils.isStaticPdf(form.properties?.submissionTypes)) {
      logger?.info(`Tried to access static pdf for form ${form?.path}, but it is not enabled for this form`);
      navigate('/404');
    } else if (isEttersending && filteredAttachments.length === 0) {
      logger?.info(
        `Tried to access static pdf ettersending for form ${form.path}, but it has no selectable attachments`,
      );
      navigate('/404');
    }
  }, [filteredAttachments.length, form, isEttersending, navigate, logger]);

  return (
    <>
      <FormErrorSummary />
      {page === 'input' ? <StaticPdfInputPage /> : page === 'download' ? <StaticPdfDownloadPage /> : null}
      <StaticPdfNavigation page={page} setPage={setPage} />
    </>
  );
};

const StaticPdfPage = () => {
  const [page, setPage] = useState<StaticPdfPage>('input');
  const { form } = useForm();
  const [searchParams] = useSearchParams();
  const isEttersending = searchParams.get('type') === 'ettersending';

  return (
    <InputValidationProvider>
      <StaticPdfProvider formPath={form.path} isEttersending={isEttersending}>
        <StaticPdfPageContent page={page} setPage={setPage} />
      </StaticPdfProvider>
    </InputValidationProvider>
  );
};

export default StaticPdfPage;
export type { StaticPdfPage };
