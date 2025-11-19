import { panel, textField } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const textFieldForm = () => {
  const formNumber = 'textfield';

  return form({
    title: 'TextField component test form',
    formNumber: formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Visning',
        components: [
          textField({
            label: 'Tekstfelt',
          }),
          textField({
            label: 'Tekstfelt med beskrivelse',
            description: '<p>This is the description</p>',
            additionalDescriptionText: '<p>This is more description</p>',
            additionalDescriptionLabel: 'more',
          }),
          textField({
            label: 'Tekstfelt med egenskaper',
            autocomplete: 'name',
            spellCheck: true,
          }),
        ],
      }),
      panel({
        title: 'Data',
        components: [
          textField({
            label: 'Tekstfelt A',
            key: 'textFielda',
          }),
          textField({
            label: 'Tekstfelt B',
            key: 'textFieldb',
          }),
          textField({
            label: 'Tekstfelt A+B',
            key: 'textFieldab',
            calculateValue: "value = (row.textFielda ?? '') + (row.textFieldb ?? '')",
          }),
        ],
      }),
      panel({
        title: 'Validering',
        components: [
          textField({
            label: 'Tekstfelt påkrevd',
            validate: {
              required: true,
            },
          }),
          textField({
            label: 'Tekstfelt ikke påkrevd',
            validate: {
              required: false,
            },
          }),
          textField({
            label: 'Tekstfelt kun siffer',
            validate: {
              digitsOnly: true,
            },
          }),
          textField({
            label: 'Tekstfelt min og max lengde',
            validate: {
              minLength: 3,
              maxLength: 6,
            },
          }),
        ],
      }),
    ],
  });
};

const textFieldTranslations = () => {
  return getMockTranslationsFromForm(textFieldForm());
};

export { textFieldForm, textFieldTranslations };
