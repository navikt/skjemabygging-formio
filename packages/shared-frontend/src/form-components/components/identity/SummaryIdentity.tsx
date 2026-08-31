import { FormSummary } from '@navikt/ds-react';
import {
  submissionUtils as formComponentUtils,
  getIdentityLabel,
  getIdentityValue,
} from '@navikt/skjemadigitalisering-shared-domain';
import { IdentityDefinition } from '../../component-types';
import { FormComponentProps } from '../../types';

const SummaryIdentity = (props: FormComponentProps<IdentityDefinition>) => {
  const { submission, submissionPath, translate, component } = props;
  const value =
    formComponentUtils.getSubmissionValue(submissionPath, submission) ??
    (typeof component.prefillKey === 'string' && typeof submission.data?.[component.prefillKey] === 'string'
      ? { identitetsnummer: submission.data[component.prefillKey] }
      : undefined) ??
    (typeof submission.data?.fodselsnummerDNummerSoker === 'string'
      ? { identitetsnummer: submission.data.fodselsnummerDNummerSoker }
      : undefined);

  if (value === undefined || (!value?.identitetsnummer && !value?.fodselsdato)) {
    return null;
  }

  return (
    <FormSummary.Answer>
      <FormSummary.Label>{translate(getIdentityLabel(value))}</FormSummary.Label>
      <FormSummary.Value>{getIdentityValue(value)}</FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default SummaryIdentity;
