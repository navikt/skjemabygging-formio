import { Form, NavFormType, Submission, SubmissionData, SubmissionYourInformation } from '../../models';
import { submissionUtils } from './submissionUtils';

/**
 * Returns the first your information object from the submission data.
 * @param form
 * @param submissionData
 */
const getYourInformation = (
  form: NavFormType | Form,
  submissionData: SubmissionData,
): SubmissionYourInformation | undefined => {
  const submission = { data: submissionData };

  for (const { component, submissionPath } of submissionUtils.flattenComponentsWithPath(form.components)) {
    if (component.yourInformation) {
      const value = submissionUtils.getSubmissionValue(submissionPath, submission);
      if (value !== undefined) {
        return value as SubmissionYourInformation;
      }
    }
  }
};

const getIdentityNumber = (form: NavFormType | Form, submission?: Submission) => {
  if (submission?.data) {
    const yourInformation = yourInformationUtils.getYourInformation(form, submission.data);
    if (yourInformation?.identitet?.identitetsnummer) {
      return yourInformation.identitet.identitetsnummer;
    } else if (submission?.data?.fodselsnummerDNummerSoker) {
      // This is the old format of the object, which is still used in some forms.
      return submission.data.fodselsnummerDNummerSoker as string;
    }
  }

  return undefined;
};

const yourInformationUtils = {
  getYourInformation,
  getIdentityNumber,
};

export { yourInformationUtils };
