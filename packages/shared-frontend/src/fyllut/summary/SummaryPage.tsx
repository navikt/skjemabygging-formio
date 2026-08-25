import { useFormDefinition } from '../../context/form-definition/FormDefinitionContext';
import { useFormNavigation } from '../form-flow/useFormNavigation';
import SummaryContent from './SummaryContent';

const SummaryPage = () => {
  const { panels } = useFormDefinition();
  const { goToPanel, goToError } = useFormNavigation('summary');

  return (
    <SummaryContent
      onBack={() => goToPanel(panels[panels.length - 1]?.key)}
      onNavigateToError={(pageKey, id) => goToError(pageKey, id)}
      onNavigateToStep={(stepKey) => goToPanel(stepKey)}
    />
  );
};

export default SummaryPage;
