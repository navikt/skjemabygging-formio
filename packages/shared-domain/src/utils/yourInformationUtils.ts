import { NavFormType, Submission, SubmissionData } from '../form';
import { Form, navFormUtils } from '../index';
import SubmissionYourInformation from '../submission/yourInformation';

/**
 * Returns the first your information object from the submission data.
 * @param form
 * @param submissionData
 */
const getYourInformation = (
  form: NavFormType | Form,
  submissionData: SubmissionData,
): SubmissionYourInformation | undefined => {
  const yourInformationForm = navFormUtils
    .flattenComponents(form.components)
    .find((component) => component.yourInformation && submissionData[component.key]);

  if (yourInformationForm) {
    return submissionData[yourInformationForm.key] as SubmissionYourInformation;
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

export default yourInformationUtils;
