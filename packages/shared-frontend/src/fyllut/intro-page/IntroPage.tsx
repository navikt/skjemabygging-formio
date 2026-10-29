import { useFormDefinitionPanels } from '../../context/form-definition/FormDefinitionContext';
import { useFormNavigation } from '../form-flow/useFormNavigation';
import { useFieldFocus } from '../form-page/useFieldFocus';
import IntroPageContent from './IntroPageContent';

const IntroPage = () => {
  const panels = useFormDefinitionPanels();
  const { goToPanel } = useFormNavigation('intro');
  useFieldFocus();

  return <IntroPageContent onStart={() => goToPanel(panels[0]?.key)} />;
};

export default IntroPage;
