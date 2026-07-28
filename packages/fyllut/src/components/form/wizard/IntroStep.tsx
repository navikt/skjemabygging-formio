import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { useFormDefinition } from '@navikt/skjemadigitalisering-shared-frontend';
import IntroPage from '../IntroPage';
import { useWizardNavigation } from './useWizardNavigation';

const IntroStep = ({ form: _form }: { form: Form }) => {
  const { panels } = useFormDefinition();
  const { goToPanel } = useWizardNavigation('intro');

  return <IntroPage onStart={() => goToPanel(panels[0]?.key)} />;
};

export default IntroStep;
