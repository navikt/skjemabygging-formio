import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { useForm } from '../../context/form/FormContext';
import InputValidationProvider from '../../context/validator/InputValidationContext';
import { StaticPdfProvider } from './StaticPdfContext';
import StaticPdfPageContent from './StaticPdfPageContent';

type StaticPdfPage = 'input' | 'download';

const StaticPdfPage = () => {
  const [page, setPage] = useState<StaticPdfPage>('input');
  const { form } = useForm();
  const [searchParams] = useSearchParams();
  const attachmentFilter = searchParams.get('filter');
  const isSubsequentSubmission = searchParams.get('type') === 'ettersending';

  return (
    <InputValidationProvider>
      <StaticPdfProvider
        attachmentFilter={attachmentFilter}
        components={form.components}
        formPath={form.path}
        isSubsequentSubmission={isSubsequentSubmission}
      >
        <StaticPdfPageContent page={page} setPage={setPage} />
      </StaticPdfProvider>
    </InputValidationProvider>
  );
};

export default StaticPdfPage;
export type { StaticPdfPage };
