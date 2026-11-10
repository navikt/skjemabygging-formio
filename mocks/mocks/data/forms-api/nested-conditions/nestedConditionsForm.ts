import { alert, checkbox, container, formGroup, panel, textField } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { formIntroPageWithoutSelfDeclaration } from '../../../form-builder/form/formIntroPage';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const nestedConditionsForm = () =>
  form({
    title: 'Nested conditions',
    formNumber: 'nestedconditions',
    path: 'nestedconditions',
    introPage: formIntroPageWithoutSelfDeclaration(),
    components: [
      panel({
        key: 'expenses',
        title: 'Expenses',
        components: [
          checkbox({ key: 'includeDetails', label: 'Root toggle', validate: { required: false } }),
          container({
            key: 'journey',
            label: 'Journey',
            components: [
              formGroup({
                key: 'travel',
                label: 'Travel',
                components: [
                  container({
                    key: 'expenses',
                    label: 'Expenses',
                    components: [
                      checkbox({
                        key: 'includeDetails',
                        label: 'Include expense details',
                        validate: { required: false },
                      }),
                      formGroup({
                        key: 'documentation',
                        label: 'Documentation',
                        components: [
                          alert({
                            key: 'notice',
                            content: '<p>Include documentation for these expenses.</p>',
                            customConditional: 'show = row.includeDetails === true;',
                          }),
                          textField({
                            key: 'details',
                            label: 'Expense details',
                            validate: { required: true },
                            customConditional: 'show = row.includeDetails === true;',
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

const nestedConditionsTranslations = () => getMockTranslationsFromForm(nestedConditionsForm());

export { nestedConditionsForm, nestedConditionsTranslations };
