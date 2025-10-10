import { FormSummary } from '@navikt/ds-react';
import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { useForm } from '../../../../context/form/FormContext';
import formComponentUtils from '../../../utils/formComponent';
import DefaultLabel from './DefaultLabel';

interface Props {
  component: Component;
  submissionPath: string;
  valueFormat?: (value: any) => string | number;
}

const DefaultAnswer = ({ component, submissionPath, valueFormat }: Props) => {
  const { submission } = useForm();
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined) {
    return null;
  }

  return (
    <FormSummary.Answer>
      <DefaultLabel component={component} />
      <FormSummary.Value>{valueFormat === undefined ? value : valueFormat(value)}</FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default DefaultAnswer;
