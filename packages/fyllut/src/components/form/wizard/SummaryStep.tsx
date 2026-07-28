import { Form, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useFormDefinition } from '@navikt/skjemadigitalisering-shared-frontend';
import Summary from '../Summary';
import { ATTACHMENTS_KEY } from './constants';
import { useWizardNavigation } from './useWizardNavigation';

const SummaryStep = ({ form }: { form: Form }) => {
  const { panels } = useFormDefinition();
  const { goToPanel, goToError } = useWizardNavigation('summary');
  const hasAttachmentStep = navFormUtils.hasAttachment(form);

  return (
    <Summary
      onBack={() => goToPanel(hasAttachmentStep ? ATTACHMENTS_KEY : panels[panels.length - 1]?.key)}
      onNavigateToError={(pageKey, id) => goToError(pageKey, id)}
      onNavigateToStep={(stepKey) => goToPanel(stepKey)}
    />
  );
};

export default SummaryStep;
