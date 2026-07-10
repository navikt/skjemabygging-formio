import { useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { Form, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useFormDefinition } from '@navikt/skjemadigitalisering-shared-frontend';
import IntroPage from '../IntroPage';
import WizardStep from './WizardStep';
import { useWizardNavigation } from './useWizardNavigation';

const IntroStep = ({ form }: { form: Form }) => {
  const { translate } = useLanguages();
  const { panels } = useFormDefinition();
  const { goToPanel, onStepClick } = useWizardNavigation('intro');

  return (
    <WizardStep
      form={form}
      activeIndex={0}
      pageTitle={translate(TEXTS.grensesnitt.introPage.title)}
      onStepClick={onStepClick}
    >
      <IntroPage onStart={() => goToPanel(panels[0]?.key)} />
    </WizardStep>
  );
};

export default IntroStep;
