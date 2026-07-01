import { createSubmissionTypeForm, createSubmissionTypeTranslations } from '../shared/createSubmissionTypeForm';

const introPagePaperForm = () =>
  createSubmissionTypeForm({
    title: 'Intro page paper form',
    formNumber: 'INTRO-PAGE-PAPER',
    path: 'intropagepaper',
    submissionTypes: ['PAPER'],
    includeAttachmentPanel: false,
  });

const introPagePaperTranslations = () =>
  createSubmissionTypeTranslations({
    title: 'Intro page paper form',
    formNumber: 'INTRO-PAGE-PAPER',
    path: 'intropagepaper',
    submissionTypes: ['PAPER'],
    includeAttachmentPanel: false,
  });

export { introPagePaperForm, introPagePaperTranslations };
