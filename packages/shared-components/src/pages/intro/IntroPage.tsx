import { formioFormsApiUtils } from '@navikt/skjemadigitalisering-shared-domain';
import FormError from '../../components/form/FormError';
import { useForm } from '../../context/form/FormContext';
import { IntroPageProvider } from './IntroPageContext';
import IntroPageDisplay from './IntroPageDisplay';

const IntroPage = () => {
  const { form, submission } = useForm();

  return (
    <IntroPageProvider form={formioFormsApiUtils.mapNavFormToForm(form)}>
      <IntroPageDisplay />
      <FormError error={submission?.fyllutState?.mellomlagring?.error} />
    </IntroPageProvider>
  );
};

export default IntroPage;
