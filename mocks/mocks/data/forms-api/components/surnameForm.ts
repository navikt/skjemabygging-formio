import { panel, surname } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const surnameForm = () => {
  const formNumber = 'surname';

  return form({
    title: 'Surname component test form',
    formNumber: formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Visning',
        components: [
          surname({
            label: 'Etternavn',
          }),
          surname({
            label: 'Etternavn med beskrivelse',
            description: '<p>Dette er en beskrivelse</p>',
          }),
        ],
      }),
      panel({
        title: 'Validering',
        components: [
          surname({
            label: 'Etternavn påkrevd',
            validate: {
              required: true,
            },
          }),
          surname({
            label: 'Etternavn ikke påkrevd',
            validate: {
              required: false,
            },
          }),
        ],
      }),
    ],
  });
};

const surnameTranslations = () => {
  return getMockTranslationsFromForm(surnameForm());
};

export { surnameForm, surnameTranslations };
