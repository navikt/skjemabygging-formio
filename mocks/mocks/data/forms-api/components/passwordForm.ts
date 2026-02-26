import { panel, password } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const passwordForm = () => {
  const formNumber = 'password';

  return form({
    title: 'Password component test form',
    formNumber: formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Visning',
        components: [
          password({
            label: 'Passord',
          }),
          password({
            label: 'Passord med beskrivelse',
            description: '<p>Dette er en beskrivelse</p>',
            additionalDescriptionText: '<p>Dette er utvidet beskrivelse</p>',
            additionalDescriptionLabel: 'mer',
          }),
        ],
      }),
      panel({
        title: 'Validering',
        components: [
          password({
            label: 'Passord påkrevd',
          }),
          password({
            label: 'Passord ikke påkrevd',
            validate: { required: false },
          }),
          password({
            label: 'Passord min og max',
            validate: { required: false, minLength: 8, maxLength: 16 },
          }),
          password({
            label: 'Passord egendefinert',
            validate: { required: false, custom: 'valid = input === "hemmelig" ? true : "Kun hemmelig er tillatt"' },
          }),
        ],
      }),
    ],
  });
};

const passwordTranslations = () => getMockTranslationsFromForm(passwordForm());

export { passwordForm, passwordTranslations };
