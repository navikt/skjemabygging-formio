import { useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { Form, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useFormDefinition } from '@navikt/skjemadigitalisering-shared-frontend';
import Summary from '../Summary';
import WizardStep from './WizardStep';
import { useWizardNavigation } from './useWizardNavigation';

const SummaryStep = ({ form }: { form: Form }) => {
  const { translate } = useLanguages();
  const { panels } = useFormDefinition();
  const { goToPanel, goToError, onStepClick } = useWizardNavigation('summary');

  return (
    <WizardStep
      form={form}
      activeIndex={1 + panels.length}
      pageTitle={translate(TEXTS.statiske.summaryPage.title)}
      onStepClick={onStepClick}
    >
      <Summary
        onBack={() => goToPanel(panels[panels.length - 1]?.key)}
        onNavigateToError={(pageKey, id) => goToError(pageKey, id)}
      />
    </WizardStep>
  );
};

export default SummaryStep;
