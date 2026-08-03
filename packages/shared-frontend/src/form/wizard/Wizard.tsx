import { Form, navFormUtils, ReceiptSummary, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { Outlet, Route, Routes, useLocation, useNavigate } from 'react-router';
import { useFyllutLanguage } from '../../context/fyllut/FyllutLanguageContext';
import { useFormDefinition, useSubmissionState, useValidation } from '../framework';
import ReceiptStep from '../receipt/ReceiptStep';
import AttachmentStep from './AttachmentStep';
import { ATTACHMENTS_KEY, PREPARE_LETTER_KEY, PREPARE_NO_SUBMISSION_KEY, RECEIPT_KEY, SUMMARY_KEY } from './constants';
import IntroStep from './IntroStep';
import PanelStep from './PanelStep';
import PrepareSubmissionStep from './PrepareSubmissionStep';
import SummaryStep from './SummaryStep';
import WizardStep from './WizardStep';

const WizardLayout = ({ form }: { form: Form }) => {
  const { translate } = useFyllutLanguage();
  const { form: formDefinition, panels } = useFormDefinition();
  const { submission } = useSubmissionState();
  const { pathname, search, state } = useLocation();
  const navigate = useNavigate();
  const { pagesWithErrors, hideSummary } = useValidation();
  const routeKey = pathname.slice(`/${form.path}`.length).replace(/^\//, '');
  const attachmentPanel = navFormUtils.getActiveAttachmentPanelFromForm(formDefinition, submission);
  const hasAttachmentStep = navFormUtils.hasAttachment(form);
  const panelIndex = panels.findIndex((panel) => panel.key === routeKey);

  const activeIndex =
    routeKey === ''
      ? 0
      : routeKey === ATTACHMENTS_KEY
        ? 1 + panels.length
        : routeKey === SUMMARY_KEY
          ? 1 + panels.length + (hasAttachmentStep ? 1 : 0)
          : panelIndex >= 0
            ? 1 + panelIndex
            : 0;

  const pageTitle =
    routeKey === ''
      ? translate(TEXTS.grensesnitt.introPage.title)
      : routeKey === ATTACHMENTS_KEY
        ? translate(attachmentPanel?.title ?? TEXTS.statiske.attachment.title)
        : routeKey === SUMMARY_KEY
          ? translate(TEXTS.statiske.summaryPage.title)
          : translate(panels[panelIndex]?.title ?? '');

  const onStepClick = (key: string) => {
    hideSummary();
    const {
      redirect: _inheritedRedirect,
      stepperOpen: _stepperOpen,
      ...inheritedState
    } = typeof state === 'object' && state ? (state as Record<string, unknown>) : {};
    navigate(
      {
        pathname: key === '' ? `/${form.path}` : `/${form.path}/${key}`,
        search,
      },
      {
        state: {
          ...inheritedState,
          validationErrorPages: Array.from(pagesWithErrors),
        },
      },
    );
  };

  return (
    <WizardStep form={form} activeIndex={activeIndex} pageTitle={pageTitle} onStepClick={onStepClick}>
      <Outlet />
    </WizardStep>
  );
};

const Wizard = ({ form }: { form: Form }) => {
  const { state } = useLocation();
  const receipt = (state as { receipt?: ReceiptSummary } | null)?.receipt;
  const pdfBase64 = (state as { pdfBase64?: string } | null)?.pdfBase64;

  return (
    <Routes>
      <Route element={<WizardLayout form={form} />}>
        <Route path="" element={<IntroStep form={form} />} />
        <Route path={ATTACHMENTS_KEY} element={<AttachmentStep form={form} />} />
        <Route path={SUMMARY_KEY} element={<SummaryStep form={form} />} />
        <Route path=":panelSlug" element={<PanelStep form={form} />} />
      </Route>
      <Route path={RECEIPT_KEY} element={<ReceiptStep form={form} receipt={receipt} pdfBase64={pdfBase64} />} />
      <Route path={PREPARE_LETTER_KEY} element={<PrepareSubmissionStep type="cover-page-and-application" />} />
      <Route path={PREPARE_NO_SUBMISSION_KEY} element={<PrepareSubmissionStep type="application" />} />
    </Routes>
  );
};

export default Wizard;
