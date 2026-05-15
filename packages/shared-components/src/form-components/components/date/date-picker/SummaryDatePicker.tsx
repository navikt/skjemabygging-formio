import { FormSummary } from '@navikt/ds-react';
import { dateUtils, submissionUtils as formComponentUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { FormComponentProps } from '../../../types';
import DefaultLabel from '../../shared/form-summary/DefaultLabel';

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
