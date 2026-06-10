import { FormSummary } from '@navikt/ds-react';
import { submissionUtils as formComponentUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { FormComponentProps } from '../../types';

const SummarySender = (props: FormComponentProps) => {
  const { component, submissionPath, submission, translate } = props;
  const { senderRole, customLabels = {} } = component;
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined) {
    return null;
  }

  if (senderRole === 'organization') {
    return (
      <>
        {value.organization?.number && (
          <FormSummary.Answer>
            <FormSummary.Label>{translate(customLabels.organizationNumber)}</FormSummary.Label>
            <FormSummary.Value>{value.organization.number}</FormSummary.Value>
          </FormSummary.Answer>
        )}
        {value.organization?.name && (
          <FormSummary.Answer>
            <FormSummary.Label>{translate(customLabels.organizationName)}</FormSummary.Label>
            <FormSummary.Value>{value.organization.name}</FormSummary.Value>
          </FormSummary.Answer>
        )}
      </>
    );
  }

  return (
    <>
      {value.person?.nationalIdentityNumber && (
        <FormSummary.Answer>
          <FormSummary.Label>{translate(customLabels.nationalIdentityNumber)}</FormSummary.Label>
          <FormSummary.Value>{value.person.nationalIdentityNumber}</FormSummary.Value>
        </FormSummary.Answer>
      )}
      {value.person?.firstName && (
        <FormSummary.Answer>
          <FormSummary.Label>{translate(customLabels.firstName)}</FormSummary.Label>
          <FormSummary.Value>{value.person.firstName}</FormSummary.Value>
        </FormSummary.Answer>
      )}
      {value.person?.surname && (
        <FormSummary.Answer>
          <FormSummary.Label>{translate(customLabels.surname)}</FormSummary.Label>
          <FormSummary.Value>{value.person.surname}</FormSummary.Value>
        </FormSummary.Answer>
      )}
    </>
  );
};

export default SummarySender;
