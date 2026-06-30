import { createSubmissionTypeForm, createSubmissionTypeTranslations } from '../shared/createSubmissionTypeForm';

const submissionTypesPaperForm = () =>
  createSubmissionTypeForm({
    title: 'Submission types paper form',
    formNumber: 'SUBMISSION-TYPES-PAPER',
    path: 'submissiontypespaper',
    submissionTypes: ['PAPER'],
    includeAttachmentLink: true,
    innsendingForklaring: 'Her er litt forklaring',
  });

const submissionTypesPaperTranslations = () =>
  createSubmissionTypeTranslations({
    title: 'Submission types paper form',
    formNumber: 'SUBMISSION-TYPES-PAPER',
    path: 'submissiontypespaper',
    submissionTypes: ['PAPER'],
    includeAttachmentLink: true,
    innsendingForklaring: 'Her er litt forklaring',
  });

export { submissionTypesPaperForm, submissionTypesPaperTranslations };
