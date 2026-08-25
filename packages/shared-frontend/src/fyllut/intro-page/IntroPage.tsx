import { useFormDefinition } from '../../context/form-definition/FormDefinitionContext';
import { useFormNavigation } from '../form-flow/useFormNavigation';
import IntroPageContent from './IntroPageContent';

const IntroPage = () => {
  const { panels } = useFormDefinition();
  const { goToPanel } = useFormNavigation('intro');

  return <IntroPageContent onStart={() => goToPanel(panels[0]?.key)} />;
};

export default IntroPage;
