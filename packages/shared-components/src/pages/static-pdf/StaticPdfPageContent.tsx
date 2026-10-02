import { submissionTypesUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAppConfig } from '../../context/config/configContext';
import { useForm } from '../../context/form/FormContext';
import type { StaticPdfPage } from './StaticPdfWrapper';
import { useStaticPdf } from './StaticPdfContext';
import StaticPdfDownloadPage from './StaticPdfDownloadPage';
import StaticPdfInputPage from './StaticPdfInputPage';
import StaticPdfNavigation from './components/StaticPdfNavigation';
import FormErrorSummary from './components/shared/form/FormErrorSummary';

interface Props {
  page: StaticPdfPage;
  setPage: (page: StaticPdfPage) => void;
}

const StaticPdfPageContent = ({ page, setPage }: Props) => {
  const { form } = useForm();
  const { logger } = useAppConfig();
  const navigate = useNavigate();
  const { filteredAttachments, isSubsequentSubmission } = useStaticPdf();

  useEffect(() => {
    if (form && !submissionTypesUtils.isStaticPdf(form.properties?.submissionTypes)) {
      logger?.info(`Tried to access static pdf for form ${form?.path}, but it is not enabled for this form`);
      navigate('/404');
    } else if (isSubsequentSubmission && filteredAttachments.length === 0) {
      logger?.info(
        `Tried to access static pdf ettersending for form ${form.path}, but it has no selectable attachments`,
      );
      navigate('/404');
    }
  }, [filteredAttachments.length, form, isSubsequentSubmission, navigate, logger]);

  return (
    <>
      <FormErrorSummary />
      {page === 'input' ? <StaticPdfInputPage /> : page === 'download' ? <StaticPdfDownloadPage /> : null}
      <StaticPdfNavigation page={page} setPage={setPage} />
    </>
  );
};

export default StaticPdfPageContent;
