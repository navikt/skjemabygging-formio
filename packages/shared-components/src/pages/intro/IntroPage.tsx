import { formioFormsApiUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useForm } from '../../context/form/FormContext';
import { IntroPageProvider } from './IntroPageContext';
import IntroPageDynamic from './IntroPageDynamic';
import IntroPageStatic from './IntroPageStatic';
import SelectSubmissionType from './SelectSubmissionType';

const IntroPage = () => {
  const { form } = useForm();

  return (
    <IntroPageProvider form={formioFormsApiUtils.mapNavFormToForm(form)}>
      <SelectSubmissionType />
      {form.introPage?.enabled ? <IntroPageDynamic /> : <IntroPageStatic />}
    </IntroPageProvider>
  );
};

export default IntroPage;
