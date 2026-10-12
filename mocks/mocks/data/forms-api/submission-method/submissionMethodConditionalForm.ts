import { checkbox, panel, textField } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { formIntroPageWithoutSelfDeclaration } from '../../../form-builder/form/formIntroPage';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const submissionMethodConditionalForm = () =>
  form({
    title: 'Submission method conditional',
    formNumber: 'submissionmethodconditional',
    path: 'submissionmethodconditional',
    components: [
      panel({
        title: 'Applicant',
        key: 'applicant',
        components: [
          textField({
            key: 'applicantName',
            label: 'Applicant name',
          }),
          checkbox({
            key: 'digitalOnlyConfirmation',
            label: 'Digital only confirmation',
            customConditional: 'show = instance.isSubmissionDigital();',
          }),
        ],
      }),
    ],
    introPage: formIntroPageWithoutSelfDeclaration(),
    properties: formProperties({
      formNumber: 'submissionmethodconditional',
      submissionTypes: ['PAPER', 'DIGITAL'],
    }),
  });

const submissionMethodConditionalTranslations = () => getMockTranslationsFromForm(submissionMethodConditionalForm());

export { submissionMethodConditionalForm, submissionMethodConditionalTranslations };
