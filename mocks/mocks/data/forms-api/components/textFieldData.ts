import { form, panel, textField } from '../../../utils/components';

const textFieldData = () => {
  return form({
    title: 'textField',
    formNumber: 'textField',
    components: [
      panel({
        title: 'textField panel',
        components: [
          textField({
            label: 'Visning',
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

export default textFieldData;
