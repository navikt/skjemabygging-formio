import { Form, NavFormType, SubmissionData, SubmissionSender } from '../../models';
import { navFormUtils } from '../form';

const getSender = (form: NavFormType | Form, submissionData: SubmissionData): SubmissionSender | undefined => {
  const senderComponent = navFormUtils
    .flattenComponents(form.components)
    .find((component) => component.type === 'sender' && submissionData[component.key]);

  if (senderComponent) {
    return submissionData[senderComponent.key] as SubmissionSender;
  }
};

const senderUtils = {
  getSender,
};

export { senderUtils };
