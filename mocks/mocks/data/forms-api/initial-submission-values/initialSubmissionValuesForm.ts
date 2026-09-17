import { checkbox, navSelect, panel, radio, selectBoxes } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const initialSubmissionValuesForm = () => {
  const formNumber = 'initial-submission-values';
  const options = [
    { label: 'First option', value: 'first' },
    { label: 'Second option', value: 'second' },
  ];

  return form({
    title: 'Initial submission values test form',
    formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Defaults',
        components: [
          radio({
            key: 'defaultRadio',
            label: 'Default radio',
            values: options,
            defaultValue: 'second',
          }),
          checkbox({
            key: 'defaultCheckbox',
            label: 'Default checkbox',
            defaultValue: true,
          }),
          navSelect({
            key: 'defaultSelect',
            label: 'Default select',
            values: options,
            defaultValue: 'second',
            selectType: 'select',
          }),
          selectBoxes({
            key: 'defaultSelectBoxes',
            label: 'Default select boxes',
            values: options,
            defaultValue: { first: true, second: false },
          }),
          checkbox({
            key: 'showConditionalDefault',
            label: 'Show conditional default',
            defaultValue: true,
          }),
          radio({
            key: 'conditionalDefault',
            label: 'Conditional default',
            values: options,
            defaultValue: 'second',
            conditional: {
              show: true,
              when: 'showConditionalDefault',
              eq: 'true',
            },
          }),
        ],
      }),
      panel({
        title: 'Unvisited defaults',
        components: [
          radio({
            key: 'unvisitedDefault',
            label: 'Unvisited default',
            values: options,
            defaultValue: 'second',
          }),
        ],
      }),
    ],
  });
};

const initialSubmissionValuesTranslations = () => getMockTranslationsFromForm(initialSubmissionValuesForm());

export { initialSubmissionValuesForm, initialSubmissionValuesTranslations };
