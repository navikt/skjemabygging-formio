import { FormSummary } from '@navikt/ds-react';
import { FormComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const SummarySender = (props: FormComponentProps) => {
  const { component, submissionPath, submission, translate } = props;
  const { senderRole, labels = {} } = component;
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined) {
    return null;
  }

  if (senderRole === 'organization') {
    return (
      <>
        {value.organization?.number && (
          <FormSummary.Answer>
            <FormSummary.Label>{translate(labels.organizationNumber)}</FormSummary.Label>
            <FormSummary.Value>{value.organization.number}</FormSummary.Value>
          </FormSummary.Answer>
        )}
        {value.organization?.name && (
          <FormSummary.Answer>
            <FormSummary.Label>{translate(labels.organizationName)}</FormSummary.Label>
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
          <FormSummary.Label>{translate(labels.nationalIdentityNumber)}</FormSummary.Label>
          <FormSummary.Value>{value.person.nationalIdentityNumber}</FormSummary.Value>
        </FormSummary.Answer>
      )}
      {value.person?.firstName && (
        <FormSummary.Answer>
          <FormSummary.Label>{translate(labels.firstName)}</FormSummary.Label>
          <FormSummary.Value>{value.person.firstName}</FormSummary.Value>
        </FormSummary.Answer>
      )}
      {value.person?.surname && (
        <FormSummary.Answer>
          <FormSummary.Label>{translate(labels.surname)}</FormSummary.Label>
          <FormSummary.Value>{value.person.surname}</FormSummary.Value>
        </FormSummary.Answer>
      )}
    </>
  );
};

export default SummarySender;
