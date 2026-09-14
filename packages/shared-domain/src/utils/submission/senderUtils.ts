import { Form, NavFormType, SubmissionData, SubmissionSender } from '../../models';
import { submissionUtils } from './submissionUtils';

const getSender = (form: NavFormType | Form, submissionData: SubmissionData): SubmissionSender | undefined => {
  const submission = { data: submissionData };

  for (const { component, submissionPath } of submissionUtils.flattenComponentsWithPath(form.components)) {
    if (component.type === 'sender') {
      const value = submissionUtils.getSubmissionValue(submissionPath, submission);
      if (value !== undefined) {
        return value as SubmissionSender;
      }
    }
  }
};

const senderUtils = {
  getSender,
};

export { senderUtils };
