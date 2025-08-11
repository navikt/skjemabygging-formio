import { formioFormsApiUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useForm } from '../../context/form/FormContext';
import { IntroPageProvider } from './IntroPageContext';
import IntroPageDisplay from './IntroPageDisplay';

const IntroPage = () => {
  const { form } = useForm();

  return (
    <IntroPageProvider form={formioFormsApiUtils.mapNavFormToForm(form)}>
      <IntroPageDisplay />
    </IntroPageProvider>
  );
};

export default IntroPage;
