import { FormSummary } from '@navikt/ds-react';
import { formatAccountNumber } from '@navikt/skjemadigitalisering-shared-domain';
import { useForm } from '../../../../context/form/FormContext';
import { FormComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';
import DefaultLabel from '../../shared/form-summary/DefaultLabel';

const SummaryAccountNumber = ({ component, submissionPath }: FormComponentProps) => {
  const { submission } = useForm();
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined) {
    return null;
  }

  return (
    <FormSummary.Answer>
      <DefaultLabel component={component} />
      <FormSummary.Value>{formatAccountNumber(value)}</FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default SummaryAccountNumber;
