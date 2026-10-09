import { Form, ReceiptSummary } from '@navikt/skjemadigitalisering-shared-domain';
import { Route, Routes, useLocation } from 'react-router';
import ActiveTasksPage from '../active-tasks/ActiveTasksPage';
import FormPage from '../form-page/FormPage';
import IntroPage from '../intro-page/IntroPage';
import PaperSubmissionPage from '../paper-submission/PaperSubmissionPage';
import PersonalIdUploadPage from '../personal-id/PersonalIdUploadPage';
import ReceiptPage from '../receipt/ReceiptPage';
import SummaryPage from '../summary/SummaryPage';
import { APPLICATION_DOWNLOAD_KEY, PAPER_SUBMISSION_KEY, RECEIPT_KEY, SUMMARY_KEY } from './constants';
import RoutedFormFlowLayout from './RoutedFormFlowLayout';

const FormRouter = ({ form, receiptPdf }: { form: Form; receiptPdf?: Blob }) => {
  const { state } = useLocation();
  const receipt = (state as { receipt?: ReceiptSummary } | null)?.receipt;

  return (
    <Routes>
      <Route path="paabegynt" element={<ActiveTasksPage form={form} />} />
      <Route path="legitimasjon" element={<PersonalIdUploadPage />} />
      <Route element={<RoutedFormFlowLayout form={form} />}>
        <Route path="" element={<IntroPage />} />
        <Route path={SUMMARY_KEY} element={<SummaryPage />} />
        <Route path=":panelSlug" element={<FormPage />} />
      </Route>
      <Route path={RECEIPT_KEY} element={<ReceiptPage form={form} receipt={receipt} pdf={receiptPdf} />} />
      <Route path={PAPER_SUBMISSION_KEY} element={<PaperSubmissionPage documentType="application-with-cover-page" />} />
      <Route path={APPLICATION_DOWNLOAD_KEY} element={<PaperSubmissionPage documentType="application" />} />
    </Routes>
  );
};

export default FormRouter;
