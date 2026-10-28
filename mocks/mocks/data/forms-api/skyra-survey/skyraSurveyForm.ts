import { createSubmissionTypeForm, createSubmissionTypeTranslations } from '../shared/createSubmissionTypeForm';

const options = {
  title: 'Skyra survey form',
  formNumber: 'SKYRA-SURVEY',
  path: 'skyrasurvey',
  submissionTypes: ['DIGITAL' as const],
  includeAttachmentPanel: false,
  includeSelfDeclaration: false,
};

const skyraSurveySlug = 'fyllut-cypress-survey';

const skyraSurveyForm = () => {
  const form = createSubmissionTypeForm(options);
  return { ...form, properties: { ...form.properties, skyraSlug: skyraSurveySlug } };
};

const skyraSurveyTranslations = () => createSubmissionTypeTranslations(options);

export { skyraSurveyForm, skyraSurveySlug, skyraSurveyTranslations };
