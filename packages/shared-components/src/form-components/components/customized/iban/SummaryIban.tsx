import { FormSummary } from '@navikt/ds-react';
import { formatUtils, submissionUtils as formComponentUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { FormComponentProps } from '../../../types';
import DefaultLabel from '../../shared/form-summary/DefaultLabel';

const SummaryIban = (props: FormComponentProps) => {
  const { submission, submissionPath } = props;
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined) {
    return null;
  }

  return (
    <FormSummary.Answer>
      <DefaultLabel {...props} />
      <FormSummary.Value>{formatUtils.formatIBAN(value)}</FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default SummaryIban;
