import { FormSummary } from '@navikt/ds-react';
import { numberUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { FormComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';
import DefaultLabel from '../../shared/form-summary/DefaultLabel';

const SummaryNumber = (props: FormComponentProps) => {
  const { submissionPath, submission } = props;
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined) {
    return null;
  }

  return (
    <FormSummary.Answer>
      <DefaultLabel {...props} />
      <FormSummary.Value>{numberUtils.toLocaleString(value)}</FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default SummaryNumber;
