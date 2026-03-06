import { panel, textArea } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const textAreaForm = () => {
  const formNumber = 'textarea';

  return form({
    title: 'TextArea component test form',
    formNumber: formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Visning',
        components: [
          textArea({
            label: 'Tekstområde',
          }),
          textArea({
            label: 'Tekstområde med beskrivelse',
            description: '<p>Dette er en beskrivelse</p>',
            additionalDescriptionText: '<p>Dette er utvidet beskrivelse</p>',
            additionalDescriptionLabel: 'mer',
          }),
          textArea({
            label: 'Tekstområde fast høyde',
            autoExpand: false,
          }),
        ],
      }),
      panel({
        title: 'Validering',
        components: [
          textArea({
            label: 'Tekstområde påkrevd',
            validate: {
              required: true,
            },
          }),
          textArea({
            label: 'Tekstområde ikke påkrevd',
            validate: {
              required: false,
            },
          }),
          textArea({
            label: 'Tekstområde min og max',
            validate: {
              minLength: 3,
              maxLength: 10,
            },
          }),
          textArea({
            label: 'Tekstområde egendefinert',
            validate: {
              custom: 'valid = input === "abc" ? true : "abc er eneste lovlige verdien"',
            },
          }),
        ],
      }),
    ],
  });
};

const textAreaTranslations = () => {
  return getMockTranslationsFromForm(textAreaForm());
};

export { textAreaForm, textAreaTranslations };
