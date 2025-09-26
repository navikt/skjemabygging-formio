import { FormSummary } from '@navikt/ds-react';
import { formatNationalIdentityNumber } from '@navikt/skjemadigitalisering-shared-domain';
import { useForm } from '../../../../context/form/FormContext';
import { FormComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';
import DefaultLabel from '../../shared/form-summary/DefaultLabel';

const SummaryNationalIdentityNumber = ({ component, submissionPath }: FormComponentProps) => {
  const { submission } = useForm();
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined) {
    return null;
  }

  return (
    <FormSummary.Answer>
      <DefaultLabel component={component} />
      <FormSummary.Value>{formatNationalIdentityNumber(value)}</FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default SummaryNationalIdentityNumber;
