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
        {value.organizationNumber && (
          <FormSummary.Answer>
            <FormSummary.Label>{translate(labels.organizationNumber)}</FormSummary.Label>
            <FormSummary.Value>{value.organizationNumber}</FormSummary.Value>
          </FormSummary.Answer>
        )}
        {value.organizationName && (
          <FormSummary.Answer>
            <FormSummary.Label>{translate(labels.organizationName)}</FormSummary.Label>
            <FormSummary.Value>{value.organizationName}</FormSummary.Value>
          </FormSummary.Answer>
        )}
      </>
    );
  }

  return (
    <>
      {value.nationalIdentityNumber && (
        <FormSummary.Answer>
          <FormSummary.Label>{translate(labels.nationalIdentityNumber)}</FormSummary.Label>
          <FormSummary.Value>{value.nationalIdentityNumber}</FormSummary.Value>
        </FormSummary.Answer>
      )}
      {value.firstName && (
        <FormSummary.Answer>
          <FormSummary.Label>{translate(labels.firstName)}</FormSummary.Label>
          <FormSummary.Value>{value.firstName}</FormSummary.Value>
        </FormSummary.Answer>
      )}
      {value.surname && (
        <FormSummary.Answer>
          <FormSummary.Label>{translate(labels.surname)}</FormSummary.Label>
          <FormSummary.Value>{value.surname}</FormSummary.Value>
        </FormSummary.Answer>
      )}
    </>
  );
};

export default SummarySender;
