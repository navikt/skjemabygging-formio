import { createSubmissionTypeForm, createSubmissionTypeTranslations } from '../shared/createSubmissionTypeForm';

const options = {
  title: 'Skyra survey form without slug',
  formNumber: 'SKYRA-SURVEY-NO-SLUG',
  path: 'skyrasurveynoslug',
  submissionTypes: ['DIGITAL' as const],
  includeAttachmentPanel: false,
  includeSelfDeclaration: false,
};

const skyraSurveyNoSlugForm = () => createSubmissionTypeForm(options);

const skyraSurveyNoSlugTranslations = () => createSubmissionTypeTranslations(options);

export { skyraSurveyNoSlugForm, skyraSurveyNoSlugTranslations };
