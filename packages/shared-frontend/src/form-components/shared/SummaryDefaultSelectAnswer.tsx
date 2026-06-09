import { FormSummary } from '@navikt/ds-react';
import { submissionUtils as formComponentUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { FormComponentProps } from '../types';
import DefaultLabel from './SummaryDefaultLabel';

const DefaultSelectAnswer = (props: FormComponentProps) => {
  const { submissionPath, submission, translate } = props;
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value?.label === undefined) {
    return null;
  }

  return (
    <FormSummary.Answer>
      <DefaultLabel {...props} />
      <FormSummary.Value>{translate(value?.label)}</FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default DefaultSelectAnswer;
