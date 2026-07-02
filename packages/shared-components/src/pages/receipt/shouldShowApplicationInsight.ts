import {
  Form,
  NavFormType,
  senderUtils,
  SubmissionData,
  SubmissionMethod,
  yourInformationUtils,
} from '@navikt/skjemadigitalisering-shared-domain';

interface Params {
  form?: Form | NavFormType;
  submissionData?: SubmissionData;
  submissionMethod?: SubmissionMethod;
}

const shouldShowApplicationInsight = ({ form, submissionData, submissionMethod }: Params) => {
  if (!form || !submissionData || (submissionMethod !== 'digital' && submissionMethod !== 'digitalnologin')) {
    return false;
  }

  const sender = senderUtils.getSender(form, submissionData);

  if (sender?.organization) {
    return true;
  }

  const senderIdentityNumber = sender?.person?.nationalIdentityNumber;
  const yourInformationIdentityNumber = yourInformationUtils.getYourInformation(form, submissionData)?.identitet
    ?.identitetsnummer;

  return (
    !!senderIdentityNumber && !!yourInformationIdentityNumber && senderIdentityNumber !== yourInformationIdentityNumber
  );
};

export { shouldShowApplicationInsight };
