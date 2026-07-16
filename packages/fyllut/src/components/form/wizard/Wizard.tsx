import { Form, ReceiptSummary } from '@navikt/skjemadigitalisering-shared-domain';
import { Route, Routes, useLocation } from 'react-router';
import ReceiptStep from '../receipt/ReceiptStep';
import AttachmentStep from './AttachmentStep';
import { ATTACHMENTS_KEY, PREPARE_LETTER_KEY, PREPARE_NO_SUBMISSION_KEY, RECEIPT_KEY, SUMMARY_KEY } from './constants';
import IntroStep from './IntroStep';
import PanelStep from './PanelStep';
import PrepareSubmissionStep from './PrepareSubmissionStep';
import SummaryStep from './SummaryStep';

const Wizard = ({ form }: { form: Form }) => {
  const { state } = useLocation();
  const receipt = (state as { receipt?: ReceiptSummary } | null)?.receipt;
  const pdfBase64 = (state as { pdfBase64?: string } | null)?.pdfBase64;

  return (
    <Routes>
      <Route path="" element={<IntroStep form={form} />} />
      <Route path={ATTACHMENTS_KEY} element={<AttachmentStep form={form} />} />
      <Route path={SUMMARY_KEY} element={<SummaryStep form={form} />} />
      <Route path={RECEIPT_KEY} element={<ReceiptStep form={form} receipt={receipt} pdfBase64={pdfBase64} />} />
      <Route path={PREPARE_LETTER_KEY} element={<PrepareSubmissionStep type="cover-page-and-application" />} />
      <Route path={PREPARE_NO_SUBMISSION_KEY} element={<PrepareSubmissionStep type="application" />} />
      <Route path=":panelSlug" element={<PanelStep form={form} />} />
    </Routes>
  );
};

export default Wizard;
