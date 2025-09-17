import { FormSummary } from '@navikt/ds-react';
import { useForm } from '../../../../context/form/FormContext';
import { useLanguages } from '../../../../context/languages';
import { FormComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const SummaryActivities = ({ component, submissionPath }: FormComponentProps) => {
  const { label } = component;
  const { submission } = useForm();
  const { translate } = useLanguages();
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined) {
    return null;
  }

  /**
   * We cant use default label since the label is actually marked as hidden on Activity, even though we want to show it.
   */
  return (
    <FormSummary.Answer>
      <FormSummary.Label>{translate(label)}</FormSummary.Label>
      <FormSummary.Value>{value.text}</FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default SummaryActivities;
