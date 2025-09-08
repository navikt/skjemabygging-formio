import { FormSummary } from '@navikt/ds-react';
import { dateUtils, stringUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useForm } from '../../../../context/form/FormContext';
import { useLanguages } from '../../../../context/languages';
import { FormComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';
import DefaultLabel from '../../shared/form-summary/DefaultLabel';

const SummaryMonthPicker = ({ component, submissionPath }: FormComponentProps) => {
  const { submission } = useForm();
  const { currentLanguage } = useLanguages();
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined) {
    return null;
  }

  return (
    <FormSummary.Answer>
      <DefaultLabel component={component} />
      <FormSummary.Value>
        {stringUtils.toPascalCase(dateUtils.toLongMonthFormat(value, currentLanguage))}
      </FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default SummaryMonthPicker;
