import { FormSummary } from '@navikt/ds-react';
import { formatNationalIdentityNumber } from '@navikt/skjemadigitalisering-shared-domain';
import { FormComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';
import DefaultLabel from '../../shared/form-summary/DefaultLabel';

const SummaryNationalIdentityNumber = (props: FormComponentProps) => {
  const { submission, submissionPath } = props;
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined) {
    return null;
  }

  return (
    <FormSummary.Answer>
      <DefaultLabel {...props} />
      <FormSummary.Value>{formatNationalIdentityNumber(value)}</FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default SummaryNationalIdentityNumber;
