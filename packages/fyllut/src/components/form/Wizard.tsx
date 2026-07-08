import { useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { Form, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import {
  FormButtonRow,
  FormErrorSummary,
  FormHeader,
  FormNextButton,
  FormPrevButton,
  FormStepper,
  RenderInputForm,
  useWizardController,
} from '@navikt/skjemadigitalisering-shared-frontend';
import { useCallback, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import IntroPage from './IntroPage';
import Summary from './Summary';

const INTRO_KEY = 'introduksjon';
const SUMMARY_KEY = 'oppsummering';

interface Props {
  form: Form;
}

const Wizard = ({ form }: Props) => {
  const { translate } = useLanguages();
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = useParams();
  const routeStep = useMemo(() => params['*']?.split('/').filter(Boolean)[0], [params]);
  const showIntro = !routeStep;
  const showSummary = routeStep === SUMMARY_KEY;
  const requestedPanelKey = !showIntro && !showSummary ? routeStep : undefined;
  const { currentPanel, components, isFirst, isLast, goToNext, goToPrevious, goTo, panels, currentIndex } =
    useWizardController(requestedPanelKey);

  const leadingSteps = [{ key: INTRO_KEY, label: TEXTS.grensesnitt.introPage.title }];
  // activeIndex is 0-based across: [intro, ...panels, summary]
  const activeIndex = showIntro ? 0 : showSummary ? 1 + panels.length : 1 + currentIndex;

  const navigateToStep = useCallback(
    (stepKey?: string) => {
      navigate({ pathname: stepKey ? `/${form.path}/${stepKey}` : `/${form.path}`, search });
    },
    [form.path, navigate, search],
  );

  useEffect(() => {
    if (!requestedPanelKey || panels.length === 0) {
      return;
    }
    if (!panels.some((panel) => panel.key === requestedPanelKey)) {
      navigateToStep(panels[0].key);
    }
  }, [navigateToStep, panels, requestedPanelKey]);

  const handleStepClick = (key: string, _index: number) => {
    if (key === INTRO_KEY) {
      navigateToStep();
    } else if (key === SUMMARY_KEY) {
      navigateToStep(SUMMARY_KEY);
    } else {
      goTo(key);
      navigateToStep(key);
    }
  };

  const handleNext = () => {
    const valid = goToNext();
    if (!valid) {
      return;
    }
    if (isLast) {
      navigateToStep(SUMMARY_KEY);
      return;
    }
    navigateToStep(panels[currentIndex + 1]?.key);
  };

  const stepper = (pageTitle: string) => (
    <>
      <FormHeader form={form} pageTitle={pageTitle} />
      <FormStepper
        activeIndex={activeIndex}
        leadingSteps={leadingSteps}
        trailingSteps={[{ key: SUMMARY_KEY, label: TEXTS.statiske.summaryPage.title }]}
        onStepClick={handleStepClick}
      />
    </>
  );

  if (showIntro) {
    return (
      <>
        {stepper(translate(TEXTS.grensesnitt.introPage.title))}
        <IntroPage onStart={() => navigateToStep(panels[0]?.key)} />
      </>
    );
  }

  if (showSummary) {
    return (
      <>
        {stepper(translate(TEXTS.statiske.summaryPage.title))}
        <Summary onBack={() => navigateToStep(panels[panels.length - 1]?.key)} />
      </>
    );
  }

  return (
    <>
      {stepper(translate(currentPanel?.title ?? ''))}
      <RenderInputForm components={components} />
      <FormErrorSummary />
      <FormButtonRow
        previousButton={
          isFirst ? (
            <FormPrevButton label={translate(TEXTS.grensesnitt.navigation.previous)} onClick={() => navigateToStep()} />
          ) : (
            <FormPrevButton
              label={translate(TEXTS.grensesnitt.navigation.previous)}
              onClick={() => {
                goToPrevious();
                navigateToStep(panels[currentIndex - 1]?.key);
              }}
            />
          )
        }
        nextButton={<FormNextButton label={translate(TEXTS.grensesnitt.navigation.next)} onClick={handleNext} />}
      />
    </>
  );
};

export default Wizard;
