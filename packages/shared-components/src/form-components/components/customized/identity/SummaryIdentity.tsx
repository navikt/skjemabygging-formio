import { FormSummary } from '@navikt/ds-react';
import { dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useForm } from '../../../../context/form/FormContext';
import { FormComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';
import DefaultLabel from '../../shared/form-summary/DefaultLabel';

const SummaryIdentity = ({ component, submissionPath }: FormComponentProps) => {
  const { submission } = useForm();
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined || (!value?.identitetsnummer && !value?.fodselsdato)) {
    return null;
  }

  return (
    <FormSummary.Answer>
      <DefaultLabel component={component} />
      <FormSummary.Value>
        {value?.identitetsnummer ? value?.identitetsnummer : dateUtils.toLocaleDate(value?.fodselsdato)}
      </FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default SummaryIdentity;
