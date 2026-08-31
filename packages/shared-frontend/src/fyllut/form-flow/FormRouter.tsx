import { Form, ReceiptSummary, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { Outlet, Route, Routes, useLocation, useNavigate } from 'react-router';
import { useFormDefinition } from '../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { useValidation } from '../../context/validation/ValidationContext';
import { withoutSubmissionNavigationState } from '../../utils/navigationState';
import ActiveTasksPage from '../active-tasks/ActiveTasksPage';
import FormPage from '../form-page/FormPage';
import IntroPage from '../intro-page/IntroPage';
import PaperSubmissionPage from '../paper-submission/PaperSubmissionPage';
import PersonalIdUploadPage from '../personal-id/PersonalIdUploadPage';
import ReceiptPage from '../receipt/ReceiptPage';
import SummaryPage from '../summary/SummaryPage';
import { APPLICATION_DOWNLOAD_KEY, INTRO_KEY, PAPER_SUBMISSION_KEY, RECEIPT_KEY, SUMMARY_KEY } from './constants';
import FormFlowLayout from './FormFlowLayout';

const RoutedFormFlowLayout = ({ form }: { form: Form }) => {
  const { translate } = useLanguage();
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
        pathname: key === INTRO_KEY ? `/${form.path}` : `/${form.path}/${key}`,
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
    <FormFlowLayout form={form} activeIndex={activeIndex} pageTitle={pageTitle} onStepClick={onStepClick}>
      <Outlet />
    </FormFlowLayout>
  );
};

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
