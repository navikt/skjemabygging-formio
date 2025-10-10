import { FormSummary } from '@navikt/ds-react';
import { useForm } from '../../../../context/form/FormContext';
import { FormComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';
import DefaultLabel from '../../shared/form-summary/DefaultLabel';
import { addressToString } from './addressUtils';

const SummaryAddress = ({ component, submissionPath }: FormComponentProps) => {
  const { submission } = useForm();
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined) {
    return null;
  }

  return (
    <FormSummary.Answer>
      <DefaultLabel
        component={{
          ...component,
          hideLabel: false,
        }}
      />
      <FormSummary.Value>{addressToString(value)}</FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default SummaryAddress;
