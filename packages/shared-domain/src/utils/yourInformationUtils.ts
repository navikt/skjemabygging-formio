import { NavFormType, SubmissionData } from '../form';
import { navFormUtils } from '../index';
import SubmissionYourInformation from '../submission/yourInformation';

/**
 * Returns the first your information object from the submission data.
 * @param form
 * @param submission
 */
const getYourInformation = (form: NavFormType, submission: SubmissionData): SubmissionYourInformation | undefined => {
  const yourInformationForm = navFormUtils
    .flattenComponents(form.components)
    .find((component) => component.yourInformation && submission[component.key]);

  if (yourInformationForm) {
    return submission[yourInformationForm.key] as SubmissionYourInformation;
  }
};

const yourInformationUtils = {
  getYourInformation,
};

export default yourInformationUtils;
