import { createSubmissionTypeForm, createSubmissionTypeTranslations } from '../shared/createSubmissionTypeForm';

const submissionTypesNoneForm = () =>
  createSubmissionTypeForm({
    title: 'Submission types none form',
    formNumber: 'SUBMISSION-TYPES-NONE',
    path: 'submissiontypesnone',
    submissionTypes: [],
    includeAttachmentLink: true,
    innsendingForklaring: 'Her er litt forklaring',
  });

const submissionTypesNoneTranslations = () =>
  createSubmissionTypeTranslations({
    title: 'Submission types none form',
    formNumber: 'SUBMISSION-TYPES-NONE',
    path: 'submissiontypesnone',
    submissionTypes: [],
    includeAttachmentLink: true,
    innsendingForklaring: 'Her er litt forklaring',
  });

export { submissionTypesNoneForm, submissionTypesNoneTranslations };
