import { useFormDefinition } from '../../context/form-definition/FormDefinitionContext';
import IntroPage from '../IntroPage';
import { useWizardNavigation } from './useWizardNavigation';

const IntroStep = () => {
  const { panels } = useFormDefinition();
  const { goToPanel } = useWizardNavigation('intro');

  return <IntroPage onStart={() => goToPanel(panels[0]?.key)} />;
};

export default IntroStep;
