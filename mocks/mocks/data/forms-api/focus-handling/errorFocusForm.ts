import { checkbox, panel, radio, textField } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const errorFocusForm = () =>
  form({
    title: 'Error focus navigation',
    formNumber: 'errorfocus',
    path: 'errorfocus',
    properties: formProperties({ formNumber: 'errorfocus', submissionTypes: ['PAPER'] }),
    components: [
      panel({
        key: 'answers',
        title: 'Answers',
        components: [
          textField({ key: 'answer', label: 'Answer' }),
          radio({
            key: 'choice',
            label: 'Choice',
            values: [
              { label: 'First choice', value: 'first' },
              { label: 'Second choice', value: 'second' },
            ],
          }),
          checkbox({ key: 'showDetails', label: 'Show details', validate: { required: false } }),
          textField({
            key: 'details',
            label: 'Details',
            validate: { required: false },
            conditional: { when: 'showDetails', eq: 'true', show: true },
          }),
        ],
      }),
      panel({
        key: 'followup',
        title: 'Follow-up',
        components: [textField({ key: 'followupAnswer', label: 'Additional answer', validate: { required: false } })],
      }),
    ],
  });

const errorFocusTranslations = () => getMockTranslationsFromForm(errorFocusForm());

export { errorFocusForm, errorFocusTranslations };
