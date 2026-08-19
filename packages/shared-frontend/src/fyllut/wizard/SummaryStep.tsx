import { useFormDefinition } from '../framework';
import Summary from '../Summary';
import { useWizardNavigation } from './useWizardNavigation';

const SummaryStep = () => {
  const { panels } = useFormDefinition();
  const { goToPanel, goToError } = useWizardNavigation('summary');

  return (
    <Summary
      onBack={() => goToPanel(panels[panels.length - 1]?.key)}
      onNavigateToError={(pageKey, id) => goToError(pageKey, id)}
      onNavigateToStep={(stepKey) => goToPanel(stepKey)}
    />
  );
};

export default SummaryStep;
