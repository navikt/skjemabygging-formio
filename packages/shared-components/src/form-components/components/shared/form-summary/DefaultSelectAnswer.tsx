import { FormSummary } from '@navikt/ds-react';
import { FormComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';
import DefaultLabel from './DefaultLabel';

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
