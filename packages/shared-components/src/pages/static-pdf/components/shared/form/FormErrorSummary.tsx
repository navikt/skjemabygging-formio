import { FormErrorSummary as SharedFrontendFormErrorSummary } from '@navikt/skjemadigitalisering-shared-frontend';
import { useLanguages } from '../../../../../context/languages';
import { useInputValidation } from '../../../../../context/validator/InputValidationContext';

const FormErrorSummary = () => {
  const { errors } = useInputValidation();
  const { translate } = useLanguages();

  return <SharedFrontendFormErrorSummary errors={errors} translate={translate} />;
};

export default FormErrorSummary;
