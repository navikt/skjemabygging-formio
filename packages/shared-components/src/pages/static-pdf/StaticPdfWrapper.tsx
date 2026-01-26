import { useState } from 'react';
import InputValidationProvider from '../../context/validator/InputValidationContext';
import StaticPdfDownloadPage from './StaticPdfDownloadPage';
import StaticPdfInputPage from './StaticPdfInputPage';
import StaticPdfNavigation from './components/StaticPdfNavigation';
import FormErrorSummary from './components/shared/FormErrorSummary';

type StaticPdfPage = 'input' | 'download';

const StaticPdfPage = () => {
  const [page, setPage] = useState<StaticPdfPage>('input');

  return (
    <InputValidationProvider>
      <FormErrorSummary />
      {page === 'input' ? <StaticPdfInputPage /> : page === 'download' ? <StaticPdfDownloadPage /> : null}
      <StaticPdfNavigation page={page} setPage={setPage} />
    </InputValidationProvider>
  );
};

export default StaticPdfPage;
export type { StaticPdfPage };
