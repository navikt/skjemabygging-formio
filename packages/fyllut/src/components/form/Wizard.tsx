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
import { useState } from 'react';
import IntroPage from './IntroPage';
import Summary from './Summary';

const INTRO_KEY = 'introduksjon';
const SUMMARY_KEY = 'oppsummering';

interface Props {
  form: Form;
}

const Wizard = ({ form }: Props) => {
  const { translate } = useLanguages();
  const { currentPanel, components, isFirst, isLast, goToNext, goToPrevious, goTo, panels, currentIndex } =
    useWizardController();
  const [showIntro, setShowIntro] = useState(true);
  const [showSummary, setShowSummary] = useState(false);

  const leadingSteps = [{ key: INTRO_KEY, label: TEXTS.grensesnitt.introPage.title }];
  // activeIndex is 0-based across: [intro, ...panels, summary]
  const activeIndex = showIntro ? 0 : showSummary ? 1 + panels.length : 1 + currentIndex;

  const handleStepClick = (key: string, _index: number) => {
    if (key === INTRO_KEY) {
      setShowSummary(false);
      setShowIntro(true);
    } else if (key === SUMMARY_KEY) {
      setShowIntro(false);
      setShowSummary(true);
    } else {
      setShowIntro(false);
      setShowSummary(false);
      goTo(key);
    }
  };

  const handleNext = () => {
    const valid = goToNext();
    if (valid && isLast) {
      setShowSummary(true);
    }
  };

  const stepper = (pageTitle: string) => (
    <>
      <FormHeader form={form} pageTitle={pageTitle} />
      <FormStepper
        activeIndex={activeIndex}
        leadingSteps={leadingSteps}
        trailingSteps={[{ key: SUMMARY_KEY, label: translate('Oppsummering') }]}
        onStepClick={handleStepClick}
      />
    </>
  );

  if (showIntro) {
    return (
      <>
        {stepper(translate(TEXTS.grensesnitt.introPage.title))}
        <IntroPage onStart={() => setShowIntro(false)} />
      </>
    );
  }

  if (showSummary) {
    return (
      <>
        {stepper(translate('Oppsummering'))}
        <Summary onBack={() => setShowSummary(false)} />
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
            <FormPrevButton
              label={translate(TEXTS.grensesnitt.navigation.previous)}
              onClick={() => setShowIntro(true)}
            />
          ) : (
            <FormPrevButton label={translate(TEXTS.grensesnitt.navigation.previous)} onClick={goToPrevious} />
          )
        }
        nextButton={<FormNextButton label={translate(TEXTS.grensesnitt.navigation.next)} onClick={handleNext} />}
      />
    </>
  );
};

export default Wizard;
