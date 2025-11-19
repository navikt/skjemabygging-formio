import { panel, textField } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';

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
            spellcheck: true,
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
            label: 'Tekstfelt A-B',
            key: 'textFielda',
            calculateValue: "value = (data.tekstfelta ?? '') + (data.tekstfeltb ?? '')",
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
            label: 'Tekstfelt kun siffer',
            validate: {
              digitsOnly: true,
            },
          }),
        ],
      }),
    ],
  });
};

export default textFieldForm;
