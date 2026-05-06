import { FormSummary } from '@navikt/ds-react';
import { formatUtils } from '@navikt/skjemadigitalisering-shared-domain';
import DefaultLabel from '../../shared/form-summary/DefaultLabel';
import { FormComponentProps } from '../../types';
import formComponentUtils from '../../utils/formComponent';

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
