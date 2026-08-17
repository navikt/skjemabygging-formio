import { Form, ReceiptSummary, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { Outlet, Route, Routes, useLocation, useNavigate } from 'react-router';
import { useFyllutLanguage } from '../../context/fyllut/FyllutLanguageContext';
import { useFormDefinition, useValidation } from '../framework';
import { withoutSubmissionNavigationState } from '../navigationState';
import ReceiptStep from '../receipt/ReceiptStep';
import { PREPARE_LETTER_KEY, PREPARE_NO_SUBMISSION_KEY, RECEIPT_KEY, SUMMARY_KEY } from './constants';
import IntroStep from './IntroStep';
import PanelStep from './PanelStep';
import PrepareSubmissionStep from './PrepareSubmissionStep';
import SummaryStep from './SummaryStep';
import WizardStep from './WizardStep';

const WizardLayout = ({ form }: { form: Form }) => {
  const { translate } = useFyllutLanguage();
  const { panels } = useFormDefinition();
  const { pathname, search, state } = useLocation();
  const navigate = useNavigate();
  const { pagesWithErrors, hideSummary } = useValidation();
  const routeKey = pathname.slice(`/${form.path}`.length).replace(/^\//, '');
  const panelIndex = panels.findIndex((panel) => panel.key === routeKey);

  const activeIndex =
    routeKey === '' ? 0 : routeKey === SUMMARY_KEY ? 1 + panels.length : panelIndex >= 0 ? 1 + panelIndex : 0;

  const pageTitle =
    routeKey === ''
      ? translate(TEXTS.grensesnitt.introPage.title)
      : routeKey === SUMMARY_KEY
        ? translate(TEXTS.statiske.summaryPage.title)
        : translate(panels[panelIndex]?.title ?? '');

  const onStepClick = (key: string) => {
    hideSummary();
    const {
      redirect: _inheritedRedirect,
      stepperOpen: _stepperOpen,
      ...inheritedState
    } = withoutSubmissionNavigationState(state);
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

const Wizard = ({ form, receiptPdf }: { form: Form; receiptPdf?: Blob }) => {
  const { state } = useLocation();
  const receipt = (state as { receipt?: ReceiptSummary } | null)?.receipt;

  return (
    <Routes>
      <Route element={<WizardLayout form={form} />}>
        <Route path="" element={<IntroStep />} />
        <Route path={SUMMARY_KEY} element={<SummaryStep />} />
        <Route path=":panelSlug" element={<PanelStep />} />
      </Route>
      <Route path={RECEIPT_KEY} element={<ReceiptStep form={form} receipt={receipt} pdf={receiptPdf} />} />
      <Route path={PREPARE_LETTER_KEY} element={<PrepareSubmissionStep type="cover-page-and-application" />} />
      <Route path={PREPARE_NO_SUBMISSION_KEY} element={<PrepareSubmissionStep type="application" />} />
    </Routes>
  );
};

export default Wizard;
