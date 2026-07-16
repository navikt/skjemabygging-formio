import { useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import { Form, navFormUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useFormDefinition } from '@navikt/skjemadigitalisering-shared-frontend';
import Summary from '../Summary';
import WizardStep from './WizardStep';
import { ATTACHMENTS_KEY } from './constants';
import { useWizardNavigation } from './useWizardNavigation';

const SummaryStep = ({ form }: { form: Form }) => {
  const { translate } = useLanguages();
  const { panels } = useFormDefinition();
  const { goToPanel, goToError, onStepClick } = useWizardNavigation('summary');
  const hasAttachmentStep = navFormUtils.hasAttachment(form);

  return (
    <WizardStep
      form={form}
      activeIndex={1 + panels.length + (hasAttachmentStep ? 1 : 0)}
      pageTitle={translate(TEXTS.statiske.summaryPage.title)}
      onStepClick={onStepClick}
    >
      <Summary
        onBack={() => goToPanel(hasAttachmentStep ? ATTACHMENTS_KEY : panels[panels.length - 1]?.key)}
        onNavigateToError={(pageKey, id) => goToError(pageKey, id)}
        onNavigateToStep={(stepKey) => goToPanel(stepKey)}
      />
    </WizardStep>
  );
};

export default SummaryStep;
