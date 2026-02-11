import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import submissionTypesUtils from '../../../../shared-domain/src/utils/submissionTypesUtils';
import { useAppConfig } from '../../context/config/configContext';
import { useForm } from '../../context/form/FormContext';
import InputValidationProvider from '../../context/validator/InputValidationContext';
import { StaticPdfProvider } from './StaticPdfContext';
import StaticPdfDownloadPage from './StaticPdfDownloadPage';
import StaticPdfInputPage from './StaticPdfInputPage';
import StaticPdfNavigation from './components/StaticPdfNavigation';
import FormErrorSummary from './components/shared/form/FormErrorSummary';

type StaticPdfPage = 'input' | 'download';

const StaticPdfPage = () => {
  const [page, setPage] = useState<StaticPdfPage>('input');
  const { form } = useForm();
  const { logger } = useAppConfig();
  const navigate = useNavigate();

  useEffect(() => {
    if (form && !submissionTypesUtils.isStaticPdf(form.properties?.submissionTypes)) {
      logger?.info(`Tried to access static pdf for form ${form?.path}, but it is not enabled for this form`);
      navigate('/404');
    }
  }, [form, navigate, logger]);

  return (
    <InputValidationProvider>
      <StaticPdfProvider formPath={form.path}>
        <FormErrorSummary />
        {page === 'input' ? <StaticPdfInputPage /> : page === 'download' ? <StaticPdfDownloadPage /> : null}
        <StaticPdfNavigation page={page} setPage={setPage} />
      </StaticPdfProvider>
    </InputValidationProvider>
  );
};

export default StaticPdfPage;
export type { StaticPdfPage };
