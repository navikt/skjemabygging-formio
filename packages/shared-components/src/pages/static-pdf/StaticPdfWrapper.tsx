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
