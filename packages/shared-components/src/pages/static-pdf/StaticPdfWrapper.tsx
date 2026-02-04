import { useState } from 'react';
import { useForm } from '../../context/form/FormContext';
import InputValidationProvider from '../../context/validator/InputValidationContext';
import { StaticPdfProvider } from './StaticPdfContext';
import StaticPdfDownloadPage from './StaticPdfDownloadPage';
import StaticPdfInputPage from './StaticPdfInputPage';
import StaticPdfNavigation from './components/StaticPdfNavigation';
import FormErrorSummary from './components/shared/FormErrorSummary';

type StaticPdfPage = 'input' | 'download';

const StaticPdfPage = () => {
  const [page, setPage] = useState<StaticPdfPage>('input');
  const { form } = useForm();

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
