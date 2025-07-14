import { formioFormsApiUtils } from '@navikt/skjemadigitalisering-shared-domain';
import FormError from '../../components/form/FormError';
import { useForm } from '../../context/form/FormContext';
import { IntroPageProvider } from './IntroPageContext';
import IntroPageDynamic from './IntroPageDynamic';
import IntroPageStatic from './IntroPageStatic';
import SelectSubmissionType from './SelectSubmissionType';

const IntroPage = () => {
  const { form, submission } = useForm();

  return (
    <IntroPageProvider form={formioFormsApiUtils.mapNavFormToForm(form)}>
      <SelectSubmissionType />
      {form.introPage?.enabled ? <IntroPageDynamic /> : <IntroPageStatic />}
      <FormError error={submission?.fyllutState?.mellomlagring?.error} />
    </IntroPageProvider>
  );
};

export default IntroPage;
