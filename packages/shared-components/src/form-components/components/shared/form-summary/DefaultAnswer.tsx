import { FormSummary } from '@navikt/ds-react';
import { submissionUtils as formComponentUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { FormComponentProps } from '../../../types';
import DefaultLabel from './DefaultLabel';

interface Props extends FormComponentProps {
  valueFormat?: (value: any) => string | number;
}

const DefaultAnswer = (props: Props) => {
  const { submissionPath, submission, valueFormat } = props;
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined) {
    return null;
  }

  return (
    <FormSummary.Answer>
      <DefaultLabel {...props} />
      <FormSummary.Value>{valueFormat === undefined ? value : valueFormat(value)}</FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default DefaultAnswer;
