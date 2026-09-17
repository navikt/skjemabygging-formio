import { Form, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { useFormDefinitionPanels } from '../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { useValidationActions, useValidationPagesWithErrors } from '../../context/validation/ValidationContext';
import { INTRO_KEY, SUMMARY_KEY } from './constants';
import FormFlowLayout from './FormFlowLayout';

const RoutedFormFlowLayout = ({ form }: { form: Form }) => {
  const { translate } = useLanguage();
  const panels = useFormDefinitionPanels();
  const { pathname, search, state } = useLocation();
  const navigate = useNavigate();
  const { hideErrorSummary } = useValidationActions();
  const pagesWithErrors = useValidationPagesWithErrors();
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
    hideErrorSummary();
    const { redirect: _inheritedRedirect, stepperOpen: _stepperOpen, ...inheritedState } = state ?? {};
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

export default RoutedFormFlowLayout;
