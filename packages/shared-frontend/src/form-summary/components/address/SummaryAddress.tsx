import { FormSummary } from '@navikt/ds-react';
import { addressToString, submissionUtils as formComponentUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { getPrefilledAddress } from '../../../components/address/addressUtils';
import { FormComponentProps } from '../../types';

const SummaryAddress = (props: FormComponentProps) => {
  const { component, submissionPath, submission, translate, currentLanguage } = props;
  const { label } = component;
  const value =
    formComponentUtils.getSubmissionValue(submissionPath, submission) ??
    getPrefilledAddress(
      {
        addressPriority: component.addressPriority,
        prefillValue: component.prefillValue,
      },
      currentLanguage,
    );

  if (value === undefined) {
    return null;
  }

  return (
    <FormSummary.Answer>
      <FormSummary.Label>{translate(label)}</FormSummary.Label>
      <FormSummary.Value>{addressToString(value)}</FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default SummaryAddress;
