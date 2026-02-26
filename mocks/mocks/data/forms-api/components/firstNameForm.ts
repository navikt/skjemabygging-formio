import { firstName, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const firstNameForm = () => {
  const formNumber = 'firstname';

  return form({
    title: 'FirstName component test form',
    formNumber: formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Visning',
        components: [
          firstName({
            label: 'Fornavn',
          }),
          firstName({
            label: 'Fornavn med beskrivelse',
            description: '<p>Dette er en beskrivelse</p>',
          }),
        ],
      }),
      panel({
        title: 'Validering',
        components: [
          firstName({
            label: 'Fornavn påkrevd',
            validate: {
              required: true,
            },
          }),
          firstName({
            label: 'Fornavn ikke påkrevd',
            validate: {
              required: false,
            },
          }),
          firstName({
            label: 'Fornavn spesialtegn',
            validate: {
              required: false,
            },
          }),
        ],
      }),
    ],
  });
};

const firstNameTranslations = () => {
  return getMockTranslationsFromForm(firstNameForm());
};

export { firstNameForm, firstNameTranslations };
