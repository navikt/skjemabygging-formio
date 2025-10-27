import { FormSummary } from '@navikt/ds-react';
import { formatPhoneNumber } from '@navikt/skjemadigitalisering-shared-domain';
import { useForm } from '../../../../context/form/FormContext';
import { FormComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';
import DefaultLabel from '../../shared/form-summary/DefaultLabel';

const SummaryPhoneNumber = ({ component, submissionPath }: FormComponentProps) => {
  const { showAreaCode } = component;
  const { submission } = useForm();
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined || (showAreaCode && (value.areaCode === undefined || value.number === undefined))) {
    return null;
  }

  const phoneNumber = showAreaCode ? `${value.areaCode} ${formatPhoneNumber(value.number, value.areaCode)}` : value;

  return (
    <FormSummary.Answer>
      <DefaultLabel component={component} />
      <FormSummary.Value>{phoneNumber}</FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default SummaryPhoneNumber;
