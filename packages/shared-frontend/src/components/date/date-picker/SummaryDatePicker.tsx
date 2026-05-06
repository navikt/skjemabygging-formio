import { FormSummary } from '@navikt/ds-react';
import { dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import DefaultLabel from '../../shared/form-summary/DefaultLabel';
import { FormComponentProps } from '../../types';
import formComponentUtils from '../../utils/formComponent';

const SummaryDatePicker = (props: FormComponentProps) => {
  const { submission, submissionPath } = props;
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined) {
    return null;
  }

  return (
    <FormSummary.Answer>
      <DefaultLabel {...props} />
      <FormSummary.Value>{dateUtils.toLocaleDate(value)}</FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default SummaryDatePicker;
